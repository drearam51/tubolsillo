import { Screen, Card, Button } from "@/components/ui";

// Parada 3 - CDT Banco Caja Social (pantalla nueva, no estaba en el set original)
// TODO (Fase 2):
//  - input de monto a aportar (>= minimo, <= saldo)
//  - POST /api/cdt { monto }  -> saldo -= monto, cdt += monto
//  - redirigir a /movimientos
export default function CdtPage() {
  return (
    <Screen>
      <h1 className="text-center text-2xl font-extrabold">CDT Banco Caja Social</h1>
      <p className="mt-2 text-center text-white/70">
        Un producto financiero: decides cuánto de tu bolsillo quieres poner a trabajar.
      </p>

      <Card className="mt-8">
        <p className="text-sm font-bold uppercase tracking-wide text-bcs-blue-600">
          Stand 3 · Producto financiero
        </p>
        <label className="mt-4 block text-sm text-slate-500">¿Cuánto quieres aportar?</label>
        <input
          inputMode="numeric"
          placeholder="5.000"
          className="mt-1 w-full rounded-xl bg-slate-100 px-4 py-3 text-lg"
        />
        <p className="mt-2 text-xs text-slate-400">Mínimo $5.000 · No puede superar tu saldo</p>

        <Button as="link" href="/movimientos" className="mt-5">
          Abrir mi CDT
        </Button>
        <Button as="link" href="/movimientos" variant="ghost" className="mt-1">
          Ahora no
        </Button>
      </Card>
    </Screen>
  );
}
