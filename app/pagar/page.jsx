import { Suspense } from "react";
import PagarClient from "./PagarClient";

// useSearchParams() en el cliente exige un limite de Suspense (requisito de Next).
export default function PagarPage() {
  return (
    <Suspense>
      <PagarClient />
    </Suspense>
  );
}
