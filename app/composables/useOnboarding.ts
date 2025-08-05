
import { driver, type Driver, type DriveStep } from 'driver.js'
import 'driver.js/dist/driver.css'



export type UseOnBoardingParams = {
  key: string
  path: string
  steps: DriveStep[]
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

  function completeStep() {
    console.log('completeStep', key)
    const stepToComplete = key
    const finishedSteps = localStorage.getItem('onboarding_keys')
    
    if (finishedSteps) {
      const finishedStepsArray = finishedSteps.split(',')
      const updatedFinishedSteps = [...new Set([...finishedStepsArray, stepToComplete])]
      localStorage.setItem('onboarding_keys', updatedFinishedSteps.join(','))
    } else {
      localStorage.setItem('onboarding_keys', stepToComplete)
    }
    stopTour()
  }

  function needOnBoarding() {
    const finishedSteps = localStorage.getItem('onboarding_keys')

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
    

    driverInstance.value = driver({
      showProgress: true,
      steps,
      animate: true,
      overlayColor: '#000',
      overlayOpacity: 0.5,
      stagePadding: 10,
      stageRadius: 5,
      allowKeyboardControl: true,
      popoverOffset: 10,
      showButtons: ['next', 'previous', 'close'],
      nextBtnText: t('onboarding.next'),
      prevBtnText: t('onboarding.previous'),
      doneBtnText: t('onboarding.finish'),
      progressText: t('onboarding.progress.step', { current: '{{current}}', total: '{{total}}' })
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
    localStorage.removeItem('onboarding_keys')
  }

  onMounted(() => {
    console.log('needOnBoarding', needOnBoarding())
    if (needOnBoarding()) {
      console.log('Starting tour')
      startTour()
    }
  })

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