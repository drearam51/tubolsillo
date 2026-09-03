"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Screen, Card, Button } from "@/components/ui";
import { QrScanner } from "@/components/QrScanner";
import { STANDS } from "@/lib/config";
import { money } from "@/lib/format";

const info = STANDS.cdt;

// Parada 3 - CDT. Solo hay un stand posible aqui, asi que el escaneo confirma
// presencia en el stand mas que "cual stand es" (mismo patron que /pagar).
export default function CdtClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const scannedRef = useRef(false);

  const [scanned, setScanned] = useState(() => searchParams.get("c") === "cdt");
  const [scanError, setScanError] = useState(() => {
    const initial = searchParams.get("c");
    return initial && initial !== "cdt"
      ? "Ese enlace no corresponde al stand de CDT. Escanea el código impreso."
      : null;
  });
  const [me, setMe] = useState(null);
  const [loadingMe, setLoadingMe] = useState(true);
  const [monto, setMonto] = useState("");
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
      if (url.searchParams.get("c") === "cdt" && url.pathname === "/cdt") {
        scannedRef.current = true;
        setScanError(null);
        setScanned(true);
        return;
      }
      if (url.pathname !== "/cdt") {
        // QR valido de Tubolsillo pero de otra parada
        scannedRef.current = true;
        router.push(url.pathname + url.search);
        return;
      }
      setScanError("Ese código QR no es del stand de CDT. Intenta con otro.");
    },
    [router]
  );

  function reintentarEscaneo() {
    scannedRef.current = false;
    setScanned(false);
    setScanError(null);
    setError(null);
  }

  async function resolver(montoAportar) {
    setBusy(true);
    setError(null);
    try {
      const r = await fetch("/api/cdt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ monto: montoAportar }),
      });
      const data = await r.json();
      if (!data.ok) {
        setError(data.message || "No pudimos procesar el aporte. Intenta de nuevo.");
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

  // Ya se resolvio (aporto o "ahora no") en esta sesion de pantalla
  if (resultado) {
    const registro = resultado.stands.cdt;
    const aportado = registro?.status === "aportado";
    return (
      <Screen>
        <h1 className="text-center text-2xl font-extrabold">
          {aportado ? "¡CDT abierto!" : "Seguiste de largo"}
        </h1>
        <Card className="mt-8">
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold">CDT Banco Caja Social</span>
            <span className={`text-lg font-extrabold ${aportado ? "text-bcs-red" : "text-slate-400"}`}>
              {aportado ? `-${money(registro.monto)}` : "$0"}
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-slate-200 pt-3 text-slate-500">
            <span>Saldo actual</span>
            <span className="font-bold text-bcs-navy">{money(resultado.saldo)}</span>
          </div>
          <Button as="link" href="/home" className="mt-4">
            Volver al recorrido
          </Button>
        </Card>
      </Screen>
    );
  }

  // Stand confirmado (por QR o deep link) -> formulario de aporte
  if (scanned) {
    const yaResuelto = me?.stands?.cdt;
    return (
      <Screen>
        <h1 className="text-center text-2xl font-extrabold">
          {yaResuelto ? "Ya pasaste por este stand" : "CDT Banco Caja Social"}
        </h1>
        <p className="mt-2 text-center text-white/70">
          Un producto financiero: decides cuánto de tu bolsillo quieres poner a trabajar.
        </p>

        <Card className="mt-8">
          <p className="text-sm font-bold uppercase tracking-wide text-bcs-blue-600">
            Stand {info.parada} · {info.etiqueta}
          </p>
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
              <label className="mt-4 block text-sm text-slate-500">¿Cuánto quieres aportar?</label>
              <input
                inputMode="numeric"
                value={monto}
                onChange={(e) => setMonto(e.target.value.replace(/\D/g, ""))}
                placeholder={String(info.minimo)}
                className="mt-1 w-full rounded-xl bg-slate-100 px-4 py-3 text-lg"
              />
              <p className="mt-2 text-xs text-slate-400">
                Mínimo {money(info.minimo)} · No puede superar tu saldo ({money(me?.saldo)})
              </p>

              {error && <p className="mt-3 text-sm text-bcs-red">{error}</p>}

              <Button onClick={() => resolver(Number(monto))} disabled={busy || !monto} className="mt-5">
                {busy ? "Procesando…" : "Abrir mi CDT"}
              </Button>
              <Button onClick={() => resolver(0)} disabled={busy} variant="ghost" className="mt-1">
                Ahora no
              </Button>
            </>
          )}
        </Card>
      </Screen>
    );
  }

  // Sin confirmar todavia -> camara dentro de la app
  return (
    <Screen>
      <h1 className="text-center text-2xl font-extrabold">Escanea el stand</h1>
      <p className="mt-2 text-center text-white/70">Apunta al código QR del stand de CDT</p>

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
