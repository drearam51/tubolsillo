"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Screen, Card, Button } from "@/components/ui";
import { STANDS } from "@/lib/config";
import { money } from "@/lib/format";

// Pantalla 2 - compras. Saldo, nombre y estado de cada parada vienen de /api/me.
export default function HomePage() {
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

  if (loading || !me) {
    return (
      <Screen>
        <p className="mt-20 text-center text-white/60">Cargando…</p>
      </Screen>
    );
  }

  const paradas = Object.entries(STANDS).sort((a, b) => a[1].parada - b[1].parada);
  const misteriosaHecha = Boolean(me.stands.misteriosa);
  const totalParadas = paradas.length + 1; // + caja misteriosa
  const resueltas = paradas.filter(([key]) => me.stands[key]).length + (misteriosaHecha ? 1 : 0);
  const completo = resueltas >= totalParadas;

  const cta = completo
    ? { texto: "Ver mi resumen", href: "/movimientos" }
    : resueltas === 0
      ? { texto: "Comenzar recorrido", href: "/pagar" }
      : { texto: "Seguir recorrido", href: "/pagar" };

  return (
    <Screen>
      <div className="flex items-center justify-between text-sm">
        <span>Hola, {me.nombre} 👋</span>
        <span className="text-white/60">Tubolsillo 9.75</span>
      </div>

      <div className="mt-8 text-center">
        <p className="text-white/70">Tu saldo disponible</p>
        <p className="mt-1 text-6xl font-extrabold">{money(me.saldo)}</p>
        <p className="mt-2 text-white/60">Recarga de bienvenida · Feria 115 años</p>
      </div>

      <Card className="mt-8">
        <h2 className="text-xl font-extrabold">
          {completo ? "¡Completaste el recorrido!" : "Te invitamos a recorrer nuestros stands"}
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          {completo
            ? "Revisa cómo te fue en cada parada y qué tan preparado quedó tu bolsillo."
            : `Conoce y adquiere nuestros productos y servicios. Llevas ${resueltas} de ${totalParadas} paradas.`}
        </p>
        <Button as="link" href={cta.href} className="mt-4">
          {cta.texto}
        </Button>
      </Card>

      <h3 className="mt-8 text-lg font-extrabold">Tus 4 paradas</h3>
      <ul className="mt-3 space-y-3">
        {paradas.map(([key, s]) => {
          const hecho = Boolean(me.stands[key]);
          return (
            <li
              key={key}
              className="flex items-center justify-between rounded-2xl bg-white/95 p-4 text-bcs-navy"
            >
              <span className="flex items-center gap-3">
                <span
                  className={`grid h-8 w-8 place-items-center rounded-full text-sm font-bold ${
                    hecho ? "bg-bcs-blue-600 text-white" : "bg-bcs-blue-400/20"
                  }`}
                >
                  {hecho ? "✓" : s.parada}
                </span>
                {s.nombre}
              </span>
              <span className="font-extrabold">
                {s.tipo === "cdt" ? `Desde ${money(s.minimo)}` : money(s.valor)}
              </span>
            </li>
          );
        })}
        <li className="flex items-center justify-between rounded-2xl bg-bcs-navy-700 p-4">
          <span className="flex items-center gap-3">
            <span
              className={`grid h-8 w-8 place-items-center rounded-full text-sm font-bold ${
                misteriosaHecha ? "bg-bcs-blue-400 text-bcs-navy" : "bg-bcs-blue-600 text-white"
              }`}
            >
              {misteriosaHecha ? "✓" : 4}
            </span>
            Caja misteriosa
          </span>
          <span className="text-white/60">¿?</span>
        </li>
      </ul>
    </Screen>
  );
}
