import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] })
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      '/Product': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/Stock': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/Depot': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/Category': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
})
