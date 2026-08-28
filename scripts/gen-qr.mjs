// Genera los PNG de QR para imprimir. Uso: npm run gen-qr
// Salida en scripts/out/ (ignorada por git).
import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import QRCode from "qrcode";
import { STAND_KEYS, IMPREVISTO_KEYS } from "../lib/config.js";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const outDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "out");

const targets = [
  { file: "entrada", url: `${APP_URL}/` },
  ...STAND_KEYS.filter((k) => k !== "cdt").map((k) => ({
    file: `stand-${k}`,
    url: `${APP_URL}/pagar?c=${k}`,
  })),
  { file: "stand-cdt", url: `${APP_URL}/cdt?c=cdt` },
  ...IMPREVISTO_KEYS.map((k) => ({
    file: `imprevisto-${k}`,
    url: `${APP_URL}/caja?imprevisto=${k}`,
  })),
];

await mkdir(outDir, { recursive: true });

for (const t of targets) {
  const buf = await QRCode.toBuffer(t.url, {
    errorCorrectionLevel: "M",
    margin: 2,
    width: 900,
    color: { dark: "#0A1B2E", light: "#FFFFFF" },
  });
  await writeFile(path.join(outDir, `${t.file}.png`), buf);
  console.log(`  ${t.file}.png  ->  ${t.url}`);
}

console.log(`\n${targets.length} QR generados en ${outDir}`);
