// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  ssr: false,
  app:{
    head:{
      title: 'VVN Booking',
      meta: [
        { name: 'description', content: 'VVN Booking' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'black' },
        { name: 'apple-mobile-web-app-title', content: 'VVN Booking' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'black' },
        { name: 'apple-mobile-web-app-title', content: 'VVN Booking' },
      ]
    }
  },
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
        legacy: false,
        defaultLocale: 'en',
        langDir: 'locales/',
        strategy: 'no_prefix'
      }
    ],
    '@vite-pwa/nuxt'
  ],
  
  runtimeConfig: {
    couchdbUrl: process.env.COUCHDB_URL || 'http://localhost:5984',
    couchdbAdminUsername: process.env.COUCHDB_ADMIN_USERNAME || 'admin',
    couchdbAdminPassword: process.env.COUCHDB_ADMIN_PASSWORD || 'admin',
    public: {
      couchdbBaseUrl: process.env.COUCHDB_URL || 'http://localhost:5984'
    }
  },
  
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
      globPatterns: ['**/*.{js,css,html,png,svg,ico}'],
      skipWaiting: true,
      clientsClaim: true
    },
    client: {
      installPrompt: true,
      periodicSyncForUpdates: 20
    },
    devOptions: {
      enabled: true,
      suppressWarnings: true,
      navigateFallback: '/',
      navigateFallbackAllowlist: [/^\/$/],
      type: 'module'
    },
    manifest: {
      name: 'VVN Booking - Student Management',
      short_name: 'VVN Booking',
      description: 'Mobile-first student management app for teachers and fitness studios. Manage students, packages, classes, and bookings with local-first PouchDB storage.',
      theme_color: '#000000',
      background_color: '#ffffff',
      display: 'fullscreen',
      orientation: 'portrait-primary',
      scope: '/',
      start_url: '/',
      categories: ['education', 'productivity', 'business'],
      lang: 'en',
      icons: [
        {
          src: '/icon-192x192.png',
          sizes: '192x192',
          type: 'image/png',
          purpose: 'maskable any'
        },
        {
          src: '/icon-512x512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'maskable any'
        }
      ]
    }
  }
})