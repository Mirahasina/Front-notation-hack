import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
  ],
  server: {
    host: '0.0.0.0',
    port: 3000, // Gardez le port par défaut de Vite
    // Autoriser tous les hosts
    allowedHosts: true,
    // Ou spécifiquement les hosts que vous utilisez :
    // allowedHosts: [
    //   'notation.insi.local',
    //   'localhost',
    //   '127.0.0.1'
    // ],
  },
})