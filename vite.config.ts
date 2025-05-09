import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  // ① index.html を探しに行くフォルダ
  root: path.resolve(__dirname, 'client'),

  // ② ビルドしたときに書き出される先
  build: {
    outDir: path.resolve(__dirname, 'docs'),
    emptyOutDir: true,

    // ③ 使う entry html をフルパスで教えてあげる
    rollupOptions: {
      input: path.resolve(__dirname, 'client/index.html'),
    },
  },

  // React プラグインはそのまま
  plugins: [react()],

  // relative なリンクを使うならこれ
  base: './',
})
