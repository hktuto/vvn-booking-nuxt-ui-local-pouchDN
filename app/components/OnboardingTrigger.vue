<template>
  <UButton
    @click="handleOnboardingTrigger"
    variant="ghost"
    size="sm"
    icon="i-heroicons-question-mark-circle"
  >
    {{ $t('onboarding.letsStart') }}
  </UButton>
</template>

<script setup lang="ts">
// This component is now simplified - it just shows a button
// The actual tour logic is handled by each page individually
const handleOnboardingTrigger = () => {
  // This would need to be implemented per page
  console.log('Onboarding trigger clicked - implement per page')
}
</script> 