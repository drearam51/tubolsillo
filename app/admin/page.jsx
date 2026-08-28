import { Screen, Card } from "@/components/ui";

// Dashboard de organizadores (Fase 3)
// TODO:
//  - login con ADMIN_PASSWORD
//  - GET /api/admin -> aggregate sobre participants (polling cada 15-30s)
//  - metricas: registrados, % cubrio imprevisto vs % sin saldo, decisiones por stand,
//    adopcion CDT y monto promedio, ranking de imprevistos
export default function AdminPage() {
  return (
    <Screen tone="light">
      <h1 className="text-2xl font-extrabold">Dashboard · Feria 115 años</h1>
      <p className="mt-1 text-sm text-slate-500">Comportamiento de los participantes en vivo</p>

      <div className="mt-6 grid grid-cols-2 gap-3">
        {[
          ["Registrados", "—"],
          ["Cubrieron el imprevisto", "—"],
          ["Se quedaron sin saldo", "—"],
          ["Abrieron CDT", "—"],
        ].map(([k, v]) => (
          <Card key={k} className="p-4">
            <p className="text-sm text-slate-500">{k}</p>
            <p className="mt-1 text-3xl font-extrabold">{v}</p>
          </Card>
        ))}
      </div>

      <p className="mt-6 text-sm text-slate-400">Pendiente de conectar en la Fase 3.</p>
    </Screen>
  );
}
