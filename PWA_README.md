# PWA (Progressive Web App) Support

This VVN Booking application has been configured with full PWA support, including fullscreen display mode for the student management system.

## Features

### ✅ Fullscreen Display Mode
The app is configured to run in fullscreen mode when installed as a PWA, providing a native app-like experience.

### ✅ Offline Support
- Service worker automatically caches app resources
- PouchDB provides local-first offline functionality
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
    globPatterns: ['**/*.{js,css,html,png,svg,ico}'],
    // Skip offline page since we use PouchDB for offline functionality
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

### Composables
- `usePWA()` - Built-in composable from `@vite-pwa/nuxt` for PWA functionality
  - `isPWAInstalled`: Ref<boolean> - whether the PWA is installed
  - `showInstallPrompt`: Ref<boolean> - whether the install prompt should be shown
  - `install()`: function to trigger the install prompt
  - `cancelInstall()`: function to cancel the install prompt
  - `updateServiceWorker()`: function to update the service worker

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
const { isPWAInstalled, showInstallPrompt, install, cancelInstall } = usePWA()

// Check if app is already installed
console.log('Is installed:', isPWAInstalled.value)

// Check if install prompt should be shown
console.log('Show install prompt:', showInstallPrompt.value)

// Install the app
const installApp = async () => {
  try {
    const result = await install()
    if (result?.outcome === 'accepted') {
      console.log('App installed successfully!')
    } else {
      console.log('Installation was dismissed')
    }
  } catch (error) {
    console.error('Installation failed:', error)
  }
}

// Cancel install prompt
const cancelInstallPrompt = () => {
  cancelInstall()
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
- [ ] PouchDB offline functionality works
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
The app is configured as "VVN Booking" with the full name "VVN Booking - Student Management". To update:
```typescript
manifest: {
  name: 'VVN Booking - Student Management',
  short_name: 'VVN Booking'
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
- PouchDB provides local-first offline functionality
- No separate offline page needed due to PouchDB's offline capabilities