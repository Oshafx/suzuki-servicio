import React, { useState, useEffect } from 'react';
import { collection, query, onSnapshot, doc, updateDoc, orderBy } from "firebase/firestore";
import { db } from "../firebaseConfig";
import './Servicios.css'; // Estilos de la hoja
import './Mecanicos.css'; // Estilos del tablero

const Mecanicos = () => {
  const [ordenes, setOrdenes] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Estados para el Modal
  const [selectedOrden, setSelectedOrden] = useState(null);
  const [nombreMecanico, setNombreMecanico] = useState("");

  useEffect(() => {
    const q = query(collection(db, "servicios"), orderBy("creado", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setOrdenes(docs);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Abrir Modal
  const abrirHoja = (orden) => {
    setSelectedOrden(orden);
    setNombreMecanico(orden.mecanico || ""); 
  };

  // Cerrar Modal
  const cerrarHoja = () => {
    setSelectedOrden(null);
    setNombreMecanico("");
  };

  const guardarAsignacion = async () => {
    if (!selectedOrden) return;
    try {
      await updateDoc(doc(db, "servicios", selectedOrden.id), {
        mecanico: nombreMecanico,
        estado: selectedOrden.estado === 'abierto' ? 'en_proceso' : selectedOrden.estado
      });
      alert("Mecánico asignado correctamente.");
      cerrarHoja();
    } catch (error) {
      console.error("Error al guardar:", error);
      alert("Error al guardar.");
    }
  };

  const cambiarEstado = async (id, nuevoEstado) => {
    try {
      await updateDoc(doc(db, "servicios", id), { estado: nuevoEstado });
    } catch (error) { console.error(error); }
  };

  if (loading) return <div className="mecanicos-container" style={{textAlign:'center'}}>Cargando órdenes...</div>;

  return (
    <div className="mecanicos-container">
      <h2 className="mecanicos-title">
        Tablero de Taller Mecánico
      </h2>

      <div className="ordenes-grid">
        {ordenes.map((orden) => (
          <div key={orden.id} className="orden-card">
            
            {/* Encabezado Tarjeta - AHORA CON NÚMERO DE ORDEN */}
            <div className="card-header">
              <div className="header-info">
                <span className="orden-number-badge">#{orden.noOrden || '---'}</span>
                <div>
                    <h3>{orden.vehiculo}</h3>
                    <p>{orden.placas}</p>
                </div>
              </div>
              <span className={`status-badge ${orden.estado === 'terminado' ? 'terminado' : ''}`}>
                {orden.estado || 'Abierto'}
              </span>
            </div>

            {/* Cuerpo Tarjeta */}
            <div className="card-body">
              <div>
                <p className="section-label">Falla / Motivo:</p>
                <div className="motivo-text">
                    {orden.motivo || "Sin descripción detallada."}
                </div>
                
                {orden.mecanico && (
                    <div className="mecanico-badge">
                        <strong>Mecánico:</strong> {orden.mecanico}
                    </div>
                )}
              </div>

              {/* Botones */}
              <div className="card-actions">
                 <button 
                    onClick={() => abrirHoja(orden)}
                    className="btn-action btn-view"
                 >
                    📄 Ver Hoja / Asignarme
                 </button>

                 {orden.estado !== 'terminado' ? (
                    <button 
                        onClick={() => cambiarEstado(orden.id, 'terminado')}
                        className="btn-action btn-finish"
                    >
                        ✅ Finalizar Trabajo
                    </button>
                 ) : (
                    <div className="status-finished">
                        ✓ Trabajo Terminado
                    </div>
                 )}
              </div>
            </div>
          </div>
        ))}

        {ordenes.length === 0 && (
            <div className="empty-state">
                <span className="empty-icon">🔧</span>
                <p>No hay órdenes de servicio activas.</p>
            </div>
        )}
      </div>

      {/* ==================== MODAL HOJA DE SERVICIO ==================== */}
      {selectedOrden && (
        <div className="modal-overlay-mecanico">
          <div className="modal-content-mecanico">
            
            <button onClick={cerrarHoja} className="close-modal-btn">✕</button>

            {/* --- REUTILIZAMOS LA HOJA --- */}
            <div className="hoja-suzuki" style={{boxShadow:'none', border:'none', margin:0, width:'100%', maxWidth:'100%'}}>
                
                {/* ENCABEZADO */}
                <div className="header-row">
                    <div className="logo-section">
                        <img src="/logo-suzuki.png" alt="Suzuki" className="logo-img" style={{height:'50px'}}/>
                        <div className="direccion-text">HOJA DE TALLER - COPIA MECÁNICO</div>
                    </div>
                    <div className="titulo-orden">
                        <h2 style={{fontSize:'1.5rem', color:'#B91C1C'}}>ORDEN #{selectedOrden.noOrden || '---'}</h2>
                        <div style={{fontSize:'0.9rem'}}>{selectedOrden.fecha}</div>
                    </div>
                </div>

                {/* DATOS */}
                <div className="grid-datos" style={{borderBottom:'2px solid #ddd', paddingBottom:'1rem'}}>
                    <div className="campo-papel col-2"><label>Vehículo:</label> <span>{selectedOrden.vehiculo}</span></div>
                    <div className="campo-papel col-2"><label>Placas:</label> <span>{selectedOrden.placas}</span></div>
                    <div className="campo-papel col-2"><label>Color:</label> <span>{selectedOrden.color}</span></div>
                    <div className="campo-papel col-2"><label>KM:</label> <span>{selectedOrden.kilometraje}</span></div>
                    <div className="campo-papel col-full" style={{background:'#fffbeb', padding:'0.5rem', border:'1px solid #fde68a', marginTop:'0.5rem'}}>
                        <label style={{color:'#b91c1c'}}>REPORTE CLIENTE:</label>
                        <span>{selectedOrden.motivo}</span>
                    </div>
                </div>

                {/* DIAGRAMAS */}
                <div className="checklist-grid-completo">
                    <div className="col-check">
                        <div className="header-tabla">Tablero</div>
                        <div className="tabla-body center-content relative" style={{minHeight:'150px'}}>
                            <div className="contenedor-tablero" style={{pointerEvents:'none'}}>
                                <img src="/tablero-iconos.png" className="img-tablero" alt="Tablero"/>
                                {selectedOrden.indicadoresCoords?.map((c, i) => (
                                    <div key={i} className="marca-dano" style={{left: c.x+'%', top: c.y+'%'}}>X</div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="col-check">
                        <div className="header-tabla">Carrocería</div>
                        <div className="tabla-body center-content relative" style={{minHeight:'200px'}}>
                            <div className="danos-options" style={{fontSize:'0.7rem', marginBottom:'5px'}}>
                                <span>Golpes: <b>{selectedOrden.golpes}</b></span> • 
                                <span>Roto: <b>{selectedOrden.roto}</b></span> • 
                                <span>Rayones: <b>{selectedOrden.rayones}</b></span>
                            </div>
                            <div className="contenedor-diagrama" style={{pointerEvents:'none'}}>
                                <img src="/diagrama-auto.png" className="img-diagrama" alt="Auto"/>
                                {selectedOrden.danosCoords?.map((c, i) => (
                                    <div key={i} className="marca-dano" style={{left: c.x+'%', top: c.y+'%'}}>X</div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="col-check">
                        <div className="header-tabla">Niveles</div>
                        <div className="tabla-body" style={{padding:'10px', fontSize:'0.85rem'}}>
                            <div style={{display:'flex', justifyContent:'space-between', borderBottom:'1px solid #eee'}}><span>Aceite:</span> <b>{selectedOrden.aceiteMotor}</b></div>
                            <div style={{display:'flex', justifyContent:'space-between', borderBottom:'1px solid #eee'}}><span>Frenos:</span> <b>{selectedOrden.liquidoFrenos}</b></div>
                            <div style={{display:'flex', justifyContent:'space-between', borderBottom:'1px solid #eee'}}><span>Refrigerante:</span> <b>{selectedOrden.anticongelante}</b></div>
                        </div>
                    </div>
                </div>

                {/* ZONA DE ASIGNACIÓN (EDITABLE) */}
                <div className="asignacion-box">
                    <h3 className="asignacion-title">👨‍🔧 Asignación de Mecánico</h3>
                    <div className="asignacion-form">
                        <div style={{flexGrow:1}}>
                            <label style={{display:'block', fontSize:'0.8rem', fontWeight:'bold', color:'#4b5563', marginBottom:'4px'}}>Responsable:</label>
                            <input 
                                type="text" 
                                value={nombreMecanico}
                                onChange={(e) => setNombreMecanico(e.target.value)}
                                placeholder="Escribe tu nombre..."
                                className="asignacion-input"
                            />
                        </div>
                        <button onClick={guardarAsignacion} className="btn-save">
                            GUARDAR
                        </button>
                    </div>
                </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Mecanicos;