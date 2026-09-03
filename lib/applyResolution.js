import { FieldValue } from "firebase-admin/firestore";

// Convierte el resultado de una funcion pura de lib/domain.js (resolvePagar,
// resolveCdt, resolveImprevisto) en un objeto de update listo para tx.update().
export function buildUpdate(standKey, resolution) {
  const update = {};
  if (resolution.standUpdate) update[`stands.${standKey}`] = resolution.standUpdate;
  if (resolution.saldoDelta) update.saldo = FieldValue.increment(resolution.saldoDelta);
  if (resolution.cdtDelta) update.cdt = FieldValue.increment(resolution.cdtDelta);
  if (resolution.gastoHormigaEvitadoDelta) {
    update.gastoHormigaEvitado = FieldValue.increment(resolution.gastoHormigaEvitadoDelta);
  }
  if (resolution.movimiento) update.movimientos = FieldValue.arrayUnion(resolution.movimiento);
  return update;
}
