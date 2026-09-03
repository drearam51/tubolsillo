# Análisis de arquitectura — Tubolsillo (Feria 115 años Banco Caja Social)

> Documento de análisis previo a implementación. Basado en la idea (`/idea`), la
> arquitectura sugerida (`/arquitectura`) y las 8 pantallas de `docs/`.

## 1. Alcance funcional

App móvil web para una dinámica pedagógica de ~400 empleados en una feria de un día.
El participante recorre 4 estaciones con un saldo virtual de $10.000 y aprende sobre
gasto hormiga, ahorro, producto financiero (CDT) e imprevistos.

### Pantallas y rol en el flujo

| Archivo | Rol |
|---|---|
| `Pantalla 1 - inicio_session` | Login: documento + código de feria (4 dígitos). El nombre y el código los asigna el sistema. |
| `Pantalla 2 - compras` | Home: saldo $10.000 + las 4 paradas |
| `Pantalla 3 - confirmacion_compra` | Escaneo QR + "Confirmar compra" / "Prefiero ahorrar este dinero" (aplica a empanadas y botilito) |
| `Pantalla 4 - movimientos` | Saldo actual + historial + progreso de gasto |
| `5.2 imprevisto` | Caja misteriosa: presenta el imprevisto y pregunta cómo cubrirlo |
| `5.1 gastos_hormiga` | Desenlace: **no** le alcanza (ahorro $0) |
| `5.3 respuesta_ahorro` | Desenlace: **sí** le alcanza (el ahorro cubre el imprevisto) |

### Orden real del cierre (parada 4)

```
Escanea QR de imprevisto
   -> 5.2  "Te salió un imprevisto" (elige cómo cubrir)
        -> "Usar mi ahorro disponible"  (habilitado si recursos >= costo)  -> 5.3
        -> "No me queda saldo"                                             -> 5.1
```

## 2. Modelo de saldo vs. ahorro

**No se necesitan dos bolsas de dinero.** Las pantallas 2 y 4 llaman al número "saldo
disponible"; las 5.1/5.3 al **mismo número** lo llaman "ahorro disponible". Ese cambio
de etiqueta *es* el mensaje pedagógico.

### Reglas

- **Un solo saldo líquido** `saldo`, arranca en $10.000.
- Paradas de gasto hormiga (empanadas, botilito):
  - **Confirmar compra** → `saldo -= valor`, movimiento `-$5.000`.
  - **Prefiero ahorrar** → no se mueve dinero, movimiento `+$0` "decidiste ahorrar",
    y se incrementa la métrica `gastoHormigaEvitado += 5000` (solo para dashboard y
    relato; **no** es dinero gastable).
- **CDT (parada 3)** — producto financiero, única parada que mueve dinero a otra
  sub-cuenta. El usuario elige cuánto aportar `A ≥ $5.000`:
  - `saldo -= A`, `cdt += A`, movimiento `-$A · CDT`.
- **Caja misteriosa (parada 4)**: el "ahorro disponible" que se compara contra el
  costo del imprevisto = `saldo` actual (+ `cdt` según configuración).

### Decisión pendiente del equipo pedagógico: ¿el CDT cubre el imprevisto?

- **Recomendación: SÍ** (mostrado aparte: "tu ahorro + tu CDT respondieron"). Es una
  feria de un banco promoviendo CDTs; bloquearlo mandaría el mensaje "no abras CDT".
- Dejarlo como **flag de configuración** (`cdtCuentaParaImprevisto: true|false`) por si
  se prefiere enseñar la diferencia liquidez vs. inversión.

### Aritmética resultante del juego

| Comportamiento | Llega a la caja con | Desenlace |
|---|---|---|
| Gasta empanadas + botilito | $0 | 5.1 (no cubre) |
| Gasta solo una | $5.000 | 5.3 (cubre justo) |
| Ahorra todo | $10.000 | 5.3 (cubre holgado) |
| Mete $5.000 a CDT, gasta el resto | $0 líquido + $5.000 CDT | 5.3 si CDT cuenta / 5.1 si no |

