import express from "express";
import cors from "cors";
import fs from "fs";
import { PDFDocument } from "pdf-lib";

const app = express();
app.use(cors());
app.use(express.json());

app.post("/generar-pdf", async (req, res) => {
  try {
    const {
      fecha,
      hora,
      cliente,
      vehiculo,
      año,
      vin,
      km,
      placas,
      tel,
      cel,
      email,
      motivo
    } = req.body;

    // Cargar PDF original
    const existingPdfBytes = fs.readFileSync("/mnt/data/ORDEN SERVICIO 24.pdf");

    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const page = pdfDoc.getPages()[0];

    // Escribir datos (coords preliminares)
    page.drawText(fecha, { x: 120, y: 740, size: 12 });
    page.drawText(hora, { x: 330, y: 740, size: 12 });

    page.drawText(cliente, { x: 120, y: 705, size: 12 });
    page.drawText(vehiculo, { x: 120, y: 680, size: 12 });
    page.drawText(año, { x: 340, y: 680, size: 12 });

    page.drawText(vin, { x: 120, y: 655, size: 12 });
    page.drawText(km, { x: 340, y: 655, size: 12 });

    page.drawText(placas, { x: 120, y: 630, size: 12 });
    page.drawText(tel, { x: 340, y: 630, size: 12 });

    page.drawText(email, { x: 120, y: 605, size: 12 });

    // Motivo
    page.drawText(motivo.substring(0, 70), { x: 50, y: 550, size: 12 });

    // Guardar
    const pdfBytes = await pdfDoc.save();

    res.setHeader("Content-Type", "application/pdf");
    res.send(Buffer.from(pdfBytes));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al generar PDF" });
  }
});

app.listen(3000, () => console.log("Servidor en puerto 3000"));
