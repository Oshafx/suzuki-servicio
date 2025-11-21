import React, { useState, useEffect } from 'react';
import { collection, query, onSnapshot, orderBy } from "firebase/firestore";
import { db } from "../firebaseConfig";
import './Refacciones.css'; // Estilos propios
import './Servicios.css';   // Importante: Para que se vea la hoja de papel y los diagramas

const Refacciones = () => {
  const [ordenes, setOrdenes] = useState([]);
  const [selectedOrden, setSelectedOrden] = useState(null); // Estado para el modal

  useEffect(() => {
    const q = query(collection(db, "servicios"), orderBy("creado", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setOrdenes(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  // Funciones del Modal
  const abrirHoja = (orden) => setSelectedOrden(orden);
  const cerrarHoja = () => setSelectedOrden(null);

  return (
    <div className="refacciones-container">
      <div className="refacciones-header">
        <h2 className="refacciones-title">
           📦 Solicitudes de Refacciones
        </h2>
      </div>

      <div className="table-container">
        <table className="ref-table">
          <thead>
            <tr>
              <th>Orden #</th>
              <th>Vehículo</th>
              <th>VIN (Serie)</th>
              <th>Status</th>
              <th>Notas / Falla</th>
              <th>Acciones</th> {/* Nueva columna */}
            </tr>
          </thead>
          <tbody>
            {ordenes.map((orden) => (
              <tr key={orden.id}>
                <td className="td-orden">#{orden.noOrden || '---'}</td>
                <td>
                    <span className="td-vehiculo-main">{orden.vehiculo}</span>
                    <span className="td-vehiculo-sub">{orden.anio} • {orden.color}</span>
                </td>
                <td>
                    <span className="badge-vin">{orden.vin || 'N/A'}</span>
                </td>
                <td>
                   <span className={`badge-status ${orden.estado || 'abierto'}`}>
                      {orden.estado ? orden.estado.replace('_', ' ') : 'ABIERTO'}
                   </span>
                </td>
                <td className="td-notas" title={orden.motivo}>
                    {orden.motivo || 'Sin notas'}
                </td>
                <td>
                    <button 
                        onClick={() => abrirHoja(orden)}
                        className="btn-ver-hoja"
                    >
                        📄 Ver Hoja
                    </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {ordenes.length === 0 && (
            <div className="empty-ref">
                <p>No hay órdenes pendientes de refacciones.</p>
            </div>
        )}
      </div>

      {/* ==================== MODAL HOJA DE SERVICIO (VISUALIZADOR) ==================== */}
      {selectedOrden && (
        <div className="modal-overlay-ref">
          <div className="modal-content-ref">
            
            <button onClick={cerrarHoja} className="close-modal-btn">✕</button>

            <div className="hoja-suzuki" style={{boxShadow:'none', border:'none', margin:0, width:'100%', maxWidth:'100%'}}>
                
                {/* ENCABEZADO */}
                <div className="header-row">
                    <div className="logo-section">
                        <img src="/logo-suzuki.png" alt="Suzuki" className="logo-img" style={{height:'50px'}}/>
                        <div className="direccion-text">HOJA DE TALLER - VISTA REFACCIONES</div>
                    </div>
                    <div className="titulo-orden">
                        <h2 style={{fontSize:'1.5rem', color:'#1e3a8a'}}>ORDEN #{selectedOrden.noOrden || '---'}</h2>
                        <div style={{fontSize:'0.9rem'}}>{selectedOrden.fecha}</div>
                    </div>
                </div>

                {/* DATOS GENERALES */}
                <div className="grid-datos" style={{borderBottom:'2px solid #ddd', paddingBottom:'1rem'}}>
                    <div className="campo-papel col-2"><label>Vehículo:</label> <span>{selectedOrden.vehiculo}</span></div>
                    <div className="campo-papel col-2"><label>Placas:</label> <span>{selectedOrden.placas}</span></div>
                    <div className="campo-papel col-2"><label>VIN:</label> <span style={{fontFamily:'monospace'}}>{selectedOrden.vin}</span></div>
                    <div className="campo-papel col-2"><label>Mecánico:</label> <span>{selectedOrden.mecanico || 'Sin asignar'}</span></div>
                    <div className="campo-papel col-full" style={{background:'#eff6ff', padding:'0.5rem', border:'1px solid #bfdbfe', marginTop:'0.5rem'}}>
                        <label style={{color:'#1e40af'}}>MOTIVO / FALLA:</label>
                        <span style={{display:'block', fontWeight:'bold'}}>{selectedOrden.motivo}</span>
                    </div>
                </div>

                {/* DIAGRAMAS (SOLO LECTURA) */}
                <div className="checklist-grid-completo">
                    
                    {/* TABLERO */}
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

                    {/* CARROCERÍA */}
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

                    {/* NIVELES */}
                    <div className="col-check">
                        <div className="header-tabla">Estado General</div>
                        <div className="tabla-body" style={{padding:'10px', fontSize:'0.85rem'}}>
                            <div style={{display:'flex', justifyContent:'space-between', borderBottom:'1px solid #eee'}}><span>Gasolina:</span> <b>{selectedOrden.gasolina}%</b></div>
                            <div style={{display:'flex', justifyContent:'space-between', borderBottom:'1px solid #eee'}}><span>Aceite:</span> <b>{selectedOrden.aceiteMotor}</b></div>
                            <div style={{display:'flex', justifyContent:'space-between', borderBottom:'1px solid #eee'}}><span>Frenos:</span> <b>{selectedOrden.liquidoFrenos}</b></div>
                        </div>
                    </div>
                </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Refacciones;