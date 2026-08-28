import { Screen, Card, Button } from "@/components/ui";

// Pantalla 3 - confirmacion_compra (empanadas / botilito)
// TODO (Fase 2):
//  - leer ?c=<stand> del QR, validar contra GET /api/me
//  - "Confirmar compra" -> POST /api/pagar { stand }  (idempotente)
//  - "Prefiero ahorrar" -> POST /api/pagar { stand, ahorrar: true }
//  - redirigir a /movimientos
export default function PagarPage() {
  return (
    <Screen>
      <h1 className="text-center text-2xl font-extrabold">Escanea el producto</h1>
      <p className="mt-2 text-center text-white/70">
        Apunta al código QR del stand para pagar con tu bolsillo
      </p>

      <div className="mx-auto mt-8 grid h-56 w-56 place-items-center rounded-3xl border border-white/15 bg-bcs-navy-700 text-white/40">
        [ escáner QR ]
      </div>

      <Card className="mt-8">
        <p className="text-sm font-bold uppercase tracking-wide text-bcs-blue-600">
          Stand 1 · Gasto hormiga
        </p>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-2xl font-extrabold">Empanadas</span>
          <span className="text-2xl font-extrabold text-bcs-red">-$5.000</span>
        </div>
        <div className="mt-3 flex items-center justify-between border-t border-slate-200 pt-3 text-slate-500">
          <span>Saldo después de pagar</span>
          <span className="font-bold text-bcs-navy">$5.000</span>
        </div>
        <Button as="link" href="/movimientos" className="mt-4">
          Confirmar compra
        </Button>
        <Button as="link" href="/movimientos" variant="ghost" className="mt-1">
          Prefiero ahorrar este dinero
        </Button>
      </Card>

      <p className="mt-auto pt-8 text-center text-sm text-white/50">
        Cada decisión suma. Tu saldo es tu ahorro.
      </p>
    </Screen>
  );
}