### Catálogo de imprevistos (≥4)

Rotura de vidrio, cerrajero, enfermedad, llanta pinchada, etc. Todos a $5.000 (o el
valor que defina el equipo). El costo lo asigna el servidor según el QR escaneado.

## 3. Contexto de carga

~400 usuarios, un solo día, ~6 acciones cada uno ≈ **2.500 requests en total**, con
picos cuando todos escanean en el mismo stand. Carga trivial. Los retos reales son:

1. **Resiliencia de conectividad en el sitio** (wifi/celular saturado).
2. **Evitar dobles cobros** por doble escaneo o refresh.

## 4. Stack recomendado (capa gratuita, costo $0)

| Capa | Elección | Límite gratis / nota |
|---|---|---|
| Frontend | PWA con Next.js (App Router), estático | Vercel, sobra |
| API | Funciones serverless de Vercel (Node 20), mismo repo | Hobby: 100 GB-hrs/mes; **sin "sleep"** |
| DB | **Firebase Firestore** (plan Spark) | 50.000 lecturas/día, 20.000 escrituras/día, 1 GiB — **gratis de verdad, sin tarjeta ni piso de costo** |
| QR | Script local con `qrcode` (npm) → PNG para imprimir | Gratis, offline |
| Dominio | `*.vercel.app` (o dominio propio ~$10/año, opcional) | El QR de entrada apunta ahí |

### Por qué Vercel y no Render / Railway

Los free tier de Render / Railway **duermen** tras inactividad → cold start de 30–50 s
en plena feria = desastre. Vercel serverless tiene cold start <1 s y no duerme.

### Por qué Firestore y no MongoDB Atlas

Atlas retiró el tier M0 (gratis sin condiciones) para proyectos nuevos; lo que ofrece
ahora es **Flex**, con un piso de ~US$8/mes desde que el cluster existe, tenga tráfico o
no (ver sección 12). Firestore (plan Spark) sí es gratis sin piso y sin tarjeta, y **no
se pausa por inactividad** (a diferencia de alternativas como Supabase, que pausa el
proyecto a los 7 días sin uso — mal encaje para sesiones de trabajo espaciadas). Escalar
más adelante es activar el plan Blaze (pago por consumo) **en el mismo proyecto**, sin
migrar de proveedor ni mover datos.

## 5. Modelo de datos — Firestore, dos colecciones

```js
// participants/{documento}   <- el ID del documento ES el numero de documento:
//                                lookup O(1) sin indices, y unicidad atomica gratis
//                                via .create() (falla con ALREADY_EXISTS si ya existe)
{
  nombre, codigo,        // código 4 dígitos, asignado por el servidor
  saldo: 10000, cdt: 0,
  gastoHormigaEvitado: 0,
  stands: {
    empanadas:  null,    // { status: 'comprado' | 'ahorrado', monto, ts }
    botilito:   null,
    cdt:        null,    // { monto, ts }
    misteriosa: null     // { imprevisto, costo, cubierto: bool, medioPago, ts }
  },
  movimientos: [ /* ~6 entradas embebidas */ ],
  createdAt
}

// codes/{codigo}   <- reserva del código de feria, mismo truco de unicidad atómica
{ documento }
```

- Movimientos **embebidos** (máx. ~6): un documento por participante, sin joins.
- Configuración (valores de stands, catálogo de imprevistos, flag del CDT) vive en
  `lib/config.js`, no en la base de datos.
- El **Admin SDK de Firebase** (usado desde las funciones serverless) **ignora las
  reglas de seguridad de Firestore** — por eso las reglas del proyecto se dejan
  cerradas por defecto (`allow read, write: if false;`): nadie entra directo desde el
  navegador, todo pasa por nuestra API.

## 6. Flujos críticos

### Idempotencia (doble escaneo / refresh)

Cada participante transacciona cada stand **una sola vez**. El endpoint de pago hace una
transacción de Firestore que lee y escribe el mismo documento de forma atómica:

