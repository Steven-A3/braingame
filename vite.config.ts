import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'favicon-16.png', 'favicon-32.png', 'apple-touch-icon.png', 'icons/*.png', 'logo.svg'],
      manifest: {
        name: 'Daily Brain - Free Brain Training Games',
        short_name: 'Daily Brain',
        description: 'Play 20+ free brain games daily! Improve memory, logic, focus, calculation, language and speed with science-backed cognitive training exercises.',
        theme_color: '#4a90d9',
        background_color: '#0f172a',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        id: '/',
        categories: ['games', 'education', 'health', 'lifestyle'],
        lang: 'en',
        dir: 'ltr',
        icons: [
          {
            src: '/icons/icon-72.png',
            sizes: '72x72',
            type: 'image/png'
          },
          {
            src: '/icons/icon-96.png',
            sizes: '96x96',
            type: 'image/png'
          },
          {
            src: '/icons/icon-128.png',
            sizes: '128x128',
            type: 'image/png'
          },
          {
            src: '/icons/icon-144.png',
            sizes: '144x144',
            type: 'image/png'
          },
          {
            src: '/icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: '/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ],
        shortcuts: [
          {
            name: "Today's Brain Game",
            short_name: 'Today',
            description: "Play today's daily brain training challenge",
            url: '/today',
            icons: [{ src: '/icons/icon-96.png', sizes: '96x96' }]
          },
          {
            name: "Daily Workout",
            short_name: 'Workout',
            description: "Complete your personalized brain workout",
            url: '/workout',
            icons: [{ src: '/icons/icon-96.png', sizes: '96x96' }]
          },
          {
            name: "All Brain Games",
            short_name: 'Games',
            description: "Browse all 20+ brain training games",
            url: '/games',
            icons: [{ src: '/icons/icon-96.png', sizes: '96x96' }]
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\./,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24
              }
            }
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  build: {
    target: 'es2020',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          charts: ['recharts']
        }
      }
    }
  }
});
