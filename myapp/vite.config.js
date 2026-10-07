import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { socialServerPlugin } from './viteServerPlugin.js'

export default defineConfig({
  plugins: [react(), socialServerPlugin()],
  server: {
    host: '0.0.0.0',
    port: 5173
  }
})
