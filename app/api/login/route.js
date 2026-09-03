import { NextResponse } from "next/server";
import { participantsCol } from "@/lib/db";
import { setSessionCookie } from "@/lib/authServer";
import { AppError, errorResponse } from "@/lib/errors";
import { normalizeDocumento, normalizeCodigo, toParticipantView } from "@/lib/participant";

export const dynamic = "force-dynamic";

// Re-ingreso: documento + codigo ya asignado (Pantalla 1, re-login o nuevo dispositivo).
export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const documento = normalizeDocumento(body.documento);
    const codigo = normalizeCodigo(body.codigo);

    if (!documento || !codigo) {
      throw new AppError("CREDENCIALES_INVALIDAS", 401, "Documento o codigo incorrectos");
    }

    const ref = participantsCol().doc(documento);
    const snap = await ref.get();
    if (!snap.exists || snap.data().codigo !== codigo) {
      throw new AppError("CREDENCIALES_INVALIDAS", 401, "Documento o codigo incorrectos");
    }

    await setSessionCookie(documento);
    return NextResponse.json({ ok: true, ...toParticipantView(documento, snap.data()) });
  } catch (err) {
    return errorResponse(err);
  }
}
