import React, { useState } from "react";
import { jsPDF } from "jspdf";
import { db } from "../firebaseConfig"; 
import { collection, addDoc } from "firebase/firestore";
import "./Login.css"; 

export default function NuevaOrden() {
  const [formData, setFormData] = useState({
    cliente: "",
    telefono: "",
    vehiculo: "",
    vin: "",
    placas: "",
    kilometraje: "",
    motivo: "",
    gasolina: "1/4",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const generarPDF = () => {
    const doc = new jsPDF();
    const fechaHoy = new Date().toLocaleDateString();
    const horaHoy = new Date().toLocaleTimeString();

    // --- ENCABEZADO ---
    doc.setFontSize(22);
    doc.setTextColor(0, 51, 153); // Azul Suzuki
    doc.text("SUZUKI", 10, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text("Ave. Hidalgo 6307 Col. Choferes, Tampico", 10, 26);
    doc.text("Tel. 834 110 24 24", 10, 31);

    doc.setFontSize(16);
    doc.text("ORDEN DE SERVICIO", 140, 20);

    // --- DATOS GENERALES ---
    doc.setFontSize(10);
    doc.text(`FECHA: ${fechaHoy}`, 140, 30);
    doc.text(`HORA: ${horaHoy}`, 140, 35);

    // --- LÍNEA SEPARADORA ---
    doc.setLineWidth(0.5);
    doc.line(10, 40, 200, 40); 

    // --- DATOS DEL CLIENTE Y VEHÍCULO ---
    doc.setFontSize(11);
    doc.text(`CLIENTE: ${formData.cliente}`, 10, 50);
    doc.text(`TELÉFONO: ${formData.telefono}`, 120, 50);
    
    doc.text(`VEHÍCULO: ${formData.vehiculo}`, 10, 60);
    doc.text(`VIN: ${formData.vin}`, 80, 60);
    doc.text(`PLACAS: ${formData.placas}`, 150, 60);
    
    doc.text(`KILOMETRAJE: ${formData.kilometraje} KMS`, 10, 70);

    // --- MOTIVO DE VISITA ---
    doc.setFillColor(230, 230, 230); // Gris claro
    doc.rect(10, 80, 190, 8, "F"); 
    doc.setFont("helvetica", "bold");
    doc.text("MOTIVO DE VISITA / COMENTARIOS", 12, 85);
    
    doc.setFont("helvetica", "normal");
    // Usamos splitTextToSize para que el texto largo no se salga de la hoja
    const motivoLines = doc.splitTextToSize(formData.motivo, 180);
    doc.text(motivoLines, 12, 95); 

    // --- INVENTARIO RÁPIDO ---
    doc.text("Nivel de Gasolina:", 10, 130);
    doc.text(formData.gasolina, 50, 130); 

    // --- PIE DE PÁGINA ---
    doc.setFontSize(8);
    doc.text("DECLARO QUE NO DEJO NINGUNA PERTENENCIA DE VALOR EN MI VEHÍCULO.", 10, 250);
    doc.line(10, 270, 80, 270);
    doc.text("FIRMA DEL CLIENTE", 10, 275);

    doc.save(`Orden_${formData.placas}.pdf`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "servicios"), {
        ...formData,
        fecha: new Date(),
        status: "Abierto"
      });
      
      generarPDF();
      alert("Orden creada y PDF descargado");
    } catch (error) {
      console.error("Error al guardar:", error);
      alert("Hubo un error al guardar la orden");
    }
  };

  return (
    <div className="login-container">
      <div className="login-card" style={{ maxWidth: "600px" }}>
        <h2 className="login-header">Nueva Orden de Servicio</h2>
        
        <form onSubmit={handleSubmit} className="login-form">
          
          <input
            name="cliente"
            placeholder="Nombre del Cliente"
            onChange={handleChange}
            className="login-input"
            required
          />

          <div style={{ display: "flex", gap: "10px" }}>
             <input
              name="telefono"
              placeholder="Teléfono"
              onChange={handleChange}
              className="login-input"
            />
            <input
              name="placas"
              placeholder="Placas"
              onChange={handleChange}
              className="login-input"
              required
            />
          </div>

          <input
            name="vehiculo"
            placeholder="Modelo del Vehículo (Ej. Swift)"
            onChange={handleChange}
            className="login-input"
          />
          
          <input
            name="vin"
            placeholder="VIN (Número de Serie)"
            onChange={handleChange}
            className="login-input"
          />

          <input
            name="kilometraje"
            type="number"
            placeholder="Kilometraje Actual"
            onChange={handleChange}
            className="login-input"
          />

          <textarea
            name="motivo"
            placeholder="Motivo de visita / Fallas reportadas"
            onChange={handleChange}
            className="login-input"
            style={{ height: "80px", paddingTop: "10px" }}
          />

          <label className="text-white">Nivel de Gasolina:</label>
          <select name="gasolina" onChange={handleChange} className="login-input">
            <option value="Reserva">Reserva</option>
            <option value="1/4">1/4</option>
            <option value="1/2">1/2</option>
            <option value="3/4">3/4</option>
            <option value="Lleno">Lleno</option>
          </select>

          <button type="submit" className="login-button">
            Crear Orden y PDF
          </button>
        </form>
      </div>
    </div>
  );
}