// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  ssr: false,
  // TypeScript configuration
  typescript: {
    strict: true,
    typeCheck: false // Disable type checking to avoid vue-tsc issues
  },

  // Modules
  modules: [
    '@nuxt/fonts',
    '@nuxt/ui',
    [
      '@nuxtjs/i18n',
      {
        locales: [
          { code: 'en', name: 'English', file: 'en.json' },
          { code: 'zh-Hant', name: '繁體中文', file: 'zh-Hant.json' }
        ],
        defaultLocale: 'en',
        langDir: 'locales/',
        strategy: 'no_prefix'
      }
    ],
    '@vite-pwa/nuxt'
  ],
  
  // Color mode configuration
  colorMode: {
    preference: 'system', // default value of $colorMode.preference
    fallback: 'light', // fallback value if not system preference found
    hid: 'nuxt-color-mode-script',
    globalName: '__NUXT_COLOR_MODE__',
    componentName: 'ColorScheme',
    classPrefix: '',
    classSuffix: '',
    storageKey: 'nuxt-color-mode'
  },
  
  css: [
    '~/assets/css/main.css'
  ],

  // PWA Configuration
  pwa: {
    registerType: 'autoUpdate',
    workbox: {
      navigateFallback: '/',
      globPatterns: ['**/*.{js,css,html,png,svg,ico}']
    },
    client: {
      installPrompt: true,
      periodicSyncForUpdates: 20
    },
    devOptions: {
      enabled: true,
      suppressWarnings: true,
      navigateFallbackAllowlist: [/^\/$/],
      type: 'module'
    },
    manifest: {
      name: 'Nuxt App',
      short_name: 'NuxtApp',
      description: 'A Progressive Web App built with Nuxt.js',
      theme_color: '#000000',
      background_color: '#ffffff',
      display: 'fullscreen',
      orientation: 'portrait-primary',
      scope: '/',
      start_url: '/',
      icons: [
        {
          src: '/icon-192x192.png',
          sizes: '192x192',
          type: 'image/png'
        },
        {
          src: '/icon-512x512.png',
          sizes: '512x512',
          type: 'image/png'
        }
      ]
    }
  }
})