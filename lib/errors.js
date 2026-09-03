import { NextResponse } from "next/server";

export class AppError extends Error {
  constructor(code, status, message) {
    super(message || code);
    this.code = code;
    this.status = status;
  }
}

export function errorResponse(err) {
  if (err instanceof AppError) {
    return NextResponse.json({ ok: false, error: err.code, message: err.message }, { status: err.status });
  }
  console.error(err);
  return NextResponse.json({ ok: false, error: "ERROR_INTERNO" }, { status: 500 });
}
