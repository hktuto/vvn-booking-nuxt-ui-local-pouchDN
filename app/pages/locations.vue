<template>
  <NuxtLayout name="default">
    <template #header>
      <div class="flex items-center justify-between w-full">
        <div>
          <h1 class="text-xl font-semibold text-gray-900 dark:text-white locations-page-title">
            {{ t('location.locations') }}
          </h1>
        </div>
      </div>
    </template>

    <UiPageContainer padding="small">
      <MenuClass />
      <LocationTabContent ref="locationTabContentRef" class="locations-tab-content" />
    </UiPageContainer>

  </NuxtLayout>
</template>

<script setup lang="ts">
import type { LocationTabContent } from '#components'
import type { DriveStep } from 'driver.js'

definePageMeta({
  middleware: 'auth'
})

const { t } = useI18n()
const locationTabContentRef = ref<InstanceType<typeof LocationTabContent>>()

// Locations page tour steps
const locationsTourSteps: DriveStep[] = [
  {
    element: '.locations-page-title',
    popover: {
      title: t('onboarding.locations.title'),
      description: t('onboarding.locations.description'),
      side: 'bottom',
      align: 'start'
    }
  },
  {
    element: '.locations-tab-content',
    popover: {
      title: t('onboarding.locations.content'),
      description: t('onboarding.locations.contentDescription'),
      side: 'top',
      align: 'start'
    }
  }
]

// Use the onboarding API
const { completeStep } = useOnBoarding({
  key: 'locations',
  path: '/locations',
  steps: locationsTourSteps,
  autoStart: true
})

const addNewLocation = () => {
  completeStep()
  locationTabContentRef.value?.openAddLocationModal()
}

</script> 