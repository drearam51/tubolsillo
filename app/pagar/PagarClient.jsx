"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Screen, Card, Button } from "@/components/ui";
import { QrScanner } from "@/components/QrScanner";
import { STANDS } from "@/lib/config";
import { money } from "@/lib/format";

// Esta pantalla solo maneja los stands de "gasto hormiga" (empanadas, botilito).
// El CDT es tipo "cdt" y tiene su propia pantalla (/cdt).
function esStandDeGasto(key) {
  return Boolean(STANDS[key] && STANDS[key].tipo === "gasto");
}

// Pantalla 3 - confirmacion_compra, para empanadas y botilito.
// Flujo: si llega con ?c=<stand> en la URL (deep link de un QR ya escaneado con
// la camara nativa del celular) salta directo a confirmar; si no, activa la
// camara dentro de la app (decision del equipo: ver conversacion).
export default function PagarClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const scannedRef = useRef(false);

  const [stand, setStand] = useState(() => searchParams.get("c"));
  const [scanError, setScanError] = useState(() => {
    const initial = searchParams.get("c");
    return initial && !esStandDeGasto(initial)
      ? "Ese enlace no corresponde a un stand válido. Escanea el código impreso."
      : null;
  });
  const [me, setMe] = useState(null);
  const [loadingMe, setLoadingMe] = useState(true);
  const [busy, setBusy] = useState(false);
  const [resultado, setResultado] = useState(null);
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

  const handleDecode = useCallback((text) => {
    if (scannedRef.current) return;
    let c;
    try {
      c = new URL(text, window.location.origin).searchParams.get("c");
    } catch {
      c = null;
    }
    if (!c || !esStandDeGasto(c)) {
      setScanError("Ese código QR no es de un stand válido. Intenta con otro.");
      return;
    }
    scannedRef.current = true;
    setScanError(null);
    setStand(c);
  }, []);

  function reintentarEscaneo() {
    scannedRef.current = false;
    setStand(null);
    setScanError(null);
    setError(null);
  }

  async function resolver(decision) {
    setBusy(true);
    setError(null);
    try {
      const r = await fetch("/api/pagar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stand, decision }),
      });
      const data = await r.json();
      if (!data.ok) {
        setError(data.message || "No pudimos procesar el pago. Intenta de nuevo.");
        return;
      }
      setResultado(data);
    } catch {
      setError("Problema de conexión. Intenta de nuevo.");
    } finally {
      setBusy(false);
    }
  }

  if (loadingMe) {
    return (
      <Screen>
        <p className="mt-20 text-center text-white/60">Cargando…</p>
      </Screen>
    );
  }

  // Ya se confirmo/ahorro en esta sesion de pantalla
  if (resultado) {
    const registro = resultado.stands[stand];
    const comprado = registro?.status === "comprado";
    return (
      <Screen>
        <h1 className="text-center text-2xl font-extrabold">
          {comprado ? "¡Compra confirmada!" : "Decidiste ahorrar"}
        </h1>
        <Card className="mt-8">
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold">{STANDS[stand].nombre}</span>
            <span className={`text-lg font-extrabold ${comprado ? "text-bcs-red" : "text-bcs-blue-600"}`}>
              {comprado ? `-${money(registro.monto)}` : "+$0"}
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-slate-200 pt-3 text-slate-500">
            <span>Saldo actual</span>
            <span className="font-bold text-bcs-navy">{money(resultado.saldo)}</span>
          </div>
          <Button as="link" href="/home" className="mt-4">
            Volver al recorrido
          </Button>
          <Button as="link" href="/movimientos" variant="ghost" className="mt-1">
            Ver movimientos
          </Button>
        </Card>
      </Screen>
    );
  }

  // Stand identificado (por QR o por deep link) -> confirmar
  if (stand && esStandDeGasto(stand)) {
    const info = STANDS[stand];
    const yaResuelto = me?.stands?.[stand];
    return (
      <Screen>
        <h1 className="text-center text-2xl font-extrabold">
          {yaResuelto ? "Ya pasaste por este stand" : "Confirma tu compra"}
        </h1>
        <Card className="mt-8">
          <p className="text-sm font-bold uppercase tracking-wide text-bcs-blue-600">
            Stand {info.parada} · {info.etiqueta}
          </p>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-2xl font-extrabold">{info.nombre}</span>
            <span className="text-2xl font-extrabold text-bcs-red">-{money(info.valor)}</span>
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-slate-200 pt-3 text-slate-500">
            <span>Tu saldo actual</span>
            <span className="font-bold text-bcs-navy">{money(me?.saldo)}</span>
          </div>

          {yaResuelto ? (
            <Button as="link" href="/home" className="mt-4">
              Volver al recorrido
            </Button>
          ) : (
            <>
              {error && <p className="mt-3 text-sm text-bcs-red">{error}</p>}
              <Button onClick={() => resolver("comprar")} disabled={busy} className="mt-4">
                {busy ? "Procesando…" : "Confirmar compra"}
              </Button>
              <Button onClick={() => resolver("ahorrar")} disabled={busy} variant="ghost" className="mt-1">
                Prefiero ahorrar este dinero
              </Button>
            </>
          )}
        </Card>
      </Screen>
    );
  }

  // Sin stand todavia -> camara dentro de la app
  return (
    <Screen>
      <h1 className="text-center text-2xl font-extrabold">Escanea el producto</h1>
      <p className="mt-2 text-center text-white/70">
        Apunta al código QR del stand para pagar con tu bolsillo
      </p>

      {/* Si llegamos aca es porque no hay un stand valido todavia (ni por deep
          link ni por escaneo previo) -- la camara siempre debe estar activa. */}
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

      <p className="mt-auto pt-8 text-center text-sm text-white/50">
        Cada decisión suma. Tu saldo es tu ahorro.
      </p>
    </Screen>
  );
}
