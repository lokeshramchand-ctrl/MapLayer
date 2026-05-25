import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import checker from 'vite-plugin-checker';

// https://vite.dev/config/
export default defineConfig({
  plugins: [checker({typescript: false}),react()],
  server: {
	  allowedHosts: true,
	  host:true,
    proxy: {
      '/api': {
        target: 'https://ollama.splsystems.in',
        changeOrigin: true,
        secure: true
      }
    },
 origin: 'http://localhost:5173',
  },
})
