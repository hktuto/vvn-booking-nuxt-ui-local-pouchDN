<template>
  <NuxtLayout>
    <template #header>
      <div class="flex items-center justify-between w-full">
        <div>
          <h1 class="text-xl font-semibold text-gray-900 dark:text-white bookings-page-title">{{ t('booking.bookings') }}</h1>
        </div>
      </div>
    </template>

    <UiPageContainer padding="small">
      <MenuClass />
      <BookingTabContent class="bookings-tab-content" />
    </UiPageContainer>
  </NuxtLayout>
</template>

<script setup lang="ts">
import type { DriveStep } from 'driver.js'

const { t } = useI18n()
definePageMeta({
  middleware: 'auth'
})

// Bookings page tour steps
const bookingsTourSteps: DriveStep[] = [
  {
    element: '.bookings-page-title',
    popover: {
      title: t('onboarding.bookings.title'),
      description: t('onboarding.bookings.description'),
      side: 'bottom',
      align: 'start'
    }
  },
  {
    element: '.bookings-tab-content',
    popover: {
      title: t('onboarding.bookings.content'),
      description: t('onboarding.bookings.contentDescription'),
      side: 'top',
      align: 'start'
    }
  }
]

// Use the onboarding API
const { completeStep } = useOnBoarding({
  key: 'bookings',
  path: '/bookings',
  steps: bookingsTourSteps,
  autoStart: true
})

</script>