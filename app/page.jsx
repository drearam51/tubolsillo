import { Screen, Card, Button } from "@/components/ui";

// Pantalla 1 - inicio_session
// TODO (Fase 2): formulario real -> POST /api/registro, guarda sesion, redirige a /home
export default function LoginPage() {
  return (
    <Screen>
      <div className="pt-6 text-center">
        <p className="text-sm text-white/60">Banco Caja Social · Fundación Grupo Social</p>
        <h1 className="mt-10 text-5xl font-extrabold">Tubolsillo 9.75</h1>
        <p className="mt-3 text-lg text-white/80">Tu billetera digital de la Feria 115 años</p>
      </div>

      <Card className="mt-10">
        <h2 className="text-2xl font-extrabold">Inicia sesión</h2>
        <p className="mt-1 text-sm text-slate-500">Ingresa con tu documento para activar tu saldo</p>

        <label className="mt-5 block text-sm text-slate-500">Documento</label>
        <input
          inputMode="numeric"
          placeholder="1.020.345.678"
          className="mt-1 w-full rounded-xl bg-slate-100 px-4 py-3"
        />

        <label className="mt-4 block text-sm text-slate-500">Código de la feria</label>
        <input
          inputMode="numeric"
          maxLength={4}
          placeholder="····"
          className="mt-1 w-full rounded-xl bg-slate-100 px-4 py-3 tracking-widest"
        />

        <Button as="link" href="/home" className="mt-6">
          Entrar a mi bolsillo
        </Button>
      </Card>

      <p className="mt-auto pt-10 text-center text-sm text-white/50">
        Una campaña de Fundación Grupo Social y sus empresas
      </p>
    </Screen>
  );
}
