const fmt = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

// 5000 -> "$5.000" ; -5000 -> "-$5.000"
export function money(value) {
  const n = Number(value) || 0;
  const s = fmt.format(Math.abs(n)).replace(/\s/g, "");
  return n < 0 ? `-${s}` : s;
}

// 5000 -> "+$5.000" (para movimientos)
export function signedMoney(value) {
  const n = Number(value) || 0;
  if (n > 0) return `+${money(n)}`;
  return money(n);
}
