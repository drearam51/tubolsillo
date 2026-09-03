import { NextResponse } from "next/server";
import { db, participantsCol } from "@/lib/db";
import { getSessionDocumento } from "@/lib/authServer";
import { AppError, errorResponse } from "@/lib/errors";
import { resolveImprevisto } from "@/lib/domain";
import { buildUpdate } from "@/lib/applyResolution";
import { toParticipantView } from "@/lib/participant";

export const dynamic = "force-dynamic";

// Caja misteriosa. Body: { imprevisto: "vidrio"|"cerrajero"|"enfermedad"|"llanta" }
// El cliente no decide si se cubre o no: el servidor lo calcula contra saldo (+cdt).
export async function POST(req) {
  try {
    const documento = await getSessionDocumento();
    if (!documento) throw new AppError("SIN_SESION", 401, "Inicia sesion de nuevo");

    const { imprevisto } = await req.json().catch(() => ({}));
    const ref = participantsCol().doc(documento);

    let cubierto;
    await db.runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      if (!snap.exists) throw new AppError("SIN_SESION", 401, "Inicia sesion de nuevo");

      const resolution = resolveImprevisto(snap.data(), imprevisto);
      cubierto = resolution.cubierto;
      if (resolution.changed) tx.update(ref, buildUpdate("misteriosa", resolution));
    });

    const snap = await ref.get();
    return NextResponse.json({ ok: true, cubierto, ...toParticipantView(documento, snap.data()) });
  } catch (err) {
    return errorResponse(err);
  }
}
