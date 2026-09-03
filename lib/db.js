import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
// La private key viene con \n escapados cuando se guarda como variable de entorno de una linea.
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

if (!projectId || !clientEmail || !privateKey) {
  throw new Error(
    "Faltan variables de entorno de Firebase (FIREBASE_PROJECT_ID / FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY)"
  );
}

// getApps() evita reinicializar en invocaciones "warm" de la funcion serverless
// y sobrevive al hot-reload en dev.
if (!getApps().length) {
  initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
}

export const db = getFirestore();

// Un documento por participante. El ID del documento es el numero de "documento"
// de la persona -> lookup O(1) sin indices, y .create() da unicidad atomica gratis
// (falla con ALREADY_EXISTS si ya existe, sin necesidad de una transaccion aparte).
export function participantsCol() {
  return db.collection("participants");
}

// Reserva de codigo de feria: doc ID = codigo (4 digitos). Mismo truco de unicidad
// atomica via .create(). Ver docs/analisis-arquitectura.md seccion 5.
export function codesCol() {
  return db.collection("codes");
}
