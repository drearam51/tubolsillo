import { Screen } from "@/components/ui";

// Pantalla 5.3 - respuesta_ahorro (el ahorro cubre el imprevisto)
export default function AhorroPage() {
  return (
    <Screen className="items-center text-center">
      <div className="mt-10 grid h-24 w-24 place-items-center rounded-full bg-white text-4xl text-bcs-blue-600">
        ✓
      </div>
      <h1 className="mt-8 text-4xl font-extrabold">¡Tu ahorro te respondió!</h1>

      <div className="mt-8 w-full rounded-card bg-white p-6 text-left text-bcs-navy">
        <Row label="Ahorro disponible" value="$5.000" />
        <Row label="Costo del imprevisto" value="-$5.000" valueClass="text-bcs-red" />
        <div className="my-3 border-t border-slate-200" />
        <Row label="Imprevisto cubierto" value="$0 en deuda" valueClass="text-bcs-blue-600" bold />
      </div>

      <p className="mt-6 text-white/80">
        Cuando cuidas tus gastos pequeños, construyes el respaldo que te sostiene ante lo inesperado.
        Eso es tener el bolsillo tranquilo.
      </p>

      <p className="mt-auto pt-8 text-sm text-white/50">
        Una campaña de Fundación Grupo Social y sus empresas · 115 años
      </p>
    </Screen>
  );
}

function Row({ label, value, valueClass = "", bold }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className={bold ? "font-extrabold" : "text-slate-500"}>{label}</span>
      <span className={`font-extrabold ${valueClass}`}>{value}</span>
    </div>
  );
}
