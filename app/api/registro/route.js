import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { db, participantsCol, codesCol } from "@/lib/db";
import { setSessionCookie } from "@/lib/authServer";
import { AppError, errorResponse } from "@/lib/errors";
import {
  normalizeDocumento,
  generateCodigo,
  initialParticipant,
  toParticipantView,
} from "@/lib/participant";

export const dynamic = "force-dynamic";

// Unico punto de entrada: documento + nombre. Si el documento no existe se crea
// (el servidor asigna el codigo de feria internamente, el usuario nunca lo
// escribe); si ya existe, esto funciona como login -- no hay pantalla ni campo
// de "codigo" en la UI, ver docs/analisis-arquitectura.md.
export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const documento = normalizeDocumento(body.documento);
    const nombre = String(body.nombre || "").trim();

    if (documento.length < 5) throw new AppError("DOCUMENTO_INVALIDO", 400, "Documento invalido");
    if (!nombre) throw new AppError("NOMBRE_REQUERIDO", 400, "El nombre es obligatorio");

    const partRef = participantsCol().doc(documento);

    await db.runTransaction(async (tx) => {
      const partSnap = await tx.get(partRef);
      if (partSnap.exists) return; // ya existe: solo inicia sesion, no se toca su saldo/nombre

      // Reserva atomica de un codigo de 4 digitos que no este en uso.
      let codigo = null;
      for (let i = 0; i < 8; i++) {
        const candidate = generateCodigo();
        const codeSnap = await tx.get(codesCol().doc(candidate));
        if (!codeSnap.exists) {
          codigo = candidate;
          break;
        }
      }
      if (!codigo) {
        throw new AppError("NO_SE_PUDO_ASIGNAR_CODIGO", 503, "Intenta de nuevo en unos segundos");
      }

      tx.set(codesCol().doc(codigo), { documento, ts: FieldValue.serverTimestamp() });
      tx.set(partRef, initialParticipant({ nombre, codigo }));
    });

    await setSessionCookie(documento);
    const snap = await partRef.get();
    return NextResponse.json({ ok: true, ...toParticipantView(documento, snap.data()) });
  } catch (err) {
    return errorResponse(err);
  }
}
