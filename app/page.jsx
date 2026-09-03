"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Screen, Card, Button } from "@/components/ui";

// Pantalla 1 - inicio_session. Solo documento + nombre: el codigo de feria lo
// asigna y guarda el servidor, el participante nunca lo escribe (ver docs).
// POST /api/registro sirve para el primer ingreso y para volver a entrar.
export default function LoginPage() {
  const router = useRouter();
  const [documento, setDocumento] = useState("");
  const [nombre, setNombre] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [checking, setChecking] = useState(true);

  // Si ya hay una sesion valida (mismo celular, misma pestana), saltar el login.
  useEffect(() => {
    let cancelled = false;
    fetch("/api/me")
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled && data.ok) router.replace("/home");
      })
      .finally(() => !cancelled && setChecking(false));
    return () => {
      cancelled = true;
    };
  }, [router]);

  async function onSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const r = await fetch("/api/registro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documento, nombre }),
      });
      const data = await r.json();
      if (!data.ok) {
        setError(data.message || "No pudimos ingresar. Revisa tus datos.");
        return;
      }
      router.push("/home");
    } catch {
      setError("Problema de conexión. Intenta de nuevo.");
    } finally {
      setBusy(false);
    }
  }

  if (checking) {
    return (
      <Screen>
        <p className="mt-20 text-center text-white/60">Cargando…</p>
      </Screen>
    );
  }

  return (
    <Screen>
      <div className="pt-6 text-center">
        <p className="text-sm text-white/60">Banco Caja Social · Fundación Grupo Social</p>
        <h1 className="mt-10 text-5xl font-extrabold">Tubolsillo 9.75</h1>
        <p className="mt-3 text-lg text-white/80">Tu billetera digital de la Feria 115 años</p>
      </div>

      <Card className="mt-10">
        <h2 className="text-2xl font-extrabold">Inicia sesión</h2>
        <p className="mt-1 text-sm text-slate-500">Ingresa tu documento y tu nombre para activar tu saldo</p>

        <form onSubmit={onSubmit}>
          <label className="mt-5 block text-sm text-slate-500">Documento</label>
          <input
            value={documento}
            onChange={(e) => setDocumento(e.target.value)}
            inputMode="numeric"
            placeholder="1020345678"
            required
            className="mt-1 w-full rounded-xl bg-slate-100 px-4 py-3"
          />

          <label className="mt-4 block text-sm text-slate-500">Nombre</label>
          <input
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Nombre"
            required
            className="mt-1 w-full rounded-xl bg-slate-100 px-4 py-3"
          />

          {error && <p className="mt-3 text-sm text-bcs-red">{error}</p>}

          <Button type="submit" disabled={busy} className="mt-6">
            {busy ? "Ingresando…" : "Entrar a mi bolsillo"}
          </Button>
        </form>
      </Card>

      <p className="mt-auto pt-10 text-center text-sm text-white/50">
        Una campaña de Fundación Grupo Social y sus empresas
      </p>
    </Screen>
  );
}
