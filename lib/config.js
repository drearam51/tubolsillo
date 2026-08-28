// Parametros de la dinamica. Ajustables sin tocar la logica.

export const SALDO_INICIAL = 10000;

// Si es true, el dinero aportado al CDT tambien cuenta como recurso para
// cubrir el imprevisto de la caja misteriosa (ver docs/analisis-arquitectura.md, seccion 2).
export const CDT_CUBRE_IMPREVISTO = true;

// Stands del recorrido. La clave (empanadas, botilito, cdt) es la que viaja en el QR: ?c=empanadas
export const STANDS = {
  empanadas: {
    parada: 1,
    nombre: "Empanadas",
    etiqueta: "Gasto hormiga",
    tipo: "gasto",
    valor: 5000,
  },
  botilito: {
    parada: 2,
    nombre: "Botilito corporativo",
    etiqueta: "Gasto hormiga",
    tipo: "gasto",
    valor: 5000,
  },
  cdt: {
    parada: 3,
    nombre: "CDT Banco Caja Social",
    etiqueta: "Producto financiero",
    tipo: "cdt",
    minimo: 5000,
  },
};

// Imprevistos posibles de la caja misteriosa. La clave viaja en el QR: ?imprevisto=vidrio
export const IMPREVISTOS = {
  vidrio: { nombre: "Se rompio un vidrio en tu casa", costo: 5000 },
  cerrajero: { nombre: "Te quedaste por fuera y necesitas cerrajero", costo: 5000 },
  enfermedad: { nombre: "Gasto medico inesperado", costo: 5000 },
  llanta: { nombre: "Se pincho tu llanta", costo: 5000 },
};

export const STAND_KEYS = Object.keys(STANDS);
export const IMPREVISTO_KEYS = Object.keys(IMPREVISTOS);
