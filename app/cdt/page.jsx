import { Suspense } from "react";
import CdtClient from "./CdtClient";

// useSearchParams() en el cliente exige un limite de Suspense (requisito de Next).
export default function CdtPage() {
  return (
    <Suspense>
      <CdtClient />
    </Suspense>
  );
}
