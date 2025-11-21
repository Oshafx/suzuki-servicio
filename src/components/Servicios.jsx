import React, { useState, useEffect } from "react";
import { db } from "../firebaseConfig";
import { 
  collection, addDoc, serverTimestamp, getDocs, 
  orderBy, query, doc, deleteDoc, updateDoc, limit 
} from "firebase/firestore";
import "./Servicios.css"; 

const Servicios = () => {
  // --- ESTADO INICIAL ---
  const initialState = {
    fecha: new Date().toLocaleDateString(),
    horaRecepcion: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    horaEntrega: "",
    cliente: "", telefono: "", email: "", celular: "",
    vehiculo: "", vin: "", placas: "", anio: "", kilometraje: "", color: "",
    noOrden: "", // Se calculará automáticamente
    motivo: "", 
    tierraCarroceria: false,
    
    // INTERIORES (Opera: Si/No/NC)
    poliza: "si", seguroRines: "si", indicadores: "no",
    abs: "no", rociador: "si", claxon: "si", 
    radio: "si", pantalla: "si", ac: "si", 
    encendedor: "si", vidrios: "si", espejos: "si", 
    segurosElec: "si", guantera: "si", asientos: "si", tapetes: "si",

    // Coordenadas para las tachas en el TABLERO
    indicadoresCoords: [], 

    // CONDICIONES CARROCERIA (Ahora son textos "si"/"no", no booleanos)
    golpes: "no", roto: "no", rayones: "no",
    
    // Coordenadas para las tachas en el AUTO
    danosCoords: [], 

    // NIVELES (Tabla)
    aceiteMotor: "si", liquidoFrenos: "si", 
    limpiaParabrisas: "si", anticongelante: "si", liquidoDireccion: "si",

    // EXTERIORES (Tabla)
    tapones: "si", gomas: "si", antena: "si", taponGas: "si",

    // INVENTARIO / CAJUELA
    herramienta: "si", gato: "si", reflejantes: "si", 
    cables: "si", extintor: "si", llantaRefaccion: "si",
    
    articulosPromocionales: "",
    asesor: "",
    gasolina: "25"
  };

  const [orden, setOrden] = useState(initialState);
  const [listaServicios, setListaServicios] = useState([]);
  const [editId, setEditId] = useState(null); 
  const [guardando, setGuardando] = useState(false);
  const serviciosCollection = collection(db, "servicios");

  // --- CARGAR DATOS Y CALCULAR FOLIO ---
  const fetchServicios = async () => {
    try {
      // Traemos las órdenes ordenadas por fecha de creación
      const q = query(serviciosCollection, orderBy("creado", "desc"));
      const data = await getDocs(q);
      setListaServicios(data.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) { console.error(error); }
  };

  // Función para obtener el siguiente número de orden disponible
  const obtenerSiguienteFolio = async () => {
    try {
      // Consultamos solo la orden con el número más alto (orden descendente por noOrden)
      const q = query(serviciosCollection, orderBy("noOrden", "desc"), limit(1));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const ultimaOrden = querySnapshot.docs[0].data();
        // Si existe una orden, le sumamos 1. Si no es un número válido, regresamos al 700
        const siguiente = (parseInt(ultimaOrden.noOrden) || 699) + 1;
        setOrden(prev => ({ ...prev, noOrden: siguiente }));
      } else {
        // Si no hay ninguna orden en la base de datos, empezamos en 700
        setOrden(prev => ({ ...prev, noOrden: 700 }));
      }
    } catch (error) {
      console.error("Error al calcular folio:", error);
      // Fallback en caso de error
      setOrden(prev => ({ ...prev, noOrden: 700 }));
    }
  };

  useEffect(() => { 
    fetchServicios(); 
    // Solo calculamos el folio si NO estamos editando (es decir, al cargar la página para una nueva orden)
    if (!editId) {
      obtenerSiguienteFolio();
    }
  }, [editId]); // Dependencia editId para que si cancelamos edición, recalcule el folio nuevo

  // --- MANEJAR CAMBIOS EN INPUTS ---
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setOrden({ ...orden, [name]: type === "checkbox" ? checked : value });
  };

  // ============================================================
  // LÓGICA INTERACTIVA (CLICS EN IMÁGENES)
  // ============================================================

  const agregarMarcaAuto = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const xPorc = ((e.clientX - rect.left) / rect.width) * 100;
    const yPorc = ((e.clientY - rect.top) / rect.height) * 100;

    setOrden(prev => ({
      ...prev,
      danosCoords: [...(prev.danosCoords || []), { x: xPorc, y: yPorc }]
    }));
  };

  const eliminarMarcaAuto = (index, e) => {
    e.stopPropagation(); 
    const nuevasCoords = orden.danosCoords.filter((_, i) => i !== index);
    setOrden({ ...orden, danosCoords: nuevasCoords });
  };

  const agregarMarcaTablero = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const xPorc = ((e.clientX - rect.left) / rect.width) * 100;
    const yPorc = ((e.clientY - rect.top) / rect.height) * 100;

    setOrden(prev => ({
      ...prev,
      indicadoresCoords: [...(prev.indicadoresCoords || []), { x: xPorc, y: yPorc }]
    }));
  };

  const eliminarMarcaTablero = (index, e) => {
    e.stopPropagation();
    const nuevasCoords = orden.indicadoresCoords.filter((_, i) => i !== index);
    setOrden({ ...orden, indicadoresCoords: nuevasCoords });
  };

  // ============================================================

  // --- GUARDAR / ACTUALIZAR ---
  const guardarServicio = async () => {
    if (!orden.cliente || !orden.vehiculo) { alert("Falta Cliente o Vehículo"); return; }
    setGuardando(true);
    
    // Asegurar que noOrden sea un número para que el ordenamiento funcione bien (700, 701...)
    const datosAGuardar = {
      ...orden,
      noOrden: parseInt(orden.noOrden) || 0 // Convertir a entero
    };

    try {
      if (editId) {
        // MODO EDICIÓN: Agregamos campo 'editado' con la fecha actual
        await updateDoc(doc(db, "servicios", editId), { 
          ...datosAGuardar, 
          editado: serverTimestamp() 
        });
        alert("Orden Actualizada Correctamente");
        setEditId(null);
      } else {
        // MODO CREACIÓN: Agregamos campo 'creado' y estado inicial
        await addDoc(serviciosCollection, { 
          ...datosAGuardar, 
          estado: "abierto", 
          creado: serverTimestamp() 
        });
        alert(`Orden #${datosAGuardar.noOrden} Creada Correctamente`);
      }
      
      // Resetear formulario
      setOrden(initialState);
      obtenerSiguienteFolio(); // Calcular el siguiente folio para la nueva orden
      fetchServicios();
    } catch (error) { 
      console.error(error);
      alert("Error al guardar la orden"); 
    }
    setGuardando(false);
  };

  const cargarParaEditar = (item) => { 
    setOrden(item); 
    setEditId(item.id); 
    window.scrollTo(0,0); 
  };
  
  const eliminarServicio = async (id) => {
    if(window.confirm("¿Borrar esta orden?")) { 
        await deleteDoc(doc(db, "servicios", id)); 
        fetchServicios(); 
    }
  };

  const cancelarEdicion = () => {
    setEditId(null);
    setOrden(initialState);
    obtenerSiguienteFolio(); // Recalcular folio al cancelar
  };

  // Componente auxiliar para filas de checklist
  const FilaCheck = ({ label, name, val }) => (
    <div className="check-row-grid">
      <span className="check-label">{label}</span>
      <div className="check-opts">
        <label className={`opt-label ${val === 'si' ? 'selected' : ''}`}>
            <input type="radio" name={name} value="si" checked={val === "si"} onChange={handleChange}/> ✓
        </label>
        <label className={`opt-label ${val === 'no' ? 'selected' : ''}`}>
            <input type="radio" name={name} value="no" checked={val === "no"} onChange={handleChange}/> X
        </label>
        <label className={`opt-label ${val === 'nc' ? 'selected' : ''}`}>
            <input type="radio" name={name} value="nc" checked={val === "nc"} onChange={handleChange}/> N/C
        </label>
      </div>
    </div>
  );

  return (
    <div className="servicio-container">
      <div className={`hoja-suzuki ${editId ? 'modo-edicion' : ''}`}>
        
        {/* ENCABEZADO */}
        <div className="header-row">
          <div className="logo-section">
            <img src="/logo-suzuki.png" alt="Suzuki Logo" className="logo-img" />
            <div className="direccion-text">
                <strong>SUZUKI TAMPICO</strong><br/>
                Ave. Hidalgo 6307 Col. Choferes<br/>
                C.P. 89337 Tampico, Tamps.<br/>
                Tel. 834 110 24 24
            </div>
          </div>
          <div className="titulo-orden">
            <h2>ORDEN DE SERVICIO</h2>
            <div className="fechas-grid">
               <div className="fecha-item"><strong>FECHA:</strong> {orden.fecha}</div>
               <div className="fecha-item"><strong>HORA REC:</strong> {orden.horaRecepcion}</div>
            </div>
          </div>
        </div>

        {/* DATOS GENERALES */}
        <div className="grid-datos">
          <div className="campo-papel col-full">
            <label>CLIENTE:</label>
            <input name="cliente" value={orden.cliente} onChange={handleChange} className="input-papel"/>
          </div>
          
          <div className="campo-papel col-2">
            <label>VEHÍCULO:</label>
            <input name="vehiculo" value={orden.vehiculo} onChange={handleChange} className="input-papel"/>
          </div>
          <div className="campo-papel col-2">
            <label>AÑO:</label>
            <input name="anio" value={orden.anio} onChange={handleChange} className="input-papel"/>
          </div>

          <div className="campo-papel col-2">
            <label>VIN:</label>
            <input name="vin" value={orden.vin} onChange={handleChange} className="input-papel"/>
          </div>
          <div className="campo-papel col-2">
            <label>KILOMETRAJE:</label>
            <input name="kilometraje" value={orden.kilometraje} onChange={handleChange} className="input-papel"/>
          </div>

          <div className="campo-papel col-2">
            <label>PLACAS:</label>
            <input name="placas" value={orden.placas} onChange={handleChange} className="input-papel"/>
          </div>
          <div className="campo-papel col-2">
            <label>HORA ENTREGA:</label>
            <input name="horaEntrega" value={orden.horaEntrega} onChange={handleChange} className="input-papel"/>
          </div>

          <div className="campo-papel col-2">
            <label>TELÉFONO:</label>
            <input name="telefono" value={orden.telefono} onChange={handleChange} className="input-papel"/>
          </div>
          <div className="campo-papel col-2">
            <label>CELULAR:</label>
            <input name="celular" value={orden.celular} onChange={handleChange} className="input-papel"/>
          </div>

          <div className="campo-papel col-2">
            <label>EMAIL:</label>
            <input name="email" value={orden.email} onChange={handleChange} className="input-papel"/>
          </div>

          {/* CAMPO DE NO. ORDEN (EDITABLE PERO AUTOMÁTICO) */}
          <div className="campo-papel col-2">
            <label style={{color: '#B91C1C', fontWeight:'900'}}>NO. ORDEN:</label>
            <input 
              type="number" 
              name="noOrden" 
              value={orden.noOrden} 
              onChange={handleChange} 
              className="input-papel" 
              style={{color: '#B91C1C', fontWeight:'bold', fontSize:'1.2rem'}}
            />
          </div>
        </div>

        {/* MOTIVO */}
        <div className="seccion-motivo">
          <div className="header-seccion">MOTIVO DE VISITA / COMENTARIOS</div>
          <textarea name="motivo" value={orden.motivo} onChange={handleChange} className="area-motivo" placeholder="Describa el servicio..." />
          <label className="check-simple">
             <input type="checkbox" name="tierraCarroceria" checked={orden.tierraCarroceria} onChange={handleChange}/> 
             TIERRA EN CARROCERÍA NO SE APRECIA AL 100%
          </label>
        </div>

        {/* CHECKLISTS COMPLETOS */}
        <div className="checklist-grid-completo">
          
          {/* COLUMNA 1: INTERIORES + TABLERO */}
          <div className="col-check">
            <div className="header-tabla">
                <span>Interiores</span>
                <span style={{fontSize: '0.7rem'}}>SI (✓) NO (X) NC</span>
            </div>
            <div className="tabla-body">
                <FilaCheck label="Póliza / Manual" name="poliza" val={orden.poliza} />
                <FilaCheck label="Seguro Rines" name="seguroRines" val={orden.seguroRines} />
                <FilaCheck label="Rociador / Limpia" name="rociador" val={orden.rociador} />
                <FilaCheck label="Claxon" name="claxon" val={orden.claxon} />
                <FilaCheck label="Radio / Carátula" name="radio" val={orden.radio} />
                <FilaCheck label="Pantalla / FIS" name="pantalla" val={orden.pantalla} />
                <FilaCheck label="A/C" name="ac" val={orden.ac} />
                <FilaCheck label="Encendedor" name="encendedor" val={orden.encendedor} />
                <FilaCheck label="Vidrios" name="vidrios" val={orden.vidrios} />
                <FilaCheck label="Espejos" name="espejos" val={orden.espejos} />
                <FilaCheck label="Seguros Eléctricos" name="segurosElec" val={orden.segurosElec} />
                <FilaCheck label="Guantera" name="guantera" val={orden.guantera} />
                <FilaCheck label="Asientos / Vestiduras" name="asientos" val={orden.asientos} />
                <FilaCheck label="Tapetes" name="tapetes" val={orden.tapetes} />
                
                {/* --- TABLERO INTERACTIVO --- */}
                <div className="sub-seccion">
                   <strong>Indicadores Activados:</strong>
                   <div className="contenedor-tablero" onClick={agregarMarcaTablero}>
                      <img src="/tablero-iconos.png" alt="Iconos Tablero" className="img-tablero" />
                      {(orden.indicadoresCoords || []).map((coord, index) => (
                        <div 
                          key={index} 
                          className="marca-dano"
                          style={{ left: `${coord.x}%`, top: `${coord.y}%` }}
                          onClick={(e) => eliminarMarcaTablero(index, e)}
                          title="Clic para borrar"
                        >
                          X
                        </div>
                      ))}
                   </div>
                   <small style={{color:'#999', fontSize:'0.6rem'}}>* Clic en el icono para marcar</small>
                </div>
            </div>
          </div>

          {/* COLUMNA 2: CARROCERIA (INTERACTIVO) */}
          <div className="col-check">
             <div className="header-tabla">Condiciones de Carrocería</div>
             <div className="tabla-body center-content">
                 
                 {/* --- NUEVA SECCIÓN SI/NO --- */}
                 <div className="contenedor-danos-sino">
                    <div className="fila-dano">
                        <span className="dano-label">Golpes ●</span>
                        <div className="dano-radios">
                            <label className={orden.golpes === 'si' ? 'selected' : ''}>
                                <input type="radio" name="golpes" value="si" checked={orden.golpes === "si"} onChange={handleChange}/> Si
                            </label>
                            <label className={orden.golpes === 'no' ? 'selected' : ''}>
                                <input type="radio" name="golpes" value="no" checked={orden.golpes === "no"} onChange={handleChange}/> No
                            </label>
                        </div>
                    </div>
                    <div className="fila-dano">
                        <span className="dano-label">Roto ✖</span>
                        <div className="dano-radios">
                            <label className={orden.roto === 'si' ? 'selected' : ''}>
                                <input type="radio" name="roto" value="si" checked={orden.roto === "si"} onChange={handleChange}/> Si
                            </label>
                            <label className={orden.roto === 'no' ? 'selected' : ''}>
                                <input type="radio" name="roto" value="no" checked={orden.roto === "no"} onChange={handleChange}/> No
                            </label>
                        </div>
                    </div>
                    <div className="fila-dano">
                        <span className="dano-label">Rayones ⚡</span>
                        <div className="dano-radios">
                            <label className={orden.rayones === 'si' ? 'selected' : ''}>
                                <input type="radio" name="rayones" value="si" checked={orden.rayones === "si"} onChange={handleChange}/> Si
                            </label>
                            <label className={orden.rayones === 'no' ? 'selected' : ''}>
                                <input type="radio" name="rayones" value="no" checked={orden.rayones === "no"} onChange={handleChange}/> No
                            </label>
                        </div>
                    </div>
                 </div>
                 
                 {/* --- AUTO INTERACTIVO --- */}
                 <div className="contenedor-diagrama" onClick={agregarMarcaAuto}>
                    <img src="/diagrama-auto.png" alt="Diagrama Vehículo" className="img-diagrama" />
                    {(orden.danosCoords || []).map((coord, index) => (
                      <div 
                        key={index} 
                        className="marca-dano"
                        style={{ left: `${coord.x}%`, top: `${coord.y}%` }}
                        onClick={(e) => eliminarMarcaAuto(index, e)}
                        title="Clic para borrar"
                      >
                        X
                      </div>
                    ))}
                 </div>
                 <small style={{color:'#999', fontSize:'0.7rem', marginTop:'5px'}}>* Clic sobre la imagen para marcar daños (X)</small>
             </div>
          </div>

          {/* COLUMNA 3: NIVELES, EXTERIORES, CAJUELA */}
          <div className="col-check">
             <div className="header-tabla">Cofre (Niveles)</div>
             <div className="tabla-body">
                 <FilaCheck label="Aceite Motor" name="aceiteMotor" val={orden.aceiteMotor} />
                 <FilaCheck label="Liq. Frenos" name="liquidoFrenos" val={orden.liquidoFrenos} />
                 <FilaCheck label="Limpiaparabrisas" name="limpiaParabrisas" val={orden.limpiaParabrisas} />
                 <FilaCheck label="Anticongelante" name="anticongelante" val={orden.anticongelante} />
                 <FilaCheck label="Liq. Dirección" name="liquidoDireccion" val={orden.liquidoDireccion} />
             </div>

             <div className="header-tabla" style={{marginTop: '5px'}}>Exteriores</div>
             <div className="tabla-body">
                 <FilaCheck label="Tapones Rueda" name="tapones" val={orden.tapones} />
                 <FilaCheck label="Gomas Limpia" name="gomas" val={orden.gomas} />
                 <FilaCheck label="Antena" name="antena" val={orden.antena} />
                 <FilaCheck label="Tapón Gasolina" name="taponGas" val={orden.taponGas} />
             </div>

             <div className="header-tabla" style={{marginTop: '5px'}}>Cajuela</div>
             <div className="tabla-body">
                 <FilaCheck label="Herramienta" name="herramienta" val={orden.herramienta} />
                 <FilaCheck label="Gato / Llave" name="gato" val={orden.gato} />
                 <FilaCheck label="Reflejantes" name="reflejantes" val={orden.reflejantes} />
                 <FilaCheck label="Cables" name="cables" val={orden.cables} />
                 <FilaCheck label="Extintor" name="extintor" val={orden.extintor} />
                 <FilaCheck label="Llanta Refacción" name="llantaRefaccion" val={orden.llantaRefaccion} />
             </div>
          </div>
        </div>

        {/* FOOTER: ARTICULOS Y GASOLINA */}
        <div className="footer-grid">
             <div className="articulos-box">
                <label>¿Deja artículos promocionales? (¿Cuáles?)</label>
                <input name="articulosPromocionales" value={orden.articulosPromocionales} onChange={handleChange} className="input-papel" />
                <div className="gasolina-wrapper">
                    <label>⛽ Gasolina:</label>
                    <div className="gasolina-slider-container">
                        <span className="gas-mark">E</span>
                        <input type="range" name="gasolina" min="0" max="100" step="25" value={orden.gasolina} onChange={handleChange} className="gas-range"/>
                        <span className="gas-mark">F</span>
                    </div>
                    <div className="gas-display">Nivel: {orden.gasolina}%</div>
                </div>
             </div>
             
             <div className="firmas-section">
                 <div className="firma-linea">
                    <input name="asesor" value={orden.asesor} onChange={handleChange} placeholder="Nombre asesor"/>
                    <span>NOMBRE DEL ASESOR</span>
                 </div>
                 <div className="firma-linea">
                    <div className="espacio-firma"></div>
                    <span>FIRMA DEL CLIENTE</span>
                    <small style={{fontSize:'0.6rem', marginTop:'2px'}}>DECLARO QUE NO DEJO NINGUNA PERTENENCIA DE VALOR</small>
                 </div>
             </div>
        </div>
        
        {/* BOTONES DE ACCIÓN */}
        <div className="botones-flotantes no-print">
             {editId && <button className="btn-cancelar" onClick={cancelarEdicion}>CANCELAR</button>}
             <button className="btn-guardar" onClick={guardarServicio} disabled={guardando}>
                {guardando ? "..." : editId ? "ACTUALIZAR" : "GUARDAR"}
             </button>
             <button className="btn-imprimir" onClick={() => window.print()}>IMPRIMIR</button>
        </div>

      </div>

      {/* HISTORIAL */}
      <div className="historial-container no-print">
        <h3>HISTORIAL DE SERVICIOS</h3>
        <table className="tabla-servicios">
           <thead>
             <tr>
               <th>Orden #</th>
               <th>Fecha</th>
               <th>Cliente</th>
               <th>Vehículo</th>
               <th>Estado</th>
               <th>Acciones</th>
             </tr>
           </thead>
           <tbody>
             {listaServicios.map(s => (
               <tr key={s.id}>
                 <td style={{fontWeight:'bold', color:'#B91C1C'}}>#{s.noOrden || '---'}</td>
                 <td>
                    {s.fecha}
                    {/* Indicador visual si fue modificado */}
                    {s.editado && <div style={{fontSize:'0.7rem', color:'#d97706', fontStyle:'italic'}}>Modificado</div>}
                 </td>
                 <td>{s.cliente}</td>
                 <td>{s.vehiculo} ({s.placas})</td>
                 <td>
                    <span style={{
                        padding:'2px 6px', 
                        borderRadius:'4px', 
                        fontSize:'0.75rem',
                        background: s.estado === 'terminado' ? '#dcfce7' : '#f3f4f6',
                        color: s.estado === 'terminado' ? '#166534' : '#374151',
                        textTransform: 'uppercase',
                        fontWeight: 'bold'
                    }}>
                        {s.estado || 'Abierto'}
                    </span>
                 </td>
                 <td>
                    <button onClick={() => cargarParaEditar(s)}>✏️</button>
                    <button onClick={() => eliminarServicio(s.id)} className="btn-del">🗑️</button>
                 </td>
               </tr>
             ))}
           </tbody>
        </table>
      </div>
    </div>
  );
};

export default Servicios;