"use client";

import { useEffect, useRef, useState } from "react";
import jsQR from "jsqr";

// Camara trasera del celular, decodificada en vivo con jsQR frame a frame.
// No usamos BarcodeDetector nativo porque el soporte entre navegadores/celulares
// todavia es desparejo (ver conversacion: necesitamos que funcione en cualquier
// telefono de los ~1000 asistentes, no solo en los mas nuevos).
//
// onDecode(texto) se llama una vez por cada frame donde se detecta un QR -- el
// padre decide si el contenido es valido y, si lo es, debe pasar active=false
// para apagar la camara (evita seguir decodificando el mismo codigo).
export function QrScanner({ onDecode, active = true }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const streamRef = useRef(null);
  const [status, setStatus] = useState("solicitando"); // solicitando | listo | error

  useEffect(() => {
    if (!active) return;
    let cancelled = false;
    setStatus("solicitando");

    async function start() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        const video = videoRef.current;
        video.srcObject = stream;
        await video.play();
        if (cancelled) return;
        setStatus("listo");
        tick();
      } catch (err) {
        console.error(err);
        if (!cancelled) setStatus("error");
      }
    }

    function tick() {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas || video.readyState !== video.HAVE_ENOUGH_DATA) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const frame = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(frame.data, frame.width, frame.height);
      if (code?.data) onDecode(code.data);
      rafRef.current = requestAnimationFrame(tick);
    }

    start();

    return () => {
      cancelled = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, [active, onDecode]);

  return (
    <div className="relative mx-auto aspect-square w-full max-w-xs overflow-hidden rounded-3xl border border-white/15 bg-bcs-navy-700">
      <video ref={videoRef} className="h-full w-full object-cover" playsInline muted />
      <canvas ref={canvasRef} className="hidden" />
      {status === "solicitando" && (
        <div className="absolute inset-0 grid place-items-center bg-bcs-navy-700 px-4 text-center text-sm text-white/60">
          Activando cámara…
        </div>
      )}
      {status === "error" && (
        <div className="absolute inset-0 grid place-items-center bg-bcs-navy-700 px-4 text-center text-sm text-white/70">
          No pudimos acceder a la cámara. Revisa los permisos del navegador (ícono de
          candado en la barra de direcciones) e intenta de nuevo.
        </div>
      )}
      {status === "listo" && (
        <div className="pointer-events-none absolute inset-6 rounded-2xl border-2 border-white/70" />
      )}
    </div>
  );
}
