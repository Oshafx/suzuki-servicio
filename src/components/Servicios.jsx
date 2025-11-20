import React, { useState, useEffect } from "react";
import { db } from "../firebaseConfig";
import { 
  collection, addDoc, serverTimestamp, getDocs, 
  orderBy, query, doc, deleteDoc, updateDoc 
} from "firebase/firestore";
import "./Servicios.css"; 

const Servicios = () => {
  // Estado inicial con TODOS los campos del PDF
  const initialState = {
    fecha: new Date().toLocaleDateString(),
    horaRecepcion: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    horaEntrega: "", //
    cliente: "", telefono: "", email: "", celular: "", //
    vehiculo: "", vin: "", placas: "", anio: "", kilometraje: "", color: "",
    noOrden: "", //
    motivo: "", 
    tierraCarroceria: false, //
    
    // INTERIORES (Opera: Si/No/NC)
    poliza: "si", seguroRines: "si", indicadores: "no",
    abs: "no", rociador: "si", claxon: "si", 
    radio: "si", pantalla: "si", ac: "si", 
    encendedor: "si", vidrios: "si", espejos: "si", 
    segurosElec: "si", guantera: "si", asientos: "si", tapetes: "si",

    // INDICADORES ACTIVADOS
    testigoAbs: false, testigoFreno: false, testigoMotor: false,

    // CONDICIONES CARROCERIA
    golpes: false, roto: false, rayones: false,

    // NIVELES (Tabla)
    aceiteMotor: "si", liquidoFrenos: "si", 
    limpiaParabrisas: "si", anticongelante: "si", liquidoDireccion: "si",

    // EXTERIORES (Tabla)
    tapones: "si", gomas: "si", antena: "si", taponGas: "si",

    // INVENTARIO / CAJUELA
    herramienta: "si", gato: "si", reflejantes: "si", 
    cables: "si", extintor: "si", llantaRefaccion: "si",
    
    articulosPromocionales: "", //
    asesor: "", //
    gasolina: "25" //
  };

  const [orden, setOrden] = useState(initialState);
  const [listaServicios, setListaServicios] = useState([]);
  const [editId, setEditId] = useState(null); 
  const [guardando, setGuardando] = useState(false);
  const serviciosCollection = collection(db, "servicios");

  // --- CARGAR DATOS ---
  const fetchServicios = async () => {
    try {
      const q = query(serviciosCollection, orderBy("creado", "desc"));
      const data = await getDocs(q);
      setListaServicios(data.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) { console.error(error); }
  };

  useEffect(() => { fetchServicios(); }, []);

  // --- MANEJAR CAMBIOS ---
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setOrden({ ...orden, [name]: type === "checkbox" ? checked : value });
  };

  // --- GUARDAR ---
  const guardarServicio = async () => {
    if (!orden.cliente || !orden.vehiculo) { alert("Falta Cliente o Vehículo"); return; }
    setGuardando(true);
    try {
      if (editId) {
        await updateDoc(doc(db, "servicios", editId), { ...orden, editado: serverTimestamp() });
        alert("Orden Actualizada");
        setEditId(null);
      } else {
        await addDoc(serviciosCollection, { ...orden, estado: "abierto", creado: serverTimestamp() });
        alert("Orden Creada");
      }
      setOrden(initialState);
      fetchServicios();
    } catch (error) { alert("Error al guardar"); }
    setGuardando(false);
  };

  const cargarParaEditar = (item) => { setOrden(item); setEditId(item.id); window.scrollTo(0,0); };
  const eliminarServicio = async (id) => {
    if(confirm("¿Borrar?")) { await deleteDoc(doc(db, "servicios", id)); fetchServicios(); }
  };

  // Componente auxiliar para filas de checklist (Si/No/NC)
  const FilaCheck = ({ label, name, val }) => (
    <div className="check-row-grid">
      <span className="check-label">{label}</span>
      <div className="check-opts">
        <label><input type="radio" name={name} value="si" checked={val === "si"} onChange={handleChange}/> Si</label>
        <label><input type="radio" name={name} value="no" checked={val === "no"} onChange={handleChange}/> No</label>
        <label><input type="radio" name={name} value="nc" checked={val === "nc"} onChange={handleChange}/> N/C</label>
      </div>
    </div>
  );

  return (
    <div className="servicio-container">
      <div className={`hoja-suzuki ${editId ? 'modo-edicion' : ''}`}>
        
        {/* ENCABEZADO */}
        <div className="header-row">
          <div className="logo-section">
            <h1>SUZUKI</h1>
            <div className="direccion-text">Ave. Hidalgo 6307 Col. Choferes, Tampico. Tel. 834 110 24 24</div>
          </div>
          <div className="titulo-orden">
            <h2>ORDEN DE SERVICIO</h2>
            <div className="fechas-grid">
               <div><strong>FECHA:</strong> {orden.fecha}</div>
               <div><strong>HORA RECEPCIÓN:</strong> {orden.horaRecepcion}</div>
            </div>
          </div>
        </div>

        {/* DATOS GENERALES */}
        <div className="grid-datos">
          <div className="campo-papel col-3"><label>CLIENTE</label><input name="cliente" value={orden.cliente} onChange={handleChange} className="input-papel"/></div>
          <div className="campo-papel"><label>TELÉFONO</label><input name="telefono" value={orden.telefono} onChange={handleChange} className="input-papel"/></div>
          
          <div className="campo-papel col-2"><label>VEHÍCULO</label><input name="vehiculo" value={orden.vehiculo} onChange={handleChange} className="input-papel"/></div>
          <div className="campo-papel"><label>VIN</label><input name="vin" value={orden.vin} onChange={handleChange} className="input-papel"/></div>
          <div className="campo-papel"><label>PLACAS</label><input name="placas" value={orden.placas} onChange={handleChange} className="input-papel"/></div>
          
          <div className="campo-papel col-2"><label>EMAIL</label><input name="email" value={orden.email} onChange={handleChange} className="input-papel"/></div>
          <div className="campo-papel"><label>AÑO</label><input name="anio" value={orden.anio} onChange={handleChange} className="input-papel"/></div>
          <div className="campo-papel"><label>KILOMETRAJE</label><input name="kilometraje" value={orden.kilometraje} onChange={handleChange} className="input-papel"/></div>

          <div className="campo-papel col-2"><label>HORA ENTREGA</label><input name="horaEntrega" value={orden.horaEntrega} onChange={handleChange} className="input-papel"/></div>
          <div className="campo-papel"><label>CELULAR</label><input name="celular" value={orden.celular} onChange={handleChange} className="input-papel"/></div>
          <div className="campo-papel"><label>NO. ORDEN</label><input name="noOrden" value={orden.noOrden} onChange={handleChange} className="input-papel"/></div>
        </div>

        {/* MOTIVO */}
        <div className="seccion-gris">
          <label>MOTIVO DE VISITA / COMENTARIOS</label>
          <textarea name="motivo" value={orden.motivo} onChange={handleChange} className="area-motivo" />
        </div>
        <label className="check-simple">
           <input type="checkbox" name="tierraCarroceria" checked={orden.tierraCarroceria} onChange={handleChange}/> Tierra en carrocería no se aprecia al 100%
        </label>

        {/* CHECKLISTS COMPLETOS */}
        <div className="checklist-grid-completo">
          
          {/* COLUMNA 1: INTERIORES */}
          <div className="col-check">
            <h4>INTERIORES</h4>
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
            
            <div style={{marginTop: "10px", border:"1px solid #999", padding:"5px"}}>
               <strong>Indicadores Activados:</strong><br/>
               <label><input type="checkbox" name="testigoAbs" checked={orden.testigoAbs} onChange={handleChange}/> ABS </label>
               <label><input type="checkbox" name="testigoFreno" checked={orden.testigoFreno} onChange={handleChange}/> (!) </label>
               <label><input type="checkbox" name="testigoMotor" checked={orden.testigoMotor} onChange={handleChange}/> Check </label>
            </div>
          </div>

          {/* COLUMNA 2: NIVELES Y EXTERIORES */}
          <div className="col-check">
             <h4>NIVELES (Motor)</h4>
             <FilaCheck label="Aceite Motor" name="aceiteMotor" val={orden.aceiteMotor} />
             <FilaCheck label="Liq. Frenos" name="liquidoFrenos" val={orden.liquidoFrenos} />
             <FilaCheck label="Limpiaparabrisas" name="limpiaParabrisas" val={orden.limpiaParabrisas} />
             <FilaCheck label="Anticongelante" name="anticongelante" val={orden.anticongelante} />
             <FilaCheck label="Liq. Dirección" name="liquidoDireccion" val={orden.liquidoDireccion} />

             <h4 style={{marginTop: "15px"}}>EXTERIORES</h4>
             <FilaCheck label="Tapones Rueda" name="tapones" val={orden.tapones} />
             <FilaCheck label="Gomas Limpia" name="gomas" val={orden.gomas} />
             <FilaCheck label="Antena" name="antena" val={orden.antena} />
             <FilaCheck label="Tapón Gasolina" name="taponGas" val={orden.taponGas} />
             
             <div style={{marginTop: "10px", border:"1px solid #999", padding:"5px"}}>
               <strong>Daños Carrocería:</strong><br/>
               <label><input type="checkbox" name="golpes" checked={orden.golpes} onChange={handleChange}/> Golpes </label>
               <label><input type="checkbox" name="roto" checked={orden.roto} onChange={handleChange}/> Roto </label>
               <label><input type="checkbox" name="rayones" checked={orden.rayones} onChange={handleChange}/> Rayones </label>
            </div>
          </div>

          {/* COLUMNA 3: INVENTARIO */}
          <div className="col-check">
             <h4>INVENTARIO / CAJUELA</h4>
             <FilaCheck label="Herramienta" name="herramienta" val={orden.herramienta} />
             <FilaCheck label="Gato / Llave" name="gato" val={orden.gato} />
             <FilaCheck label="Reflejantes" name="reflejantes" val={orden.reflejantes} />
             <FilaCheck label="Cables" name="cables" val={orden.cables} />
             <FilaCheck label="Extintor" name="extintor" val={orden.extintor} />
             <FilaCheck label="Llanta Refacción" name="llantaRefaccion" val={orden.llantaRefaccion} />

             <div className="campo-papel" style={{marginTop:"20px"}}>
                <label>¿DEJA ARTÍCULOS PROMOCIONALES?</label>
                <input name="articulosPromocionales" value={orden.articulosPromocionales} onChange={handleChange} className="input-papel" placeholder="Describir..."/>
             </div>

             {/* GASOLINA */}
             <div className="gasolina-box" style={{marginTop:"20px"}}>
               <label>GASOLINA</label>
               <div className="gas-scale"><span>E</span><span>1/4</span><span>1/2</span><span>3/4</span><span>F</span></div>
               <input type="range" name="gasolina" min="0" max="100" step="25" value={orden.gasolina} onChange={handleChange} style={{width:"100%"}}/>
             </div>
          </div>
        </div>

        {/* FIRMAS */}
        <div className="footer-firmas">
            <div className="firma-box">
                <input name="asesor" value={orden.asesor} onChange={handleChange} className="input-papel" style={{textAlign:"center"}}/>
                <div className="linea-firma">NOMBRE DEL ASESOR</div>
            </div>
            <div className="firma-box">
                <div style={{height:"20px"}}></div>
                <div className="linea-firma">FIRMA DEL CLIENTE</div>
                <small>DECLARO QUE NO DEJO NINGUNA PERTENENCIA DE VALOR.</small>
            </div>
        </div>

        <div className="botones-flotantes">
             {editId && <button className="btn-cancelar" onClick={() => {setEditId(null); setOrden(initialState);}}>CANCELAR</button>}
             <button className="btn-guardar" onClick={guardarServicio} disabled={guardando}>
                {guardando ? "..." : "GUARDAR ORDEN"}
             </button>
        </div>

      </div>

      {/* LISTA HISTORIAL */}
      <div className="historial-container">
        <h3>HISTORIAL DE SERVICIOS</h3>
        <table className="tabla-servicios">
           <thead><tr><th>Fecha</th><th>Cliente</th><th>Vehículo</th><th>Acciones</th></tr></thead>
           <tbody>
             {listaServicios.map(s => (
               <tr key={s.id}>
                 <td>{s.fecha}</td>
                 <td>{s.cliente}</td>
                 <td>{s.vehiculo} ({s.placas})</td>
                 <td>
                    <button onClick={() => cargarParaEditar(s)}>✏️</button>
                    <button onClick={() => eliminarServicio(s.id)}>🗑️</button>
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