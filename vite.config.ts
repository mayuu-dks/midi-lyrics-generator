import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  base: "./",
  plugins: [
    react(),
  ],
  build: {
    outDir: "docs",     // <-- ここを docs に
    emptyOutDir: true,  // ビルド前に docs を空に
  },
});
