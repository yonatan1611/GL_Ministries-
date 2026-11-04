import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // next/image is allowed to fetch remote thumbnails/avatars from these hosts
  // (YouTube thumbnails + future CMS-hosted media). Security headers and CSP
  // for the browser are enforced separately in src/middleware.ts.
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "i.ytimg.com" },
      { protocol: "https", hostname: "img.youtube.com" },
      { protocol: "https", hostname: "yt3.googleusercontent.com" },
      { protocol: "https", hostname: "glministries.org", pathname: "/wp-content/uploads/**" },
      { protocol: "https", hostname: "gospellightethiopia.org" },
      { protocol: "https", hostname: "graph.facebook.com" },
      { protocol: "https", hostname: "*.fbcdn.net" },
      { protocol: "https", hostname: "platform-lookaside.fbsbx.com" },
    ],
  },
};

export default nextConfig;
