import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  images: {
    domains: ['127.0.0.1'], // Ajoutez l'hôte ici
  },
};

export default nextConfig;
