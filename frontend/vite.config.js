import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // Por defecto Vite solo acepta peticiones desde localhost, por seguridad.
    // Como ahora exponemos el frontend a internet a través de ngrok (para
    // poder probar links que llegan por email, como el de reset de contraseña),
    // hay que autorizar explícitamente ese dominio.
    allowedHosts: ['gloating-suitable-pry.ngrok-free.dev']
  }
})