```js
await db.runTransaction(async (tx) => {
  const ref = db.collection("participants").doc(documento);
  const snap = await tx.get(ref);
  const data = snap.data();

  if (data.stands.empanadas) return; // ya transaccionó este stand, no hace nada
  if (data.saldo < valor) throw new Error("SALDO_INSUFICIENTE");

  tx.update(ref, {
    saldo: data.saldo - valor,
    "stands.empanadas": { status: "comprado", monto: valor, ts: Date.now() },
    movimientos: FieldValue.arrayUnion({
      tipo: "compra", label: "Empanadas", monto: -valor, ts: Date.now(),
    }),
  });
});
```

Si `stands.empanadas` ya existe, la transacción no hace nada y el endpoint devuelve el
resultado ya guardado. **Una transacción de un solo documento = atómica en Firestore**;
no hace falta nada multi-documento para este caso.

### El precio lo pone el servidor

El QR del stand solo lleva `?c=EMPANADAS`; el servidor conoce el monto. Así nadie
manipula precios desde el cliente.

### Saldo siempre autoritativo en el servidor

El token en `localStorage` (JWT firmado con el `codigo`) solo identifica; el cliente
nunca calcula saldo.

### QR necesarios

- 1 QR de entrada (igual para todos) → URL del login. Imprimir varias copias para
  paralelizar la fila del stand 0.
- 1 QR por stand de gasto (empanadas, botilito) — imprimir 2–3 copias por stand.
- CDT: 1 QR + pantalla con input de monto.
- **≥4 QR de imprevisto**, cada uno `?imprevisto=vidrio`, etc.; costo asignado por el
  servidor.

## 7. Dashboard de organizadores

Página `/admin` en la misma app, protegida con password estático en variable de
entorno. Hace `aggregate` sobre `participants` (400 docs = instantáneo), con **polling
cada 15–30 s**:

- Registrados / activos
- % que cubrió el imprevisto vs. % que se quedó sin saldo (5.3 vs 5.1)
- % que logró superar el imprevisto
- Distribución de decisiones por stand (compró vs. ahorró)
- Adopción del CDT y monto promedio aportado
- Ranking de imprevistos que salieron

## 8. Riesgos operativos

| Riesgo | Mitigación |
|---|---|
| Wifi / celular saturado con 400 personas | PWA con service worker (cachea el shell), payloads JSON mínimos, imágenes estáticas en CDN, UI de reintento clara (operaciones idempotentes → reintentar es seguro) |
| Cold start de función | Vercel <1 s; opcional: un cron que "calienta" la función cada 5 min durante el evento |
| Cuota diaria de Firestore Spark (50k lecturas / 20k escrituras) | Muy por encima del volumen esperado (sección 3); si se acerca, activar Blaze en el mismo proyecto sin migrar nada |
| Usuario pierde el token (cierra pestaña) | Re-login con documento + código (el código es recuperable / reimprimible en el stand 0) |
| Firestore Spark sin SLA formal | Evento de pocas horas; probabilidad de incidente despreciable |

## 9. Cumplimiento de datos (es un banco)

Se recolecta **cédula + nombre** → aplica Ley 1581 de 2012 (Habeas Data). Se requiere:

- Checkbox de autorización de tratamiento de datos en la Pantalla 1, con finalidad
  explícita ("dinámica pedagógica Feria 115 años").
- Plan de **eliminación de los datos** tras el evento.
- Coordinar con el área de datos personales / cumplimiento del BCS antes del evento.

## 10. Costo total

**$0** con `*.vercel.app` + Firebase Firestore (plan Spark, sin tarjeta). ~$10/año si se
quiere un dominio propio para una URL más limpia en el QR de entrada.

## 11. Ajustes respecto a la idea original

1. **Código de feria**: lo asigna el sistema en el registro; la Pantalla 1 lo pide en
   re-login como clave ya conocida (entregada/reimprimible en el stand 0).
