<template>
  <NuxtLayout >
    <template #header>
      <div class="flex items-center justify-between w-full">
        <div class="dashboard-title">
          <h1 class="text-xl font-semibold text-gray-900 dark:text-white">
            {{ $t('dashboard.title') }}
          </h1>
        </div>
        <!-- <OnboardingTrigger /> -->
      </div>
    </template>

    <UiPageContainer>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      <UCard class="stats-card">
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-base font-semibold text-gray-900 dark:text-white">
              {{ $t('dashboard.totalStudents') }}
            </h3>
            <UIcon name="i-heroicons-users" class="h-6 w-6 text-primary-500" />
          </div>
        </template>
        <div>
          <p class="text-3xl font-bold text-primary-600">{{ students.length }}</p>
          <p class="text-sm text-gray-500 mt-1">
            {{ registeredStudents }} {{ $t('dashboard.registeredStudents').toLowerCase() }}
          </p>
        </div>
      </UCard>


      <UCard v-if="todayClasses">
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-base font-semibold text-gray-900 dark:text-white">
              {{ $t('dashboard.todayClasses') }}
            </h3>
            <UIcon name="i-heroicons-calendar-days" class="h-6 w-6 text-primary-500" />
          </div>
        </template>
        <div>
          <p class="text-3xl font-bold text-primary-600">{{ todayClasses }}</p>
          <p class="text-sm text-gray-500 mt-1">Scheduled for today</p>
        </div>
      </UCard>
    </div>

    <!-- Quick Actions -->
    <UCard>
      <template #header>
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
          Quick Actions
        </h3>
      </template>
      
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 quick-actions">
        <UButton 
          to="/students"
          variant="soft"
          class="h-20 flex flex-col students-button"
          block
        >
          <UIcon name="i-heroicons-users" class="h-6 w-6 mb-2" />
          <span class="text-sm">{{ $t('common.students') }}</span>
        </UButton>
        
        <UButton 
          to="/locations"
          variant="soft" 
          class="h-20 flex flex-col locations-button"
          block
        >
          <UIcon name="i-heroicons-map-pin" class="h-6 w-6 mb-2" />
          <span class="text-sm">{{ $t('location.locations') }}</span>
        </UButton>
        
        <UButton 
          to="/classes"
          variant="soft" 
          class="h-20 flex flex-col classes-button"
          block
        >
          <UIcon name="i-heroicons-calendar-days" class="h-6 w-6 mb-2" />
          <span class="text-sm">{{ $t('common.classes') }}</span>
        </UButton>
        
        <UButton 
          to="/packages"
          variant="soft"
          class="h-20 flex flex-col packages-button"
          block
        >
          <UIcon name="i-heroicons-book-open" class="h-6 w-6 mb-2" />
          <span class="text-sm">{{ $t('common.packages') }}</span>
        </UButton>
        
        <UButton 
          to="/bookings"
          variant="soft"
          class="h-20 flex flex-col bookings-button"
          block
        >
          <UIcon name="i-heroicons-clipboard-document-list" class="h-6 w-6 mb-2" />
          <span class="text-sm">{{ $t('common.bookings') }}</span>
        </UButton>
        
        <UButton 
          to="/transactions"
          variant="soft"
          class="h-20 flex flex-col transactions-button"
          block
        >
          <UIcon name="i-heroicons-banknotes" class="h-6 w-6 mb-2" />
          <span class="text-sm">{{ $t('common.transactions') }}</span>
        </UButton>
      </div>
    </UCard>
    </UiPageContainer>
  </NuxtLayout>
</template>

<script setup lang="ts">
const { students } = useStudents()
const todayClasses = ref<number>(0)
const { getBookingsForDate } = useBookings()
const { t } = useI18n()

import type { DriveStep } from 'driver.js'

// Dashboard tour steps
const dashboardTourSteps: DriveStep[] = [
  {
    element: '.dashboard-title',
    popover: {
      title: t('onboarding.welcome'),
      description: t('onboarding.welcomeSubtitle'),
      side: 'bottom',
      align: 'start'
    }
  },
  {
    element: '.stats-card',
    popover: {
      title: t('onboarding.dashboard.title'),
      description: t('onboarding.dashboard.statsCard'),
      side: 'bottom',
      align: 'start'
    }
  },
  {
    element: '.quick-actions',
    popover: {
      title: t('onboarding.dashboard.quickActions'),
      description: t('onboarding.dashboard.studentsButton'),
      side: 'bottom',
      align: 'start'
    }
  },
  {
    element: '.students-button',
    popover: {
      title: t('onboarding.students.title'),
      description: t('onboarding.students.addButton'),
      side: 'bottom',
      align: 'center',
    }
  },
  {
    element: '.locations-button',
    popover: {
      title: t('onboarding.locations.title'),
      description: t('onboarding.locations.prerequisite'),
      side: 'bottom',
      align: 'center',
      onNextClick: () => {
        completeStep()
        navigateTo('/locations')
      }
    }
  },
]

// Use the new simplified onboarding API
const { completeStep } = useOnBoarding({
  key: 'dashboard',
  path: '/',
  steps: dashboardTourSteps,
  autoStart: true
})

onMounted(async () => {
  const today = new Date().toISOString().split('T')[0] || ''
  const bookings = await getBookingsForDate(today)
  todayClasses.value = Array.isArray(bookings) ? bookings.length : 0 
})

definePageMeta({
  middleware: 'auth'
})

const registeredStudents = computed(() => 
  students.value.filter((s: any) => s.registered).length
)
</script>