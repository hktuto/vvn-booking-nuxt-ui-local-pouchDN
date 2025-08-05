import { driver, type Driver } from 'driver.js'
import 'driver.js/dist/driver.css'

export interface OnboardingStep {
  element: string
  popover: {
    title: string
    description: string
    side?: 'top' | 'bottom' | 'left' | 'right'
    align?: 'start' | 'center' | 'end'
  }
  action?: {
    text: string
    handler: () => void
  }
}

export interface OnboardingTour {
  id: string
  name: string
  steps: OnboardingStep[]
  autoStart?: boolean
}

export const useOnboarding = () => {
  const { $t } = useNuxtApp()
  const { locale } = useI18n()
  
  // State management
  const isOnboardingActive = ref(false)
  const currentTour = ref<Driver | null>(null)
  const currentTourId = ref<string | null>(null)
  const hasCompletedOnboarding = ref(false)
  
  // Check if user has completed onboarding
  const checkOnboardingStatus = () => {
    if (process.client) {
      hasCompletedOnboarding.value = localStorage.getItem('onboarding-completed') === 'true'
    }
  }
  
  // Mark onboarding as completed
  const completeOnboarding = () => {
    if (process.client) {
      localStorage.setItem('onboarding-completed', 'true')
      hasCompletedOnboarding.value = true
    }
  }
  
  // Reset onboarding status (for testing)
  const resetOnboarding = () => {
    if (process.client) {
      localStorage.removeItem('onboarding-completed')
      hasCompletedOnboarding.value = false
    }
  }
  
  // Get tour progress
  const getTourProgress = (tourId: string) => {
    if (process.client) {
      return localStorage.getItem(`tour-progress-${tourId}`)
    }
    return null
  }
  
  // Save tour progress
  const saveTourProgress = (tourId: string, step: number) => {
    if (process.client) {
      localStorage.setItem(`tour-progress-${tourId}`, step.toString())
    }
  }
  
  // Dashboard tour steps
  const getDashboardTourSteps = (): OnboardingStep[] => [
    {
      element: '.dashboard-title',
      popover: {
        title: $t('onboarding.welcome'),
        description: $t('onboarding.welcomeSubtitle'),
        side: 'bottom',
        align: 'start'
      }
    },
    {
      element: '.stats-card',
      popover: {
        title: $t('onboarding.dashboard.title'),
        description: $t('onboarding.dashboard.statsCard'),
        side: 'bottom',
        align: 'start'
      }
    },
    {
      element: '.quick-actions',
      popover: {
        title: $t('onboarding.dashboard.quickActions'),
        description: $t('onboarding.dashboard.studentsButton'),
        side: 'bottom',
        align: 'start'
      }
    },
    {
      element: '.students-button',
      popover: {
        title: $t('onboarding.students.title'),
        description: $t('onboarding.students.addButton'),
        side: 'bottom',
        align: 'center'
      },
      action: {
        text: $t('onboarding.letsStart'),
        handler: () => navigateTo('/students')
      }
    },
    {
      element: '.locations-button',
      popover: {
        title: $t('onboarding.locations.title'),
        description: $t('onboarding.locations.prerequisite'),
        side: 'bottom',
        align: 'center'
      },
      action: {
        text: $t('onboarding.letsStart'),
        handler: () => navigateTo('/locations')
      }
    },
    {
      element: '.main-navigation',
      popover: {
        title: $t('onboarding.dashboard.navigation'),
        description: $t('onboarding.dashboard.description'),
        side: 'right',
        align: 'start'
      }
    }
  ]
  
  // Students tour steps
  const getStudentsTourSteps = (): OnboardingStep[] => [
    {
      element: '.add-student-button',
      popover: {
        title: $t('onboarding.students.title'),
        description: $t('onboarding.students.addButton'),
        side: 'bottom',
        align: 'center'
      }
    },
    {
      element: '.student-form',
      popover: {
        title: $t('onboarding.students.form'),
        description: $t('onboarding.students.description'),
        side: 'right',
        align: 'start'
      }
    }
  ]
  
  // Locations tour steps
  const getLocationsTourSteps = (): OnboardingStep[] => [
    {
      element: '.add-location-button',
      popover: {
        title: $t('onboarding.locations.title'),
        description: $t('onboarding.locations.addButton'),
        side: 'bottom',
        align: 'center'
      }
    },
    {
      element: '.location-form',
      popover: {
        title: $t('onboarding.locations.form'),
        description: $t('onboarding.locations.description'),
        side: 'right',
        align: 'start'
      }
    }
  ]
  
  // Packages tour steps
  const getPackagesTourSteps = (): OnboardingStep[] => [
    {
      element: '.add-package-button',
      popover: {
        title: $t('onboarding.packages.title'),
        description: $t('onboarding.packages.addButton'),
        side: 'bottom',
        align: 'center'
      }
    },
    {
      element: '.package-form',
      popover: {
        title: $t('onboarding.packages.form'),
        description: $t('onboarding.packages.description'),
        side: 'right',
        align: 'start'
      }
    }
  ]
  
  // Classes tour steps (preview)
  const getClassesTourSteps = (): OnboardingStep[] => [
    {
      element: '.classes-section',
      popover: {
        title: $t('onboarding.classes.title'),
        description: $t('onboarding.classes.comingSoon'),
        side: 'bottom',
        align: 'center'
      }
    }
  ]
  
  // Bookings tour steps (preview)
  const getBookingsTourSteps = (): OnboardingStep[] => [
    {
      element: '.bookings-section',
      popover: {
        title: $t('onboarding.bookings.title'),
        description: $t('onboarding.bookings.comingSoon'),
        side: 'bottom',
        align: 'center'
      }
    }
  ]
  
  // Create and start a tour
  const startTour = (tourId: string, customSteps?: OnboardingStep[]) => {
    if (isOnboardingActive.value) {
      stopTour()
    }
    
    let steps: OnboardingStep[] = []
    
    switch (tourId) {
      case 'dashboard':
        steps = getDashboardTourSteps()
        break
      case 'students':
        steps = getStudentsTourSteps()
        break
      case 'locations':
        steps = getLocationsTourSteps()
        break
      case 'packages':
        steps = getPackagesTourSteps()
        break
      case 'classes':
        steps = getClassesTourSteps()
        break
      case 'bookings':
        steps = getBookingsTourSteps()
        break
      default:
        if (customSteps) {
          steps = customSteps
        } else {
          console.warn(`Unknown tour ID: ${tourId}`)
          return
        }
    }
    
    // Convert steps to Driver.js format
    const driverSteps = steps.map((step, index) => ({
      element: step.element,
      popover: {
        title: step.popover.title,
        description: step.popover.description,
        side: step.popover.side || 'bottom',
        align: step.popover.align || 'start',
        ...(step.action && {
          buttons: [
            {
              text: step.action.text,
              action: step.action.handler
            }
          ]
        })
      }
    }))
    
    // Create driver instance
    const driverObj = driver({
      showProgress: true,
      steps: driverSteps,
      onComplete: () => {
        isOnboardingActive.value = false
        currentTour.value = null
        currentTourId.value = null
        
        if (tourId === 'dashboard') {
          completeOnboarding()
        }
        
        // Show completion message
        const { toast } = useToast()
        toast.add({
          title: $t('onboarding.progress.completed'),
          color: 'green'
        })
      },
      onCloseClick: () => {
        isOnboardingActive.value = false
        currentTour.value = null
        currentTourId.value = null
      },
      onDeselected: () => {
        // Save progress when user skips
        saveTourProgress(tourId, 0)
      }
    })
    
    // Start the tour
    currentTour.value = driverObj
    currentTourId.value = tourId
    isOnboardingActive.value = true
    
    // Wait for elements to be available
    nextTick(() => {
      setTimeout(() => {
        driverObj.drive()
      }, 100)
    })
  }
  
  // Stop current tour
  const stopTour = () => {
    if (currentTour.value) {
      currentTour.value.destroy()
      currentTour.value = null
      currentTourId.value = null
      isOnboardingActive.value = false
    }
  }
  
  // Auto-start dashboard tour for new users
  const autoStartDashboardTour = () => {
    if (!hasCompletedOnboarding.value && process.client) {
      // Wait for page to load
      setTimeout(() => {
        startTour('dashboard')
      }, 1000)
    }
  }
  
  // Initialize onboarding
  const initOnboarding = () => {
    checkOnboardingStatus()
    
    // Auto-start for new users on dashboard
    if (process.client) {
      const route = useRoute()
      if (route.path === '/' && !hasCompletedOnboarding.value) {
        autoStartDashboardTour()
      }
    }
  }
  
  // Watch for locale changes and restart tour if needed
  watch(locale, () => {
    if (isOnboardingActive.value && currentTourId.value) {
      // Restart current tour with new translations
      const currentId = currentTourId.value
      stopTour()
      nextTick(() => {
        startTour(currentId)
      })
    }
  })
  
  return {
    // State
    isOnboardingActive: readonly(isOnboardingActive),
    currentTourId: readonly(currentTourId),
    hasCompletedOnboarding: readonly(hasCompletedOnboarding),
    
    // Methods
    startTour,
    stopTour,
    initOnboarding,
    completeOnboarding,
    resetOnboarding,
    getTourProgress,
    saveTourProgress,
    
    // Tour step getters
    getDashboardTourSteps,
    getStudentsTourSteps,
    getLocationsTourSteps,
    getPackagesTourSteps,
    getClassesTourSteps,
    getBookingsTourSteps
  }
} 