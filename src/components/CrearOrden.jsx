import React from "react";
import OrdenServicioForm from "../components/OrdenServicioForm";

export default function CrearOrden() {
  async function handleFormSubmit(data) {
    const res = await fetch("http://localhost:3000/generar-pdf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "OrdenServicio.pdf";
    a.click();
  }

  return <OrdenServicioForm onSubmit={handleFormSubmit} />;
}
