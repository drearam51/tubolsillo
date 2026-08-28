import { Screen, Button } from "@/components/ui";

// Pantalla 5.2 - imprevisto (caja misteriosa)
// TODO (Fase 2):
//  - leer ?imprevisto=<key> del QR
//  - GET /api/me para saber recursos disponibles (saldo [+ cdt])
//  - "Usar mi ahorro" -> POST /api/imprevisto -> segun resultado ir a /caja/ahorro o /caja/gastos-hormiga
export default function CajaPage() {
  return (
    <Screen>
      <p className="text-center text-sm font-bold uppercase tracking-wide text-bcs-blue-400">
        Caja misteriosa · Parada 4
      </p>
      <h1 className="mt-3 text-center text-4xl font-extrabold">Te salió un imprevisto</h1>

      <div className="mx-auto mt-8 w-full rounded-3xl border border-white/15 bg-bcs-navy-700 p-6 text-center">
        <p className="text-lg font-extrabold">Se pinchó tu llanta</p>
        <p className="mt-1 text-sm text-white/60">Nadie lo planeó, pero pasó. Cubrirlo cuesta:</p>
        <p className="mt-2 text-4xl font-extrabold">$5.000</p>
      </div>

      <p className="mt-6 text-center text-white/70">¿Cómo lo vas a cubrir?</p>
      <div className="mt-3 space-y-3">
        <Button as="link" href="/caja/ahorro" variant="light">
          Usar mi ahorro disponible · $5.000
        </Button>
        <Button as="link" href="/caja/gastos-hormiga" variant="outline">
          No me queda saldo
        </Button>
      </div>

      <p className="mt-auto pt-8 text-center text-sm text-white/50">
        Los imprevistos no avisan. El ahorro sí responde.
      </p>
    </Screen>
  );
}
