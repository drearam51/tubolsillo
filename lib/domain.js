// Reglas de negocio puras: reciben el estado actual del participante y devuelven
// que cambiar, sin tocar Firestore. Las rutas de /api aplican el resultado dentro
// de una transaccion. Ver docs/analisis-arquitectura.md secciones 2 y 6.
import { AppError } from "@/lib/errors";
import { STANDS, IMPREVISTOS, CDT_CUBRE_IMPREVISTO } from "@/lib/config";

// Empanadas / botilito: "comprar" descuenta saldo, "ahorrar" no mueve dinero
// pero cuenta como gasto hormiga evitado (ver seccion 2 del analisis).
export function resolvePagar(data, standKey, decision) {
  const stand = STANDS[standKey];
  if (!stand || stand.tipo !== "gasto") throw new AppError("STAND_INVALIDO", 400);
  if (!["comprar", "ahorrar"].includes(decision)) {
    throw new AppError("DECISION_INVALIDA", 400);
  }

  if (data.stands?.[standKey]) return { changed: false };

  const ts = Date.now();
  if (decision === "comprar") {
    if (data.saldo < stand.valor) throw new AppError("SALDO_INSUFICIENTE", 402);
    return {
      changed: true,
      standUpdate: { status: "comprado", monto: stand.valor, ts },
      saldoDelta: -stand.valor,
      movimiento: { tipo: "compra", label: stand.nombre, monto: -stand.valor, stand: standKey, ts },
    };
  }

  return {
    changed: true,
    standUpdate: { status: "ahorrado", monto: 0, ts },
    saldoDelta: 0,
    gastoHormigaEvitadoDelta: stand.valor,
    movimiento: { tipo: "ahorro", label: `${stand.nombre} · no comprado`, monto: 0, stand: standKey, ts },
  };
}

// CDT: monto > 0 aporta (>= minimo, <= saldo); monto 0/ausente = "ahora no".
export function resolveCdt(data, monto) {
  if (data.stands?.cdt) return { changed: false };

  const ts = Date.now();
  const valor = Number(monto) || 0;

  if (valor === 0) {
    return { changed: true, standUpdate: { status: "omitido", monto: 0, ts } };
  }
  if (valor < STANDS.cdt.minimo) {
    throw new AppError("MONTO_MINIMO", 400, `El aporte minimo es ${STANDS.cdt.minimo}`);
  }
  if (valor > data.saldo) throw new AppError("SALDO_INSUFICIENTE", 402);

  return {
    changed: true,
    standUpdate: { status: "aportado", monto: valor, ts },
    saldoDelta: -valor,
    cdtDelta: valor,
    movimiento: { tipo: "cdt", label: "CDT Banco Caja Social", monto: -valor, stand: "cdt", ts },
  };
}

// Caja misteriosa: el servidor decide si cubre o no, el cliente no envia una
// "decision" (ver seccion 6: el precio y el resultado los pone el servidor).
export function resolveImprevisto(data, imprevistoKey) {
  const imprevisto = IMPREVISTOS[imprevistoKey];
  if (!imprevisto) throw new AppError("IMPREVISTO_INVALIDO", 400);

  if (data.stands?.misteriosa) {
    const m = data.stands.misteriosa;
    return { changed: false, cubierto: m.cubierto, costo: m.costo };
  }

  const ts = Date.now();
  const costo = imprevisto.costo;
  const recursos = data.saldo + (CDT_CUBRE_IMPREVISTO ? data.cdt : 0);
  const cubierto = recursos >= costo;

  if (!cubierto) {
    return {
      changed: true,
      cubierto: false,
      costo,
      standUpdate: { imprevisto: imprevistoKey, costo, cubierto: false, medioPago: null, ts },
      movimiento: { tipo: "imprevisto", label: imprevisto.nombre, monto: 0, stand: "misteriosa", ts },
    };
  }

  const deSaldo = Math.min(data.saldo, costo);
  const deCdt = costo - deSaldo;
  return {
    changed: true,
    cubierto: true,
    costo,
    standUpdate: {
      imprevisto: imprevistoKey,
      costo,
      cubierto: true,
      medioPago: deCdt > 0 ? "ahorro+cdt" : "ahorro",
      ts,
    },
    saldoDelta: -deSaldo,
    cdtDelta: -deCdt,
    movimiento: { tipo: "imprevisto", label: imprevisto.nombre, monto: -costo, stand: "misteriosa", ts },
  };
}
