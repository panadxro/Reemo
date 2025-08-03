import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from "url";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from 'vite-plugin-pwa';
import { visualizer } from 'rollup-plugin-visualizer';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          isCustomElement: (tag) => ['selectedcontent', 'button'].includes(tag),
        }
      }
    }),
    tailwindcss(),
    VitePWA({ 
      registerType: 'autoUpdate',
      manifest: {
        name: 'Reemo',
        short_name: 'Reemo',
        description: 'Reemo es una plataforma web para alquilar vehículos en Argentina.',
        theme_color: '#FFFFFF',
        background_color: '#FFFFFF',
        display: 'standalone',
        orientation: 'portrait',
        display_override: ['window-controls-overlay'],
        lang: 'es-AR',
        shortcuts: [
          {
            name: 'Inicio',
            short_name: 'Inicio',
            description: 'Ir a la página de inicio',
            url: '/',
            icons: [{
              src: '/Home.png',
              sizes: '24x24',
              type: 'image/png',
              purpose: 'any'
            }]
          },
          {
            name: 'Buscar vehículos',
            short_name: 'Buscar',
            description: 'Ir a la página de búsqueda de vehículos',
            url: '/search',
            icons: [{
              src: '/Search.png',
              sizes: '24x24',
              type: 'image/png',
              purpose: 'any'
            }]
          },
          {
            name: 'Abrir mapa',
            short_name: 'Mapa',
            description: 'Ir a la página de mapa',
            url: '/maps',
            icons: [{
              src: '/Maps.png',
              sizes: '24x24',
              type: 'image/png',
              purpose: 'any'
            }]
          }
        ],
        icons: [
          {
            src: '/pwa-180x180.png',
            sizes: '180x180',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/pwa-maskable-180x180.png',
            sizes: '180x180',
            type: 'image/png',
            purpose: 'maskable'
          },
          {
            src: '/pwa-maskable-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable'
          },
          {
            src: '/pwa-maskable-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      },
      workbox: {
        cleanupOutdatedCaches: true,
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        maximumFileSizeToCacheInBytes: 5000000,
        runtimeCaching: [
          // Cache de recursos estáticos locales
          {
            urlPattern: /\.(?:js|css|json|html|ico|png|jpg|jpeg|svg|gif|webp|woff2?)$/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'static-assets',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 días
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
        ],
        additionalManifestEntries: [
          { url: '/firebase-messaging-sw.js', revision: null,  }
        ]
      },
      devOptions: {
        enabled: process.env.NODE_ENV === 'development',
        type: 'module' // Para soportar reload en desarrollo
      },
      includeAssets: ['favicon.ico', 'robots.txt', 'apple-touch-icon.png', 'apple-touch-icon.png'],
    }),
    // visualizer({ open: true })
  ],
  logLevel: 'error',
  server: {
    open: true
  },
  optimizeDeps: {
    include: ['fast-deep-equal'],
  },
  resolve: {
    alias: [
      { find: '@', replacement: fileURLToPath(new URL('./src', import.meta.url)) },
      { find: '@assets', replacement: fileURLToPath(new URL('./src/assets', import.meta.url)) },
      { find: '@components', replacement: fileURLToPath(new URL('./src/components', import.meta.url)) },
      { find: '@icons', replacement: fileURLToPath(new URL('./src/icons', import.meta.url)) },
      { find: '@pages', replacement: fileURLToPath(new URL('./src/pages', import.meta.url)) },
      { find: '@router', replacement: fileURLToPath(new URL('./src/router', import.meta.url)) },
      { find: '@services', replacement: fileURLToPath(new URL('./src/services', import.meta.url)) },
      { find: '@libraries', replacement: fileURLToPath(new URL('./src/libraries', import.meta.url)) },
      { find: '@stores', replacement: fileURLToPath(new URL('./src/stores', import.meta.url)) },
      { find: '@layouts', replacement: fileURLToPath(new URL('./src/layouts', import.meta.url)) },
      { find: '@stores', replacement: fileURLToPath(new URL('./src/stores', import.meta.url)) },
    ],
  },
});