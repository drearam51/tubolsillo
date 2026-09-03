import { NextResponse } from "next/server";
import { participantsCol } from "@/lib/db";
import { getSessionDocumento } from "@/lib/authServer";
import { AppError, errorResponse } from "@/lib/errors";
import { toParticipantView } from "@/lib/participant";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const documento = await getSessionDocumento();
    if (!documento) throw new AppError("SIN_SESION", 401, "Inicia sesion de nuevo");

    const snap = await participantsCol().doc(documento).get();
    if (!snap.exists) throw new AppError("SIN_SESION", 401, "Inicia sesion de nuevo");

    return NextResponse.json({ ok: true, ...toParticipantView(documento, snap.data()) });
  } catch (err) {
    return errorResponse(err);
  }
}
