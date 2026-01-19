import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      strategies: "generateSW", // hoặc 'generateSW'
      manifest: {
        name: "BizTrack",
        short_name: "BizTrack",
        description: "Ứng dụng quản lý kinh doanh",
        theme_color: "#ffffff",
        background_color: "#ffffff",
        display: "standalone",
        icons: [
          { src: "/logo192.png", sizes: "192x192", type: "image/png" },
          { src: "/logo512.png", sizes: "512x512", type: "image/png" },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg}"],
        maximumFileSizeToCacheInBytes: 50 * 1024 * 1024,
        skipWaiting: true,
        clientsClaim: true,
      },
    }),
  ],

  // base: '/~s3xsg7fwyb5m/',
});
