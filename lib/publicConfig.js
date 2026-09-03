// Copia liviana de lib/config.js pensada para el navegador: solo lo necesario
// para mostrar precios en pantalla ANTES de confirmar. La fuente de verdad para
// cobrar sigue siendo el servidor (lib/config.js + lib/domain.js) -- si alguien
// manipula esto en el cliente no logra nada, la API vuelve a validar todo.
export const STAND_LABELS = {
  empanadas: { nombre: "Empanadas", etiqueta: "Gasto hormiga", parada: 1, valor: 5000 },
  botilito: { nombre: "Botilito corporativo", etiqueta: "Gasto hormiga", parada: 2, valor: 5000 },
};
