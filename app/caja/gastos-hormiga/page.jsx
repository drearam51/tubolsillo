import { Screen, Button } from "@/components/ui";

// Pantalla 5.1 - gastos_hormiga (el saldo se fue, el imprevisto queda sin cubrir)
export default function GastosHormigaPage() {
  return (
    <Screen className="items-center text-center">
      <div className="mt-10 grid h-24 w-24 place-items-center rounded-full bg-bcs-red text-4xl">
        ⚠
      </div>
      <h1 className="mt-8 text-4xl font-extrabold">Tu saldo se fue en gastos hormiga</h1>

      <div className="mt-8 w-full rounded-card bg-white/10 p-6 text-left">
        <Row label="Gastaste en la feria" value="$10.000" />
        <Row label="Ahorro disponible" value="$0" />
        <div className="my-3 border-t border-white/15" />
        <Row label="Imprevisto sin cubrir" value="-$5.000" valueClass="text-bcs-red-400" bold />
      </div>

      <p className="mt-6 text-white/80">
        Los gastos pequeños no se sienten hoy, pero deciden cómo respondes mañana. Guardar un
        porcentaje de tus ingresos convierte un imprevisto en un momento manejable.
      </p>

      <Button as="link" href="/" variant="light" className="mt-8">
        Quiero empezar a ahorrar
      </Button>

      <p className="mt-auto pt-6 text-sm text-white/50">
        Una campaña de Fundación Grupo Social y sus empresas · 115 años
      </p>
    </Screen>
  );
}

function Row({ label, value, valueClass = "", bold }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className={bold ? "font-extrabold" : "text-white/70"}>{label}</span>
      <span className={`font-extrabold ${valueClass}`}>{value}</span>
    </div>
  );
}
