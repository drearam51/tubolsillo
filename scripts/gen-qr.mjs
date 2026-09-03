// Genera los PNG de QR para imprimir, con el nombre impreso debajo del codigo.
// Uso: npm run gen-qr
// Salida en scripts/out/ (ignorada por git).
import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import QRCode from "qrcode";
import { createCanvas, loadImage } from "@napi-rs/canvas";
import { STAND_KEYS, IMPREVISTO_KEYS } from "../lib/config.js";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const outDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "out");

// Texto impreso debajo de cada QR -- corto a proposito, para que quepa y sea
// legible de un vistazo por quien atiende el stand. El detalle narrativo ya lo
// muestra la app al escanear.
const STAND_LABELS = {
  empanadas: "STAND 1 · EMPANADAS",
  botilito: "STAND 2 · BOTILITO",
  cdt: "STAND 3 · CDT",
};
const IMPREVISTO_LABELS = {
  vidrio: "CAJA MISTERIOSA · VIDRIO",
  cerrajero: "CAJA MISTERIOSA · CERRAJERO",
  enfermedad: "CAJA MISTERIOSA · ENFERMEDAD",
  llanta: "CAJA MISTERIOSA · LLANTA",
};

const targets = [
  { file: "entrada", url: `${APP_URL}/`, label: "ENTRADA" },
  ...STAND_KEYS.filter((k) => k !== "cdt").map((k) => ({
    file: `stand-${k}`,
    url: `${APP_URL}/pagar?c=${k}`,
    label: STAND_LABELS[k],
  })),
  { file: "stand-cdt", url: `${APP_URL}/cdt?c=cdt`, label: STAND_LABELS.cdt },
  ...IMPREVISTO_KEYS.map((k) => ({
    file: `imprevisto-${k}`,
    url: `${APP_URL}/caja?imprevisto=${k}`,
    label: IMPREVISTO_LABELS[k],
  })),
];

await mkdir(outDir, { recursive: true });

const LABEL_HEIGHT = 120;

for (const t of targets) {
  const qrBuf = await QRCode.toBuffer(t.url, {
    errorCorrectionLevel: "M",
    margin: 2,
    width: 900,
    color: { dark: "#0A1B2E", light: "#FFFFFF" },
  });

  const qrImg = await loadImage(qrBuf);
  const canvas = createCanvas(qrImg.width, qrImg.height + LABEL_HEIGHT);
  const ctx = canvas.getContext("2d");

  // Fondo blanco (incluye la franja del texto)
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(qrImg, 0, 0);

  ctx.fillStyle = "#0A1B2E";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = "bold 46px Arial";
  ctx.fillText(t.label, canvas.width / 2, qrImg.height + LABEL_HEIGHT / 2, canvas.width - 40);

  const finalBuf = await canvas.encode("png");
  await writeFile(path.join(outDir, `${t.file}.png`), finalBuf);
  console.log(`  ${t.file}.png  ->  ${t.url}   (${t.label})`);
}

console.log(`\n${targets.length} QR generados en ${outDir}`);
