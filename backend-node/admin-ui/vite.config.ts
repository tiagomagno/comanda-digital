import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// SPA fallback: só para rotas do React Router; não reescrever pedidos de script (evita 404 em @vite/client e react-refresh)
function spaFallbackPlugin() {
  return {
    name: 'spa-fallback',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url?.split('?')[0] ?? ''
        if (req.method !== 'GET' || !url.startsWith('/admin')) return next()
        // Não reescrever recursos do Vite/React (senão o servidor devolve HTML e dá 404)
        if (url.includes('@') || url.includes('node_modules') || url.includes('/src/')) return next()
        if (url.startsWith('/admin/assets/') || /\.[a-z0-9]+$/i.test(url)) return next()
        const indexHtml = path.join(__dirname, 'index.html')
        if (!fs.existsSync(indexHtml)) return next()
        req.url = '/admin/'
        next()
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), spaFallbackPlugin()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  base: '/admin/',
  server: {
    port: 5173,
    proxy: {
      '/auth': {
        target: process.env.VITE_DEV_PROXY_TARGET || 'http://localhost:3001',
        changeOrigin: true,
      },
      '/api': {
        target: process.env.VITE_DEV_PROXY_TARGET || 'http://localhost:3001',
        changeOrigin: true,
      },
      '/uploads': {
        target: process.env.VITE_DEV_PROXY_TARGET || 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
})
