import React, { useState } from "react";
// 🔴 1. REVISA ESTA RUTA: Debe ser correcta para encontrar firebaseConfig.js
import { db } from "../firebaseConfig"; 
// 🔴 2. REVISA ESTAS IMPORTACIONES: Asegúrate que estén bien escritas.
import { collection, addDoc, Timestamp } from "firebase/firestore";

export default function Recepcion() {
  const [auto, setAuto] = useState({
    placas: "",
    modelo: "",
    kilometraje: "",
    servicio: "",
    observaciones: "",
  });

  const handleChange = (e) => {
    setAuto({ ...auto, [e.target.name]: e.target.value });
  };

  // 3. Función Asíncrona con manejo de errores
  const registrarAuto = async (e) => {
    e.preventDefault();
    
    // 3.1. Validación simple (opcional, pero ayuda)
    if (!auto.placas || !auto.modelo) {
        alert("Por favor, completa las Placas y el Modelo.");
        return;
    }

    try {
      // Intenta registrar en la base de datos
      await addDoc(collection(db, "vehiculos"), {
        ...auto,
        estado: "Recepción",
        fecha_registro: Timestamp.now(),
      });
      
      alert("Vehículo registrado correctamente en Firestore. 🚗");
      
    } catch (error) {
      // Si falla, captura el error y lo muestra en la consola.
      console.error("Error al registrar:", error);
      alert(`¡ERROR DE REGISTRO! Revisa la Consola (F12) para detalles. Mensaje: ${error.message}`);
    }
    
    // Limpia el formulario
    setAuto({ placas: "", modelo: "", kilometraje: "", servicio: "", observaciones: "" });
  };

  return (
    // ... Tu JSX con el formulario ...
    <div className="p-6 max-w-lg mx-auto bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Registro de Vehículo</h2>
      <form onSubmit={registrarAuto} className="flex flex-col gap-3">
        {/* ... */}
        <input name="placas" placeholder="Placas" value={auto.placas} onChange={handleChange} required />
        <input name="modelo" placeholder="Modelo (Baleno 2024)" value={auto.modelo} onChange={handleChange} required />
        <input name="kilometraje" placeholder="Kilometraje" value={auto.kilometraje} onChange={handleChange} required />
        <input name="servicio" placeholder="Servicio (20,000 km)" value={auto.servicio} onChange={handleChange} required />
        <textarea name="observaciones" placeholder="Observaciones" value={auto.observaciones} onChange={handleChange} />
        <button type="submit" className="bg-blue-600 text-white py-2 rounded">Registrar</button>
      </form>
    </div>
  );
}