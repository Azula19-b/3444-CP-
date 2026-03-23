import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/foods": "http://localhost:3000",
      "/restaurants": "http://localhost:3000",
      "/search-foods": "http://localhost:3000",
      "/search-restaurants": "http://localhost:3000",
      "/search-foods-by-restaurant": "http://localhost:3000",
      "/search-restaurants-by-location": "http://localhost:3000",
      "/add-food": "http://localhost:3000",
      "/add-restaurant": "http://localhost:3000",
    },
  },
})
