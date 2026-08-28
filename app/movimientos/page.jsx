import { Screen, Button } from "@/components/ui";

// Pantalla 4 - movimientos
// TODO (Fase 2): cargar saldo + movimientos desde GET /api/me
export default function MovimientosPage() {
  return (
    <Screen tone="light">
      <div className="-mx-5 -mt-8 rounded-b-3xl bg-bcs-navy px-5 pb-6 pt-8 text-white">
        <p className="text-sm text-white/60">Tubolsillo 9.75</p>
        <div className="mt-4 text-center">
          <p className="text-white/70">Saldo actual</p>
          <p className="mt-1 text-5xl font-extrabold">$5.000</p>
          <p className="mt-1 text-sm text-white/60">Has gastado $5.000 de tu recarga</p>
        </div>
        <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-white/20">
          <div className="h-full w-1/2 rounded-full bg-bcs-blue-400" />
        </div>
      </div>

      <h2 className="mt-6 text-xl font-extrabold">Movimientos de hoy</h2>
      <ul className="mt-3 space-y-3">
        {[
          ["Empanadas", "Stand 1 · 10:12 a.m. · QR", "-$5.000", "text-bcs-red"],
          ["Botilito · no comprado", "Stand 2 · decidiste ahorrar", "+$0", "text-bcs-blue-600"],
          ["Recarga de bienvenida", "Feria 115 años · 10:00 a.m.", "+$10.000", "text-bcs-blue-600"],
        ].map(([t, sub, amt, color]) => (
          <li key={t} className="flex items-center justify-between rounded-2xl bg-white p-4">
            <span>
              <span className="block font-bold">{t}</span>
              <span className="block text-sm text-slate-400">{sub}</span>
            </span>
            <span className={`font-extrabold ${color}`}>{amt}</span>
          </li>
        ))}
      </ul>

      <div className="mt-6 rounded-2xl bg-bcs-blue-400/15 p-4 text-sm text-bcs-navy">
        💡 Los gastos hormiga son pequeños, pero suman. Revisa cuánto se va sin que lo notes.
      </div>

      <Button as="link" href="/home" variant="ghost" className="mt-4">
        Volver al recorrido
      </Button>
    </Screen>
  );
}
