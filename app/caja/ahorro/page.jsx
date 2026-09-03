"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Screen } from "@/components/ui";
import { money } from "@/lib/format";

// Pantalla 5.3 - respuesta_ahorro. Solo se muestra si /api/me confirma que la
// caja misteriosa quedo cubierta -- si no, redirige (nadie llega aca "de fantasia").
export default function AhorroPage() {
  const router = useRouter();
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/me")
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        if (!data.ok) {
          router.replace("/");
          return;
        }
        setMe(data);
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [router]);

  useEffect(() => {
    if (!me) return;
    const m = me.stands.misteriosa;
    if (!m || !m.cubierto) router.replace(m ? "/caja/gastos-hormiga" : "/home");
  }, [me, router]);

  if (loading || !me || !me.stands.misteriosa?.cubierto) {
    return (
      <Screen>
        <p className="mt-20 text-center text-white/60">Cargando…</p>
      </Screen>
    );
  }

  const m = me.stands.misteriosa;
  // saldo/cdt ya reflejan el descuento del imprevisto -> sumamos el costo de
  // vuelta para mostrar cuanto tenian disponible antes de cubrirlo.
  const ahorroDisponible = me.saldo + me.cdt + m.costo;

  return (
    <Screen className="items-center text-center">
      <div className="mt-10 grid h-24 w-24 place-items-center rounded-full bg-white text-4xl text-bcs-blue-600">
        ✓
      </div>
      <h1 className="mt-8 text-4xl font-extrabold">¡Tu ahorro te respondió!</h1>

      <div className="mt-8 w-full rounded-card bg-white p-6 text-left text-bcs-navy">
        <Row label="Ahorro disponible" value={money(ahorroDisponible)} />
        <Row label="Costo del imprevisto" value={`-${money(m.costo)}`} valueClass="text-bcs-red" />
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
