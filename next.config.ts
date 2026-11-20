import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Naslovna fotografija in meni lokala se naložita prek strežniške akcije (privzeta meja je 1 MB).
  experimental: { serverActions: { bodySizeLimit: "5mb" } },
  // Stare poti iz prve različice vodijo na nove strani.
  async redirects() {
    return [
      // med demo obdobjem cenika ni; povezava vodi na ponudbo za lokale (začasno, zato ni trajna preusmeritev)
      { source: "/cenik", destination: "/partnerji#demo", permanent: false },
      { source: "/demo", destination: "/partnerji", permanent: true },
      { source: "/demo/dashboard", destination: "/partnerji", permanent: true },
      { source: "/embed/:code", destination: "/p/:code", permanent: true },
      { source: "/p/:code/spin", destination: "/p/:code", permanent: true },
    ];
  },
};

export default nextConfig;
