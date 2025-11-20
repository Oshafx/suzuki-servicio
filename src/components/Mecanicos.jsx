import React, { useEffect, useState } from "react";
import { db } from "../firebaseConfig";
import { collection, query, where, onSnapshot, doc, updateDoc } from "firebase/firestore";
import RegistroUsuario from "./RegistroUsuario";

const ServiciosMecanico = ({ nombreMecanico="josué" }) => {
  const [servicios, setServicios] = useState([]);
  const [refaccionesInput, setRefaccionesInput] = useState({});

  // Función para obtener fecha y hora actual en Ciudad Victoria
  const getFechaHoraActual = () => {
    const now = new Date();
    const opciones = { 
      timeZone: "America/Monterrey", 
      hour12: false, 
      hour: "2-digit", 
      minute: "2-digit", 
      second: "2-digit", 
      year: "numeric", 
      month: "2-digit", 
      day: "2-digit"
    };
    const fechaHoraString = now.toLocaleString("es-MX", opciones); // "dd/mm/yyyy, hh:mm:ss"
    const [fecha, hora] = fechaHoraString.split(", ");
    return { fecha, hora };
  };

  useEffect(() => {
    const serviciosRef = collection(db, "servicios");

    // Traer servicios pendientes
    const qPendiente = query(serviciosRef, where("estado", "==", "pendiente"));
    const unsubscribePendiente = onSnapshot(qPendiente, snapshot => {
      const listaPendiente = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setServicios(prev => {
        const enProgreso = prev.filter(s => s.estado === "en progreso mecanico");
        return [...enProgreso, ...listaPendiente];
      });
    });

    // Traer servicios en progreso
    const qEnProgreso = query(serviciosRef, where("estado", "==", "en progreso mecanico"));
    const unsubscribeEnProgreso = onSnapshot(qEnProgreso, snapshot => {
      const listaEnProgreso = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setServicios(prev => {
        const pendientes = prev.filter(s => s.estado === "pendiente");
        return [...pendientes, ...listaEnProgreso];
      });
    });

    return () => {
      unsubscribePendiente();
      unsubscribeEnProgreso();
    };
  }, []);

  // Tomar servicio
  const tomarServicio = async (id) => {
    if (!nombreMecanico) {
      alert("Error: no se detectó el nombre del mecánico");
      return;
    }

    try {
      const { fecha, hora } = getFechaHoraActual();
      const servicioRef = doc(db, "servicios", id);

      await updateDoc(servicioRef, { 
        estado: "en progreso mecanico", 
        mecanico: nombreMecanico,
        fechaInicioMecanico: fecha,
        horaInicioMecanico: hora
      });

      console.log("Servicio tomado correctamente");
    } catch (error) {
      console.error("Error al tomar servicio:", error);
      alert("No se pudo tomar el servicio. Revisa la consola.");
    }
  };

  // Terminar servicio
  const terminarServicio = async (id) => {
    if (!nombreMecanico) {
      alert("Error: no se detectó el nombre del mecánico");
      return;
    }

    try {
      const { fecha, hora } = getFechaHoraActual();
      const servicioRef = doc(db, "servicios", id);
      const refacciones = refaccionesInput[id] ? refaccionesInput[id].split(",") : [];

      await updateDoc(servicioRef, { 
        estado: "terminado mecanico", 
        refacciones,
        fechaFinMecanico: fecha,
        horaFinMecanico: hora
      });

      console.log("Servicio terminado correctamente");
    } catch (error) {
      console.error("Error al terminar servicio:", error);
      alert("No se pudo terminar el servicio. Revisa la consola.");
    }
  };

  // Cambios en input de refacciones
  const handleRefaccionesChange = (id, value) => {
    setRefaccionesInput(prev => ({ ...prev, [id]: value }));
  };

  return (
    <div className="max-w-4xl mx-auto mt-8 bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Servicios para Mecánico: {nombreMecanico || "Sin nombre"}</h2>
      {servicios.map(s => (
        <div key={s.id} className="border p-4 mb-4 rounded">
          <p><strong>Cliente:</strong> {s.cliente}</p>
          <p><strong>Auto:</strong> {s.auto}</p>
          <p><strong>Servicio:</strong> {s.servicio}</p>
          <p><strong>Estado:</strong> {s.estado}</p>
          <p><strong>Mecánico asignado:</strong> {s.mecanico || "No asignado"}</p>
          {s.fechaInicioMecanico && <p><strong>Inicio mecánico:</strong> {s.fechaInicioMecanico} {s.horaInicioMecanico}</p>}
          {s.fechaFinMecanico && <p><strong>Fin mecánico:</strong> {s.fechaFinMecanico} {s.horaFinMecanico}</p>}

          {s.estado === "pendiente" && (
            <button 
              onClick={() => tomarServicio(s.id)} 
              className="bg-blue-600 text-white px-2 py-1 rounded mt-2">
              Tomar Servicio
            </button>
          )}

          {s.estado === "en progreso mecanico" && s.mecanico === nombreMecanico && (
            <div className="mt-2">
              <input
                type="text"
                placeholder="Refacciones necesarias, separadas por coma"
                value={refaccionesInput[s.id] || ""}
                onChange={e => handleRefaccionesChange(s.id, e.target.value)}
                className="border p-2 w-full rounded mb-2"
              />
              <button 
                onClick={() => terminarServicio(s.id)} 
                className="bg-green-600 text-white px-2 py-1 rounded">
                Terminar Servicio
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ServiciosMecanico;
