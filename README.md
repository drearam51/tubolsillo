# Tubolsillo 9.75

Billetera digital para la dinámica pedagógica de la **Feria 115 años del Banco Caja Social**.
~400 participantes recorren 4 estaciones con un saldo virtual de $10.000 y aprenden sobre
gasto hormiga, ahorro, CDT e imprevistos.

- Idea original: [`idea`](idea)
- Arquitectura sugerida: [`arquitectura`](arquitectura)
- **Análisis de arquitectura y decisiones**: [`docs/analisis-arquitectura.md`](docs/analisis-arquitectura.md)
- Pantallas de referencia: [`docs/`](docs/)

## Stack

| Capa | Tecnología |
|---|---|
| Frontend + API | Next.js 15 (App Router, JavaScript) |
| Estilos | Tailwind CSS (tokens BCS en `tailwind.config.js`) |
| Base de datos | Firebase Firestore (plan Spark, gratis sin tarjeta) |
| Sesión | JWT firmado (`jose`) |
| Deploy | Vercel (capa gratuita) |

## Desarrollo

```bash
npm install
cp .env.example .env        # completar FIREBASE_*, SESSION_SECRET, ADMIN_PASSWORD
npm run dev                  # http://localhost:3000
```

## Estructura

```
app/
  page.jsx              Pantalla 1 · login / registro
  home/                 Pantalla 2 · saldo + 4 paradas
  pagar/                Pantalla 3 · confirmar compra / prefiero ahorrar
  cdt/                  Parada 3 · aporte a CDT
  movimientos/          Pantalla 4 · saldo + historial
  caja/                 Pantalla 5.2 · imprevisto
  caja/ahorro/          Pantalla 5.3 · el ahorro respondió
  caja/gastos-hormiga/  Pantalla 5.1 · sin cubrir
  admin/                Dashboard de organizadores
  api/                  Funciones serverless
  api/
    registro/           POST documento+nombre -> crea participante, asigna codigo
    login/               POST documento+codigo -> re-ingreso
    logout/              POST borra la cookie de sesion
    me/                   GET participante autenticado
    pagar/               POST { stand, decision } -> empanadas/botilito
    cdt/                  POST { monto } -> aporte al CDT
    imprevisto/          POST { imprevisto } -> caja misteriosa (servidor decide si cubre)
    health/               GET chequeo de la funcion + ping a Firestore
lib/
  config.js            Parámetros de la dinámica (stands, imprevistos, montos)
  db.js                Cliente de Firestore (Firebase Admin SDK)
  session.js           Token de sesión del participante (JWT)
  authServer.js        Cookie de sesión (Route Handlers)
  domain.js            Reglas de negocio puras (sin Firestore) de cada endpoint
  applyResolution.js   Traduce el resultado de domain.js a un update de Firestore
  participant.js       Forma del documento del participante + vista para el cliente
  errors.js            AppError + respuesta de error uniforme
scripts/
  gen-qr.mjs           Genera los PNG de QR para imprimir
  reset-db.mjs         Borra participantes/códigos y verifica la conexión
```

## Estado

- [x] Fase 0 · Esqueleto (rutas placeholder, config, componentes base)
- [x] Base de datos en la nube (Firestore, plan Spark, $0)
- [x] Fase 1 · Modelo de datos + API con idempotencia — probado end-to-end
- [x] Fase 2 · Las 8 pantallas conectadas a la API real, cámara QR en la app — probado end-to-end
- [ ] Fase 3 · Dashboard admin + generación de QR para imprimir
- [ ] Fase 4 · Pruebas de carga, PWA (manifest ya existe, falta service worker) + deploy final
