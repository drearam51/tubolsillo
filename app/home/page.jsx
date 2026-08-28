import { Screen, Card, Button } from "@/components/ui";
import { STANDS } from "@/lib/config";
import { money } from "@/lib/format";

// Pantalla 2 - compras
// TODO (Fase 2): cargar saldo y estado de paradas desde GET /api/me
export default function HomePage() {
  const paradas = Object.entries(STANDS).sort((a, b) => a[1].parada - b[1].parada);

  return (
    <Screen>
      <div className="flex items-center justify-between text-sm">
        <span>Hola 👋</span>
        <span className="text-white/60">Tubolsillo 9.75</span>
      </div>

      <div className="mt-8 text-center">
        <p className="text-white/70">Tu saldo disponible</p>
        <p className="mt-1 text-6xl font-extrabold">$10.000</p>
        <p className="mt-2 text-white/60">Recarga de bienvenida · Feria 115 años</p>
      </div>

      <Card className="mt-8">
        <h2 className="text-xl font-extrabold">Te invitamos a recorrer nuestros stands</h2>
        <p className="mt-2 text-sm text-slate-500">
          Conoce y adquiere nuestros productos y servicios. Cada compra se descuenta de tu bolsillo.
        </p>
        <Button as="link" href="/pagar" className="mt-4">
          Comenzar recorrido
        </Button>
      </Card>

      <h3 className="mt-8 text-lg font-extrabold">Tus 4 paradas</h3>
      <ul className="mt-3 space-y-3">
        {paradas.map(([key, s]) => (
          <li key={key} className="flex items-center justify-between rounded-2xl bg-white/95 p-4 text-bcs-navy">
            <span className="flex items-center gap-3">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-bcs-blue-400/20 text-sm font-bold">
                {s.parada}
              </span>
              {s.nombre}
            </span>
            <span className="font-extrabold">
              {s.tipo === "cdt" ? `Desde ${money(s.minimo)}` : money(s.valor)}
            </span>
          </li>
        ))}
        <li className="flex items-center justify-between rounded-2xl bg-bcs-navy-700 p-4">
          <span className="flex items-center gap-3">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-bcs-blue-600 text-sm font-bold">
              4
            </span>
            Caja misteriosa
          </span>
          <span className="text-white/60">¿?</span>
        </li>
      </ul>
    </Screen>
  );
}
