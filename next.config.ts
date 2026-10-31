import type { NextConfig } from "next";

// 2026-10-31: the rain app moved into the kibbutz app as a section (app.kneapps.fyi/rain).
// Every address of this site forwards there, so old links and home-screen shortcuts keep working.
const NEW = "https://app.kneapps.fyi/rain";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/", destination: NEW, permanent: true },
      { source: "/:page(about|daily|monthly|admin)", destination: `${NEW}/:page`, permanent: true },
      { source: "/:path*", destination: NEW, permanent: true },
    ];
  },
};

export default nextConfig;
