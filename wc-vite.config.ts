import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      "@db": path.resolve(__dirname, "db"),
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared"),
      "@assets": path.resolve(__dirname, "attached_assets"),
    },
  },
  root: path.resolve(__dirname, "client"),
  build: {
    // ライブラリモードで Web Component の単一ファイルを出力
    lib: {
      entry: path.resolve(__dirname, "client/src/wc-entry.tsx"),
      name: "MidiLyricsGenerator",
      // 常に「midi-lyrics-generator.js」というファイル名にする
      fileName: () => "midi-lyrics-generator.js",
      formats: ["umd"],
    },
    rollupOptions: {
      // React本体をバンドルに含める
      external: [],
      output: {
        globals: {},
      },
    },
    // 出力先を GitHub Pages が拾いやすい `docs/` フォルダに指定
    outDir: path.resolve(__dirname, "docs"),
    emptyOutDir: true,
  },
});
