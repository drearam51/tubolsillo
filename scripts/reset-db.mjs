// Borra participantes y codigos, y verifica la conexion a Firestore. Uso: npm run reset-db
// PELIGRO: usar solo en pruebas o para dejar la base limpia antes del evento.
import { cert, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
if (!projectId || !clientEmail || !privateKey) {
  throw new Error(
    "Faltan variables de entorno de Firebase (FIREBASE_PROJECT_ID / FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY)"
  );
}

initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
const db = getFirestore();

async function wipe(collectionName) {
  const snap = await db.collection(collectionName).get();
  const batchSize = 400; // limite de Firestore por batch es 500
  let deleted = 0;
  for (let i = 0; i < snap.docs.length; i += batchSize) {
    const batch = db.batch();
    snap.docs.slice(i, i + batchSize).forEach((doc) => batch.delete(doc.ref));
    await batch.commit();
    deleted += Math.min(batchSize, snap.docs.length - i);
  }
  return deleted;
}

const p = await wipe("participants");
const c = await wipe("codes");

console.log(`Conexion a Firestore OK (proyecto: ${projectId})`);
console.log(`Eliminados ${p} participantes y ${c} codigos reservados.`);
