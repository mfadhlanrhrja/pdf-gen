import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: '/pdf-gen/', // <-- WAJIB: nama repository kamu
  plugins: [
    react(),
    tailwindcss(),
  ],
})
