import { Suspense } from "react";
import CajaClient from "./CajaClient";

// useSearchParams() en el cliente exige un limite de Suspense (requisito de Next).
export default function CajaPage() {
  return (
    <Suspense>
      <CajaClient />
    </Suspense>
  );
}
