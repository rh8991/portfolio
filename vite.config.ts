import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/',
  plugins: [react()],
  server: {
    host: true,
    hmr: {
      protocol: 'ws',
      host: 'localhost'
    }
  },
  build: {
    sourcemap: false
  }
})
