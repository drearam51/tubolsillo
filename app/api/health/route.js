import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Chequeo simple del stack. En Fase 1 se agrega un ping real a Mongo.
export async function GET() {
  return NextResponse.json({ ok: true, service: "tubolsillo", ts: Date.now() });
}
