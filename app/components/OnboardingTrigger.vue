<template>
  <UButton
    @click="handleOnboardingTrigger"
    variant="ghost"
    size="sm"
    icon="i-heroicons-question-mark-circle"
    :loading="isOnboardingActive"
    :disabled="isOnboardingActive"
  >
    {{ $t('onboarding.letsStart') }}
  </UButton>
</template>

<script setup lang="ts">
const { startTour, isOnboardingActive, hasCompletedOnboarding } = useOnboarding()

const handleOnboardingTrigger = () => {
  // Start the dashboard tour
  startTour('dashboard')
}
</script> 