2. **Concepto de "ahorro"**: no está en el texto original pero es el eje pedagógico;
   se modela como etiqueta del mismo saldo líquido + una métrica de gasto hormiga
   evitado (ver sección 2).
3. **CDT**: es un producto financiero; el usuario decide cuánto aportar y se descuenta
   del saldo. Falta diseñar su pantalla (input de monto).
4. **Caja misteriosa**: varios imprevistos posibles (≥4), no uno solo.
5. **Dashboard de organizadores**: pantalla nueva, no está en el set original.

## 12. Actualización (2026-08-29) — 1000 usuarios reales y plan de migración

El conteo real de asistentes subió de ~400 (sección 3) a **~1000**. Con ese volumen,
**MongoDB Atlas M0** deja de ser prudente como base para el evento en vivo:

- Es un cluster **compartido** sin SLA — puede sufrir *throttling* por vecinos ruidosos
  justo en el pico de tráfico (todos escaneando QR a la vez).
- Límite duro de **500 conexiones**; con ráfagas de 1000 personas es más fácil rozarlo.

### Decisión acordada

1. **La demo se presenta con la arquitectura actual** (secciones 4–10, capa 100%
   gratuita: Vercel Hobby + Atlas M0). Sin cambios de infraestructura para la demo.
2. Después de la demo, se calcula el **presupuesto de migración a capacidad dedicada**
   y se pasa a aprobación.
3. **Solo si se aprueba el presupuesto**, se migra antes del evento real. Si no se
   aprueba, el evento corre sobre la capa gratuita asumiendo el riesgo descrito arriba.

### Plan de migración (a ejecutar solo si se aprueba)

> Actualizado por la sección 13: la base de datos ya no es MongoDB, es Firestore. La
> fila de "Base de datos" de esta tabla queda así:

| Componente | Cambio propuesto | Costo estimado |
|---|---|---|
| Base de datos | Firestore Spark → activar **plan Blaze** (pago por consumo) en el mismo proyecto. Mismas cuotas gratis se mantienen; solo se cobra lo que las exceda | Centavos de dólar para el volumen del evento (sección 3) |
| Cómputo | Vercel Hobby → **Vercel Pro** (uso comercial permitido en términos, mejor protección de rate-limit) | US$20/mes, cancelable el mes siguiente |
| **Total** | | **~US$20, pago único** (no suscripción permanente) |

No requiere cambios de código ni migrar datos: activar Blaze es un cambio de plan
**dentro del mismo proyecto de Firebase**. Antes de dar por buena la migración, correr
una prueba de carga (`k6` o `autocannon`) simulando ~1000 usuarios contra `/api/pagar` e
`/api/imprevisto`.

## 13. Actualización (2026-08-29) — cambio de MongoDB Atlas a Firebase Firestore

Con Atlas M0 retirado para proyectos nuevos (sección 4), la alternativa gratuita real de
Atlas es Flex, que cobra un piso de ~US$8/mes desde que el cluster existe, tenga tráfico
o no. Para evitar cualquier costo mientras se construye el demo, se cambió de proveedor:

- **MongoDB Atlas → Firebase Firestore** (plan Spark). Gratis sin tarjeta, sin piso de
  costo, sin pausa por inactividad (a diferencia de Supabase), y ya en la nube desde el
  primer día — no hace falta distinguir "local" de "producción" para el demo.
- Modelo de datos: se mantiene el mismo espíritu (documento por participante,
  movimientos embebidos) — ver sección 5 actualizada. Cambia el motor de idempotencia:
  `findOneAndUpdate` de Mongo → transacción (`runTransaction`) de Firestore.
- Escalar después de aprobado el presupuesto: activar **Blaze** en el mismo proyecto de
  Firebase (pago por consumo, sin migrar nada) — ver tabla de la sección 12.
- Cambio de código: `lib/db.js` y `scripts/reset-db.mjs` ahora usan `firebase-admin` en
  vez de `mongodb`. Variables de entorno: `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`,
  `FIREBASE_PRIVATE_KEY` reemplazan a `MONGODB_URI` / `MONGODB_DB`.
