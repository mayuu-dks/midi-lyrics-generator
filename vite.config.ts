import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  // (1) index.html を探しに行くフォルダ
  root: path.resolve(__dirname, 'client'),

  // (2) ビルド結果の出力先
  build: {
    outDir: path.resolve(__dirname, 'docs'),
    emptyOutDir: true,
    // (3) entry HTML を明示
    rollupOptions: {
      input: path.resolve(__dirname, 'client/index.html'),
    },
  },

  // (4) React プラグインはそのまま
  plugins: [react()],

  // (5) 末尾が ./ なら相対パスで読み込むように
  base: './',

  // ← ここを追加 ←
  resolve: {
    alias: {
      '@':            path.resolve(__dirname, 'client/src'),
      '@components':  path.resolve(__dirname, 'client/src/components'),
      '@hooks':       path.resolve(__dirname, 'client/src/hooks'),
      '@lib':         path.resolve(__dirname, 'client/src/lib'),
      '@shared':      path.resolve(__dirname, 'shared'),
      '@db':          path.resolve(__dirname, 'db'),
      '@assets':      path.resolve(__dirname, 'attached_assets'),
    },
  },
})
