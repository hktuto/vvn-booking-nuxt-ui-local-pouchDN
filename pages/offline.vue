<template>
  <div class="offline-page">
    <div class="offline-content">
      <div class="offline-icon">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-16 h-16">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
      </div>
      <h1 class="offline-title">You're Offline</h1>
      <p class="offline-description">
        Please check your internet connection and try again.
      </p>
      <button @click="retryConnection" class="retry-btn">
        Try Again
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const router = useRouter()

const retryConnection = () => {
  if (navigator.onLine) {
    router.push('/')
  } else {
    // Still offline, show message
    alert('You are still offline. Please check your internet connection.')
  }
}
</script>

<style scoped>
.offline-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f9fafb;
  padding: 1rem;
}

.offline-content {
  text-align: center;
  max-width: 400px;
}

.offline-icon {
  color: #6b7280;
  margin-bottom: 1.5rem;
}

.offline-title {
  font-size: 1.875rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 0.5rem;
}

.offline-description {
  font-size: 1rem;
  color: #6b7280;
  margin-bottom: 2rem;
  line-height: 1.5;
}

.retry-btn {
  background: #000000;
  color: #ffffff;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 0.375rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.retry-btn:hover {
  background: #374151;
}
</style>