// src/components/ListaVehiculos.jsx

import React, { useState, useEffect } from 'react';
// Asegúrate de que esta ruta sea correcta
import { db } from '../firebaseConfig'; 
// Importa getDocs para la lectura simple
import { collection, getDocs } from 'firebase/firestore'; 

export default function ListaVehiculos() {
  const [vehiculos, setVehiculos] = useState([]);

  useEffect(() => {
    const obtenerVehiculos = async () => {
      try {
        // Usa la función getDocs para obtener los datos de una vez
        const querySnapshot = await getDocs(collection(db, 'vehiculos'));
        const vehiculosData = [];
        querySnapshot.forEach((doc) => {
          vehiculosData.push({ id: doc.id, ...doc.data() });
        });
        setVehiculos(vehiculosData);
      } catch (error) {
        // 🔴 ESTO MOSTRARÁ EL ERROR REAL DE FIREBASE
        console.error("Error al obtener documentos (REVISA ESTE MENSAJE):", error);
        alert("Error al cargar la lista. Revisa la Consola (F12) para ver el mensaje de Firebase.");
      }
    };

    obtenerVehiculos();
  }, []);

  return (
    <div className="mt-8 p-6 max-w-4xl mx-auto bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold mb-6">Vehículos Registrados ({vehiculos.length})</h2>
      
      {vehiculos.length === 0 ? (
        <p className="text-gray-500">
          No hay vehículos registrados o hubo un error de conexión.
          {/* Muestra un error si la carga falló */}
          {window.location.href.includes("Error al cargar la lista") && "¡Conexión Fallida!"}
        </p>
      ) : (
        // ... Renderiza la lista (código de mapeo) ...
        <div className="space-y-4">
          {vehiculos.map((auto) => (
            <div key={auto.id} className="p-4 border rounded-lg shadow-sm bg-gray-50">
              <p className="font-semibold">{auto.placas} - {auto.modelo}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}