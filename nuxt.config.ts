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
    ]
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
  ]
})