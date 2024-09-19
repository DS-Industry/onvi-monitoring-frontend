import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from "vite-plugin-svgr";
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), svgr()],
  resolve: {
    alias: {
      '@ui': path.resolve(__dirname, 'src/components/ui'),  
      '@icons': path.resolve(__dirname, 'src/assets/icons')
    }
  },
})
