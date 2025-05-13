import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from "vite-plugin-svgr";
import path from 'path';
import viteImagemin from 'vite-plugin-imagemin';
import viteCompression from 'vite-plugin-compression';

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  build: {
    outDir: 'dist', // Ensure this matches your deployment settings
  },
  plugins: [
    react(),
    svgr(),
    viteImagemin({
      gifsicle: {
        optimizationLevel: 7,
        interlaced: false,
      },
      optipng: {
        optimizationLevel: 7,
      },
      mozjpeg: {
        quality: 75,
      },
      pngquant: {
        quality: [0.65, 0.8],
        speed: 4,
      },
      svgo: {
        plugins: [
          {
            name: 'removeViewBox',
            active: false,
          },
          {
            name: 'removeEmptyAttrs',
            active: false,
          },
        ],
      },
    }),
    viteCompression()
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@ui': path.resolve(__dirname, 'src/components/ui'),
      '@icons': path.resolve(__dirname, 'src/assets/icons'),
      '@routes': path.resolve(__dirname, 'src/routes')
    }
  },
})
