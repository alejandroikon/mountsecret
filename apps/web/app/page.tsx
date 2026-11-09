"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useApp } from "@/lib/store";

export default function Inicio() {
  const { listo, contratos, estado } = useApp();
  const router = useRouter();
  useEffect(() => {
    if (!listo) return;
    if (contratos.length === 0) router.replace("/bienvenida/");
    else if (estado.contratoActivo && !estado.validados.includes(estado.contratoActivo)) router.replace(`/revisar/${estado.contratoActivo}/`);
    else router.replace("/hoy/");
  }, [listo, contratos.length, estado.contratoActivo, estado.validados, router]);
  return <div className="min-h-dvh" aria-busy="true" />;
}
