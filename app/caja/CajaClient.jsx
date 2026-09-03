"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Screen, Button } from "@/components/ui";
import { QrScanner } from "@/components/QrScanner";
import { IMPREVISTOS, CDT_CUBRE_IMPREVISTO } from "@/lib/config";
import { money } from "@/lib/format";

// Pantalla 5.2 - imprevisto (caja misteriosa).
// El servidor decide si se cubre o no (saldo + cdt vs. costo) -- el cliente no
// envia una "decision", solo pide resolver. Los dos botones del diseno original
// son informativos (cual aplica depende de si alcanza), no una eleccion libre;
// ver docs/analisis-arquitectura.md seccion 6.
export default function CajaClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const scannedRef = useRef(false);

  const [imprevisto, setImprevisto] = useState(() => {
    const v = searchParams.get("imprevisto");
    return v && IMPREVISTOS[v] ? v : null;
  });
  const [scanError, setScanError] = useState(() => {
    const v = searchParams.get("imprevisto");
    return v && !IMPREVISTOS[v]
      ? "Ese enlace no corresponde a un imprevisto válido. Escanea el código impreso."
      : null;
  });
  const [me, setMe] = useState(null);
  const [loadingMe, setLoadingMe] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

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
      .finally(() => !cancelled && setLoadingMe(false));
    return () => {
      cancelled = true;
    };
  }, [router]);

  // Si la caja misteriosa ya se resolvio antes (otra pestana, recargo la
  // pagina), no la volvemos a mostrar: saltamos directo al desenlace real.
  useEffect(() => {
    if (!me) return;
    const m = me.stands.misteriosa;
    if (m) router.replace(m.cubierto ? "/caja/ahorro" : "/caja/gastos-hormiga");
  }, [me, router]);

  const handleDecode = useCallback(
    (text) => {
      if (scannedRef.current) return;
      let url;
      try {
        url = new URL(text, window.location.origin);
      } catch {
        setScanError("No reconocimos ese código. Intenta de nuevo.");
        return;
      }
      if (url.origin !== window.location.origin) {
        setScanError("Ese código QR no es de Tubolsillo. Intenta con otro.");
        return;
      }
      const v = url.searchParams.get("imprevisto");
      if (v && IMPREVISTOS[v]) {
        scannedRef.current = true;
        setScanError(null);
        setImprevisto(v);
        return;
      }
      if (url.pathname !== "/caja") {
        // QR valido de Tubolsillo pero de otra parada
        scannedRef.current = true;
        router.push(url.pathname + url.search);
        return;
      }
      setScanError("Ese código QR no es de un imprevisto válido. Intenta con otro.");
    },
    [router]
  );

  function reintentarEscaneo() {
    scannedRef.current = false;
    setImprevisto(null);
    setScanError(null);
    setError(null);
  }

  async function resolver() {
    setBusy(true);
    setError(null);
    try {
      const r = await fetch("/api/imprevisto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imprevisto }),
      });
      const data = await r.json();
      if (!data.ok) {
        setError(data.message || "No pudimos procesar el imprevisto. Intenta de nuevo.");
        return;
      }
      router.push(data.cubierto ? "/caja/ahorro" : "/caja/gastos-hormiga");
    } catch {
      setError("Problema de conexión. Intenta de nuevo.");
    } finally {
      setBusy(false);
    }
  }

  if (loadingMe || me?.stands?.misteriosa) {
    return (
      <Screen>
        <p className="mt-20 text-center text-white/60">Cargando…</p>
      </Screen>
    );
  }

  // Imprevisto identificado (por QR o deep link) -> pedir resolver
  if (imprevisto) {
    const info = IMPREVISTOS[imprevisto];
    const recursos = (me?.saldo || 0) + (CDT_CUBRE_IMPREVISTO ? me?.cdt || 0 : 0);
    const alcanza = recursos >= info.costo;
    return (
      <Screen>
        <p className="text-center text-sm font-bold uppercase tracking-wide text-bcs-blue-400">
          Caja misteriosa · Parada 4
        </p>
        <h1 className="mt-3 text-center text-4xl font-extrabold">Te salió un imprevisto</h1>

        <div className="mx-auto mt-8 w-full rounded-3xl border border-white/15 bg-bcs-navy-700 p-6 text-center">
          <p className="text-lg font-extrabold">{info.nombre}</p>
          <p className="mt-1 text-sm text-white/60">Nadie lo planeó, pero pasó. Cubrirlo cuesta:</p>
          <p className="mt-2 text-4xl font-extrabold">{money(info.costo)}</p>
        </div>

        <p className="mt-6 text-center text-white/70">¿Cómo lo vas a cubrir?</p>
        {error && <p className="mt-3 text-center text-sm text-bcs-red-400">{error}</p>}
        <div className="mt-3 space-y-3">
          {alcanza ? (
            <Button onClick={resolver} disabled={busy} variant="light">
              {busy ? "Procesando…" : `Usar mi ahorro disponible · ${money(info.costo)}`}
            </Button>
          ) : (
            <Button onClick={resolver} disabled={busy} variant="outline">
              {busy ? "Procesando…" : "No me queda saldo"}
            </Button>
          )}
        </div>

        <p className="mt-auto pt-8 text-center text-sm text-white/50">
          Los imprevistos no avisan. El ahorro sí responde.
        </p>
      </Screen>
    );
  }

  // Sin imprevisto todavia -> camara dentro de la app
  return (
    <Screen>
      <h1 className="text-center text-2xl font-extrabold">Escanea la caja misteriosa</h1>
      <p className="mt-2 text-center text-white/70">Apunta al código QR de la parada 4</p>

      <div className="mt-8">
        <QrScanner onDecode={handleDecode} />
      </div>

      {scanError && (
        <div className="mt-4 text-center">
          <p className="text-sm text-bcs-red-400">{scanError}</p>
          <button onClick={reintentarEscaneo} className="mt-2 text-sm text-white/70 underline">
            Volver a intentar
          </button>
        </div>
      )}
    </Screen>
  );
}
