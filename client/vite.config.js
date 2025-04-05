import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  base: '/Collab-Code/',  // 👈 This tells Vite your site is hosted under this subpath
  plugins: [tailwindcss(), react()],
})
