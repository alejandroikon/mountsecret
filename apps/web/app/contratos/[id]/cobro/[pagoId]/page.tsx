import { CONTRATOS } from "@/lib/semillas";
import { Cobro } from "./Cobro";

export function generateStaticParams() {
  return CONTRATOS.flatMap((c) => c.pagos.map((p) => ({ id: c.id, pagoId: p.id })));
}

export default async function Pagina({ params }: { params: Promise<{ id: string; pagoId: string }> }) {
  const { id, pagoId } = await params;
  return <Cobro id={id} pagoId={pagoId} />;
}
