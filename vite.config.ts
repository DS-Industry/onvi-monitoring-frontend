import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import path from 'path';
import viteImagemin from 'vite-plugin-imagemin';
import viteCompression from 'vite-plugin-compression';
import babel from 'vite-plugin-babel';

export default defineConfig(() => {
  return {
    base: '/',
    build: {
      outDir: 'dist',
    },
    plugins: [
      react(),
      babel({
        babelConfig: {
          plugins: [
            [
              'import',
              {
                libraryName: 'antd',
                libraryDirectory: 'es',
                style: true,
              },
              'antd',
            ],
            [
              'import',
              {
                libraryName: '@ant-design/icons',
                libraryDirectory: 'es/icons',
                camel2DashComponentName: false,
              },
              'ant-design-icons',
            ],
          ],
        },
      }),
      svgr(),
      viteImagemin({
        gifsicle: { optimizationLevel: 7, interlaced: false },
        optipng: { optimizationLevel: 7 },
        mozjpeg: { quality: 75 },
        pngquant: { quality: [0.65, 0.8], speed: 4 },
        svgo: {
          plugins: [
            { name: 'removeViewBox', active: false },
            { name: 'removeEmptyAttrs', active: false },
          ],
        },
      }),
      viteCompression({ algorithm: 'gzip' }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
        '@ui': path.resolve(__dirname, 'src/components/ui'),
        '@icons': path.resolve(__dirname, 'src/assets/icons'),
        '@routes': path.resolve(__dirname, 'src/routes'),
      },
    },
  };
});
