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
const { definePageTour } = usePageOnboarding()
const { isOnboardingActive, hasCompletedOnboarding } = useOnboarding()

const handleOnboardingTrigger = () => {
  // Start the current page's tour
  const { startTour } = useOnboarding()
  startTour() // No parameters will trigger current page tour
}
</script> 