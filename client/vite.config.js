import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [react()],
  // GitHub Pages serves the site from /resume-tailor-ai/
  base: command === 'build' ? '/resume-tailor-ai/' : '/',
}))
