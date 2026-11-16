import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Stare poti iz prve različice vodijo na nove strani.
  async redirects() {
    return [
      { source: "/cenik", destination: "/partnerji#cenik", permanent: true },
      { source: "/demo", destination: "/partnerji", permanent: true },
      { source: "/demo/dashboard", destination: "/partnerji", permanent: true },
      { source: "/embed/:code", destination: "/p/:code", permanent: true },
      { source: "/p/:code/spin", destination: "/p/:code", permanent: true },
    ];
  },
};

export default nextConfig;
