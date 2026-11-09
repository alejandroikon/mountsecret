/** Marcador de posición del logo de LiveContracts. Reemplazar por el SVG oficial. */
export function Logo({ conTexto = true, tamano = 32 }: { conTexto?: boolean; tamano?: number }) {
  return (
    <span className="inline-flex items-center gap-2">
      <svg width={tamano} height={tamano} viewBox="0 0 48 48" aria-hidden>
        <defs>
          <linearGradient id="logo-g" x1="0" x2="1">
            <stop offset="0" stopColor="var(--c-marca)" />
            <stop offset="1" stopColor="var(--c-marca-2)" />
          </linearGradient>
        </defs>
        <circle cx="24" cy="24" r="19" fill="none" stroke="url(#logo-g)" strokeWidth="5" strokeDasharray="96 24" transform="rotate(-30 24 24)" />
        <path d="M10 26h7l4-8 5 14 4-9h8" fill="none" stroke="var(--c-texto)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {conTexto ? (
        <span className="font-cifra text-[1.125rem] leading-none">
          <b className="font-bold">Live</b>
          <span className="font-light">Contracts</span>
        </span>
      ) : (
        <span className="sr-only">LiveContracts</span>
      )}
    </span>
  );
}
