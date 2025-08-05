<template>
  <NuxtLayout name="default">
    <template #header>
      <div class="flex items-center justify-between w-full">
        <div>
          <h1 class="text-xl font-semibold text-gray-900 dark:text-white classes-page-title">{{ t('class.classes') }}</h1>
          
        </div>
      </div>
    </template>

    <UiPageContainer padding="small">
      <MenuClass />
      <ClassTabContent class="classes-tab-content" />
    </UiPageContainer>
  </NuxtLayout>
</template>

<script setup lang="ts">
import type { DriveStep } from 'driver.js'

definePageMeta({ middleware: 'auth' })

const { t } = useI18n()
const route = useRoute()
const router = useRouter()

// Classes page tour steps
const classesTourSteps: DriveStep[] = [
  {
    element: '.classes-page-title',
    popover: {
      title: t('onboarding.classes.title'),
      description: t('onboarding.classes.description'),
      side: 'bottom',
      align: 'start'
    }
  },
  {
    element: '.classes-tab-content',
    popover: {
      title: t('onboarding.classes.content'),
      description: t('onboarding.classes.contentDescription'),
      side: 'top',
      align: 'start'
    }
  }
]

// Use the onboarding API
const { completeStep } = useOnBoarding({
  key: 'classes',
  path: '/classes',
  steps: classesTourSteps,
  autoStart: true
})

</script> 