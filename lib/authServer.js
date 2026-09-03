import { cookies } from "next/headers";
import { createSessionToken, verifySessionToken, SESSION_COOKIE } from "@/lib/session";

export async function setSessionCookie(documento) {
  const token = await createSessionToken({ documento });
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 12, // 12h, dura mas que el evento
    path: "/",
  });
}

// documento autenticado de la sesion actual, o null si no hay sesion valida.
export async function getSessionDocumento() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  const payload = await verifySessionToken(token);
  return payload?.documento ?? null;
}
