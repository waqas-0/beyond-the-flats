import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow VSCode Simple Browser / Live Preview to access the dev server
  allowedDevOrigins: [
    "localhost",
    "127.0.0.1",
    "*.localhost",
    "*.vscode-cdn.net",
    "*.vscode-webview.net",
  ],

  images: {
    formats: ["image/webp"],
  },

  async headers() {
    return [
      {
        // Service worker must never be cached by the browser
        source: "/sw.js",
        headers: [
          { key: "Content-Type", value: "application/javascript; charset=utf-8" },
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Service-Worker-Allowed", value: "/" },
        ],
      },
      {
        // Security headers for all routes
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
