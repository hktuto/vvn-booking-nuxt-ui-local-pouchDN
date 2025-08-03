<template>
  <div v-if="canInstall && !isInstalled" class="pwa-install-banner">
    <div class="pwa-install-content">
      <div class="pwa-install-text">
        <h3>Install App</h3>
        <p>Add this app to your home screen for a better experience</p>
      </div>
      <div class="pwa-install-actions">
        <button @click="handleInstall" class="pwa-install-btn">
          Install
        </button>
        <button @click="dismissInstall" class="pwa-dismiss-btn">
          Dismiss
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { canInstall, isInstalled, installPWA } = usePWA()

const handleInstall = async () => {
  try {
    await installPWA()
    console.log('PWA installed successfully')
  } catch (error) {
    console.error('Failed to install PWA:', error)
  }
}

const dismissInstall = () => {
  // You can implement dismiss logic here
  console.log('Install prompt dismissed')
}
</script>

<style scoped>
.pwa-install-banner {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #ffffff;
  border-top: 1px solid #e5e7eb;
  padding: 1rem;
  z-index: 1000;
  box-shadow: 0 -4px 6px -1px rgba(0, 0, 0, 0.1);
}

.pwa-install-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1200px;
  margin: 0 auto;
}

.pwa-install-text h3 {
  margin: 0 0 0.25rem 0;
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
}

.pwa-install-text p {
  margin: 0;
  font-size: 0.875rem;
  color: #6b7280;
}

.pwa-install-actions {
  display: flex;
  gap: 0.5rem;
}

.pwa-install-btn {
  background: #000000;
  color: #ffffff;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.pwa-install-btn:hover {
  background: #374151;
}

.pwa-dismiss-btn {
  background: transparent;
  color: #6b7280;
  border: 1px solid #d1d5db;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.pwa-dismiss-btn:hover {
  background: #f9fafb;
  color: #374151;
}

@media (max-width: 640px) {
  .pwa-install-content {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
  
  .pwa-install-actions {
    width: 100%;
    justify-content: center;
  }
}
</style>