import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [
    react()
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@shared": path.resolve(__dirname, "../shared"),
      "@assets": path.resolve(__dirname, "attached_assets"),
    },
  },
  root: path.resolve(__dirname),
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    proxy: {
      // Backend API (Express on port 3000)
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      // Chatbot API (chatbot-server.mjs on port 3001)
      // Only proxied in dev — in prod the chatbot runs on its own origin
      // and VITE_CHATBOT_ORIGIN overrides the auto-detection in LandingPage.tsx
    },
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
  // Expose VITE_CHATBOT_ORIGIN to client code (set in .env.local)
  // Example: VITE_CHATBOT_ORIGIN=http://localhost:3001
  envPrefix: "VITE_",
});