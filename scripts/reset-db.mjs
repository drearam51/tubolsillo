// Borra todos los participantes y recrea indices. Uso: npm run reset-db
// PELIGRO: usar solo en pruebas o para dejar la base limpia antes del evento.
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || "tubolsillo";
if (!uri) throw new Error("Falta MONGODB_URI");

const client = await new MongoClient(uri).connect();
const col = client.db(dbName).collection("participants");

const { deletedCount } = await col.deleteMany({});
await col.createIndexes([
  { key: { documento: 1 }, unique: true, name: "uniq_documento" },
  { key: { codigo: 1 }, unique: true, name: "uniq_codigo" },
  { key: { createdAt: 1 }, name: "by_createdAt" },
]);

console.log(`Eliminados ${deletedCount} participantes. Indices recreados.`);
await client.close();
