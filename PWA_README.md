# PWA (Progressive Web App) Support

This Nuxt.js application has been configured with full PWA support, including fullscreen display mode.

## Features

### ✅ Fullscreen Display Mode
The app is configured to run in fullscreen mode when installed as a PWA, providing a native app-like experience.

### ✅ Offline Support
- Service worker automatically caches app resources
- Offline page available at `/offline`
- Automatic updates when new versions are available

### ✅ Install Prompt
- Automatic install prompt detection
- Custom install button component (`PWAInstallButton.vue`)
- Handles both install and dismiss actions

### ✅ App Manifest
- Fullscreen display mode
- Portrait orientation
- Custom app icons
- Theme colors configured

## Configuration

### Nuxt Config (`nuxt.config.ts`)
```typescript
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
```

### Components
- `PWAInstallButton.vue` - Shows install prompt when available
- `pages/offline.vue` - Offline page with retry functionality

### Composables
- `usePWA()` - Built-in composable from `@vite-pwa/nuxt` for PWA functionality

## Usage

### Install Button
The install button automatically appears when the app can be installed:

```vue
<template>
  <PWAInstallButton />
</template>
```

### PWA Composable
```vue
<script setup>
const { canInstall, isInstalled, installPWA } = usePWA()

// Check if app can be installed
console.log('Can install:', canInstall.value)

// Check if app is already installed
console.log('Is installed:', isInstalled.value)

// Install the app
const installApp = async () => {
  try {
    await installPWA()
    console.log('App installed successfully!')
  } catch (error) {
    console.error('Installation failed:', error)
  }
}
</script>
```

## Testing

### Development
1. Run `pnpm dev`
2. Open browser developer tools
3. Go to Application tab
4. Check "Manifest" and "Service Workers" sections

### Production
1. Run `pnpm build`
2. Serve the built files
3. Test install prompt and offline functionality

### PWA Testing Checklist
- [ ] App can be installed
- [ ] App runs in fullscreen mode
- [ ] Offline functionality works
- [ ] App updates automatically
- [ ] Install prompt appears correctly
- [ ] App icons display properly

## Customization

### Icons
Replace the placeholder icons in the `public` directory:
- `icon-192x192.png` - 192x192 pixel icon
- `icon-512x512.png` - 512x512 pixel icon

### Colors
Update theme colors in `nuxt.config.ts`:
```typescript
manifest: {
  theme_color: '#your-theme-color',
  background_color: '#your-background-color'
}
```

### App Name
Update the app name in `nuxt.config.ts`:
```typescript
manifest: {
  name: 'Your App Name',
  short_name: 'YourApp'
}
```

## Browser Support

PWA features are supported in:
- Chrome 67+
- Firefox 67+
- Safari 11.1+
- Edge 79+

## Notes

- The app uses `@vite-pwa/nuxt` module for PWA functionality
- Service worker is automatically generated during build
- Fullscreen mode provides the most immersive experience
- Offline support ensures the app works without internet connection