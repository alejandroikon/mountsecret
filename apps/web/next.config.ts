import type { NextConfig } from "next";

// Demo estática: se exporta a `out/` y Netlify (o cualquier hosting estático) la sirve tal cual.
// Cuando entren la base de datos y los agentes, se quita `output: "export"`.
const config: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  transpilePackages: ["@lc/dominio"],
  reactStrictMode: true,
};

export default config;
