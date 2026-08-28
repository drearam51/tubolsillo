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
| Base de datos | MongoDB Atlas M0 |
| Sesión | JWT firmado (`jose`) |
| Deploy | Vercel (capa gratuita) |

## Desarrollo

```bash
npm install
cp .env.example .env        # completar MONGODB_URI, SESSION_SECRET, ADMIN_PASSWORD
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
lib/
  config.js            Parámetros de la dinámica (stands, imprevistos, montos)
  db.js                Conexión MongoDB cacheada
  session.js           Token de sesión del participante
scripts/
  gen-qr.mjs           Genera los PNG de QR para imprimir
```

## Estado

- [x] Fase 0 · Esqueleto (rutas placeholder, config, componentes base)
- [ ] Fase 1 · Modelo de datos + API con idempotencia
- [ ] Fase 2 · Pantallas conectadas + PWA
- [ ] Fase 3 · Dashboard admin + generación de QR
- [ ] Fase 4 · Pruebas + deploy
