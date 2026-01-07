import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'despia-native': path.resolve(__dirname, 'src/shims/despia-native.ts')
    }
  },
  server: { port: 5173 }
});