import { CONTRATOS } from "@/lib/semillas";
import { DetalleContrato } from "./DetalleContrato";

export function generateStaticParams() {
  return CONTRATOS.map((c) => ({ id: c.id }));
}

export default async function Pagina({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <DetalleContrato id={id} />;
}
