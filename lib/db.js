import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || "tubolsillo";

if (!uri) {
  throw new Error("Falta la variable de entorno MONGODB_URI");
}

// En serverless cada invocacion reutiliza la conexion cacheada en el modulo.
// En dev, se cachea en globalThis para sobrevivir al hot-reload.
let clientPromise;

if (process.env.NODE_ENV === "development") {
  if (!globalThis._mongoClientPromise) {
    globalThis._mongoClientPromise = new MongoClient(uri).connect();
  }
  clientPromise = globalThis._mongoClientPromise;
} else {
  clientPromise = new MongoClient(uri).connect();
}

export async function getDb() {
  const client = await clientPromise;
  return client.db(dbName);
}

export async function getParticipants() {
  const db = await getDb();
  return db.collection("participants");
}

// Idempotente: crea los indices una vez. Llamar desde un endpoint de setup o el seed.
export async function ensureIndexes() {
  const col = await getParticipants();
  await col.createIndexes([
    { key: { documento: 1 }, unique: true, name: "uniq_documento" },
    { key: { codigo: 1 }, unique: true, name: "uniq_codigo" },
    { key: { createdAt: 1 }, name: "by_createdAt" },
  ]);
}
