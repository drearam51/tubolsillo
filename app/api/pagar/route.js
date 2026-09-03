import { NextResponse } from "next/server";
import { db, participantsCol } from "@/lib/db";
import { getSessionDocumento } from "@/lib/authServer";
import { AppError, errorResponse } from "@/lib/errors";
import { resolvePagar } from "@/lib/domain";
import { buildUpdate } from "@/lib/applyResolution";
import { toParticipantView } from "@/lib/participant";

export const dynamic = "force-dynamic";

// Empanadas / botilito. Body: { stand: "empanadas"|"botilito", decision: "comprar"|"ahorrar" }
export async function POST(req) {
  try {
    const documento = await getSessionDocumento();
    if (!documento) throw new AppError("SIN_SESION", 401, "Inicia sesion de nuevo");

    const { stand, decision } = await req.json().catch(() => ({}));
    const ref = participantsCol().doc(documento);

    await db.runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      if (!snap.exists) throw new AppError("SIN_SESION", 401, "Inicia sesion de nuevo");

      const resolution = resolvePagar(snap.data(), stand, decision);
      if (resolution.changed) tx.update(ref, buildUpdate(stand, resolution));
    });

    const snap = await ref.get();
    return NextResponse.json({ ok: true, ...toParticipantView(documento, snap.data()) });
  } catch (err) {
    return errorResponse(err);
  }
}
