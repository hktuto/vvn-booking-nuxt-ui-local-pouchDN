import { driver, type Driver } from 'driver.js'
import 'driver.js/dist/driver.css'

export interface OnboardingStep {
  element: string
  popover: {
    title: string
    description: string
    side?: 'top' | 'bottom' | 'left' | 'right'
    align?: 'start' | 'center' | 'end'
    buttons?: Array<{
      text: string
      action: () => void
    }>
  }
}

export type UseOnBoardingParams = {
  key: string
  path: string
  steps: OnboardingStep[]
  autoStart?: boolean
}

export const useOnBoardingState = () => useState('onboardingState', () => ({
  isOnboardingActive: false,
  currentTourId: null as string | null,
  currentTourPath: null as string | null,
}))

export const useDriver = () => useState<Driver | null>('driver', () => null)

export const useOnBoarding = (params: UseOnBoardingParams) => {
  const { key, steps, path, autoStart = true } = params
  const driverInstance = useDriver()
  const state = useOnBoardingState()
  const { t } = useI18n()

  function completeStep(stepKey?: string) {
    const stepToComplete = stepKey || key
    const storageKey = `onboarding_${key}`
    const finishedSteps = localStorage.getItem(storageKey)
    
    if (finishedSteps) {
      const finishedStepsArray = finishedSteps.split(',')
      const updatedFinishedSteps = [...new Set([...finishedStepsArray, stepToComplete])]
      localStorage.setItem(storageKey, updatedFinishedSteps.join(','))
    } else {
      localStorage.setItem(storageKey, stepToComplete)
    }
  }

  function needOnBoarding() {
    const storageKey = `onboarding_${key}`
    const finishedSteps = localStorage.getItem(storageKey)

    if (finishedSteps) {
      const isFinished = finishedSteps.split(',').includes(key)
      return !isFinished
    }
    return true
  }

  function stopTour() {
    if (driverInstance.value) {
      driverInstance.value.destroy()
      driverInstance.value = null
    }
    state.value.isOnboardingActive = false
    state.value.currentTourId = null
    state.value.currentTourPath = null
  }

  function startTour() {
    if (state.value.isOnboardingActive) {
      // User may change the page, so we need to stop the current tour
      stopTour()
    }

    // Convert steps to Driver.js format
    const driverSteps = steps.map((step) => ({
      element: step.element,
      popover: {
        title: step.popover.title,
        description: step.popover.description,
        side: step.popover.side || 'bottom',
        align: step.popover.align || 'start',
        ...(step.popover.buttons && {
          buttons: step.popover.buttons
        })
      }
    }))

    driverInstance.value = driver({
      showProgress: true,
      steps: driverSteps
    })

    nextTick(() => {
      if (driverInstance.value) {
        driverInstance.value.drive()
        state.value.isOnboardingActive = true
        state.value.currentTourId = key
        state.value.currentTourPath = path
      }
    })
  }

  function resetOnboarding() {
    const storageKey = `onboarding_${key}`
    localStorage.removeItem(storageKey)
  }

  // Auto-start if needed and enabled
  if (autoStart && process.client) {
    onMounted(() => {
      if (needOnBoarding()) {
        startTour()
      }
    })
  }

  return {
    // State
    isOnboardingActive: computed(() => state.value.isOnboardingActive),
    currentTourId: computed(() => state.value.currentTourId),
    currentTourPath: computed(() => state.value.currentTourPath),
    
    // Functions
    completeStep,
    needOnBoarding,
    stopTour,
    startTour,
    resetOnboarding
  }
} 