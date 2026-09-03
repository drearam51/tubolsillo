import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

// Ping real a Firestore ademas del chequeo de que la funcion esta viva.
export async function GET() {
  try {
    await db.collection("_health").doc("ping").set({ ts: Date.now() });
    return NextResponse.json({ ok: true, service: "tubolsillo", db: "up", ts: Date.now() });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ ok: false, service: "tubolsillo", db: "down" }, { status: 503 });
  }
}
