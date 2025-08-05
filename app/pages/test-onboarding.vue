<template>
  <div class="p-8">
    <h1 class="text-2xl font-bold mb-6">Onboarding System Test</h1>
    
    <div class="space-y-6">
      <!-- Test Controls -->
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold">Test Controls</h3>
        </template>
        
        <div class="space-y-4">
          <div class="flex flex-wrap gap-4">
            <UButton @click="startDashboardTour" color="primary">
              Start Dashboard Tour
            </UButton>
            <UButton @click="startStudentsTour" color="success">
              Start Students Tour
            </UButton>
            <UButton @click="startLocationsTour" color="warning">
              Start Locations Tour
            </UButton>
            <UButton @click="startPackagesTour" color="secondary">
              Start Packages Tour
            </UButton>
            <UButton @click="stopCurrentTour" color="error">
              Stop Current Tour
            </UButton>
            <UButton @click="startTestPageTour" color="info">
              Start Test Page Tour
            </UButton>
          </div>
          
          <div class="flex flex-wrap gap-4">
            <UButton @click="resetOnboarding" variant="outline">
              Reset Onboarding Status
            </UButton>
            <UButton @click="checkStatus" variant="outline">
              Check Status
            </UButton>
          </div>
        </div>
      </UCard>
      
      <!-- Status Display -->
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold">Current Status</h3>
        </template>
        
        <div class="space-y-2">
          <p><strong>Onboarding Active:</strong> {{ isOnboardingActive ? 'Yes' : 'No' }}</p>
          <p><strong>Current Tour:</strong> {{ currentTourId || 'None' }}</p>
          <p><strong>Completed:</strong> {{ needOnBoarding() ? 'No' : 'Yes' }}</p>
          <p><strong>Current Locale:</strong> {{ $i18n.locale }}</p>
        </div>
      </UCard>
      
      <!-- Test Elements -->
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold">Test Elements</h3>
        </template>
        
        <div class="space-y-4">
          <div class="dashboard-title p-4 bg-gray-100 dark:bg-gray-800 rounded">
            <h2>Dashboard Title (Test Element)</h2>
            <p>This simulates the dashboard title area</p>
          </div>
          
          <div class="stats-card p-4 bg-blue-100 dark:bg-blue-900 rounded">
            <h3>Stats Card (Test Element)</h3>
            <p>This simulates the stats card area</p>
          </div>
          
          <div class="quick-actions p-4 bg-green-100 dark:bg-green-900 rounded">
            <h3>Quick Actions (Test Element)</h3>
            <div class="flex gap-2 mt-2">
              <button class="students-button px-3 py-1 bg-blue-500 text-white rounded">
                Students
              </button>
              <button class="locations-button px-3 py-1 bg-orange-500 text-white rounded">
                Locations
              </button>
            </div>
          </div>
          
          <div class="main-navigation p-4 bg-purple-100 dark:bg-purple-900 rounded">
            <h3>Main Navigation (Test Element)</h3>
            <p>This simulates the main navigation area</p>
          </div>
        </div>
      </UCard>
      
      <!-- Language Toggle -->
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold">Language Test</h3>
        </template>
        
        <div class="flex gap-4">
          <UButton @click="$i18n.setLocale('en')" :variant="$i18n.locale === 'en' ? 'solid' : 'outline'">
            English
          </UButton>
          <UButton @click="$i18n.setLocale('zh-Hant')" :variant="$i18n.locale === 'zh-Hant' ? 'solid' : 'outline'">
            繁體中文
          </UButton>
        </div>
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()

// Test page tour steps
const testPageTourSteps: OnboardingStep[] = [
  {
    element: '.dashboard-title',
    popover: {
      title: 'Test Dashboard Title',
      description: 'This is a test element for the dashboard title',
      side: 'bottom',
      align: 'start',
      buttons: [
        {
          text: 'Skip',
          action: () => completeStep()
        }
      ]
    }
  },
  {
    element: '.stats-card',
    popover: {
      title: 'Test Stats Card',
      description: 'This is a test element for the stats card',
      side: 'bottom',
      align: 'start'
    }
  },
  {
    element: '.students-button',
    popover: {
      title: 'Test Students Button',
      description: 'This is a test element for the students button',
      side: 'bottom',
      align: 'center',
      buttons: [
        {
          text: 'Click Students',
          action: () => {
            completeStep()
            const element = document.querySelector('.students-button') as HTMLElement
            if (element) element.click()
          }
        }
      ]
    }
  }
]

// Use the new simplified onboarding API
const { completeStep, startTour, stopTour, isOnboardingActive, currentTourId, resetOnboarding, needOnBoarding } = useOnBoarding({
  key: 'test-page',
  path: '/test-onboarding',
  steps: testPageTourSteps,
  autoStart: false
})

const startDashboardTour = () => {
  // This would need a separate onboarding instance for dashboard
  console.log('Dashboard tour not implemented in test page')
}

const startStudentsTour = () => {
  console.log('Students tour not implemented in test page')
}

const startLocationsTour = () => {
  console.log('Locations tour not implemented in test page')
}

const startPackagesTour = () => {
  console.log('Packages tour not implemented in test page')
}

const startTestPageTour = () => {
  startTour()
}

const stopCurrentTour = () => {
  stopTour()
}

const checkStatus = () => {
  console.log('Onboarding Status:', {
    isActive: isOnboardingActive.value,
    currentTour: currentTourId.value,
    completed: !needOnBoarding()
  })
}

definePageMeta({
  middleware: 'auth'
})
</script> 