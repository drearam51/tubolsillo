import { SALDO_INICIAL } from "@/lib/config";

// Numero de documento tal como se guarda: solo digitos, sin puntos ni espacios.
export function normalizeDocumento(input) {
  return String(input || "").replace(/\D/g, "");
}

// Codigo de feria: 4 digitos, como en la Pantalla 1 (input tipo PIN).
export function normalizeCodigo(input) {
  return String(input || "").replace(/\D/g, "");
}

export function generateCodigo() {
  return String(Math.floor(1000 + Math.random() * 9000)); // 1000-9999
}

export function initialParticipant({ nombre, codigo }) {
  return {
    nombre,
    codigo,
    saldo: SALDO_INICIAL,
    cdt: 0,
    gastoHormigaEvitado: 0,
    stands: { empanadas: null, botilito: null, cdt: null, misteriosa: null },
    movimientos: [
      { tipo: "recarga", label: "Recarga de bienvenida", monto: SALDO_INICIAL, ts: Date.now() },
    ],
    createdAt: Date.now(),
  };
}

// Lo que ve el cliente. Nunca se expone el documento como tal (ya vive en la
// cookie de sesion) ni estructura interna de mas.
export function toParticipantView(documento, data) {
  return {
    documento,
    nombre: data.nombre,
    codigo: data.codigo,
    saldo: data.saldo,
    cdt: data.cdt,
    gastoHormigaEvitado: data.gastoHormigaEvitado,
    stands: data.stands,
    movimientos: [...data.movimientos].sort((a, b) => b.ts - a.ts),
  };
}
