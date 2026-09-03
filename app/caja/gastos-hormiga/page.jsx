"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Screen, Button } from "@/components/ui";
import { SALDO_INICIAL } from "@/lib/config";
import { money } from "@/lib/format";

// Pantalla 5.1 - gastos_hormiga. Solo se muestra si /api/me confirma que la
// caja misteriosa quedo SIN cubrir -- si no, redirige.
export default function GastosHormigaPage() {
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
    if (!m || m.cubierto) router.replace(m ? "/caja/ahorro" : "/home");
  }, [me, router]);

  if (loading || !me || !me.stands.misteriosa || me.stands.misteriosa.cubierto) {
    return (
      <Screen>
        <p className="mt-20 text-center text-white/60">Cargando…</p>
      </Screen>
    );
  }

  const m = me.stands.misteriosa;
  const gastado = SALDO_INICIAL - me.saldo;
  const ahorroDisponible = me.saldo + me.cdt;

  return (
    <Screen className="items-center text-center">
      <div className="mt-10 grid h-24 w-24 place-items-center rounded-full bg-bcs-red text-4xl">⚠</div>
      <h1 className="mt-8 text-4xl font-extrabold">Tu saldo se fue en gastos hormiga</h1>

      <div className="mt-8 w-full rounded-card bg-white/10 p-6 text-left">
        <Row label="Gastaste en la feria" value={money(gastado)} />
        <Row label="Ahorro disponible" value={money(ahorroDisponible)} />
        <div className="my-3 border-t border-white/15" />
        <Row label="Imprevisto sin cubrir" value={`-${money(m.costo)}`} valueClass="text-bcs-red-400" bold />
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
