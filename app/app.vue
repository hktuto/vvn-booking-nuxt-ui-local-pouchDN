
<script setup lang="ts">
const goHome = () => {
  navigateTo('/')
}

</script>

<template>
  <NuxtErrorBoundary>
    <UApp>
      <NuxtPwaManifest />
      <NuxtLoadingIndicator />
      <PWAInstallButton />
      <NuxtPage />
    </UApp>
    
    <template #error="{ error, clearError }" @error="handleError">
      <div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div class="max-w-md w-full space-y-8 p-6">
          <div class="text-center">
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Something went wrong
            </h1>
            <p class="text-gray-600 dark:text-gray-400 mb-6">
              {{ error.message || 'An unexpected error occurred' }}
            </p>
            <div class="space-x-4">
              <UButton @click="clearError" color="blue">
                Try Again
              </UButton>
              <UButton @click="goHome" variant="outline">
                Go Home
              </UButton>
            </div>
          </div>
        </div>
      </div>
    </template>
  </NuxtErrorBoundary>
</template>

