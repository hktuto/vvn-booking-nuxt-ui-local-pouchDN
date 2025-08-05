the useOnBoarding and usePageOnboarding can be merge, below are my proposal for the onboarding composable


```
// useOnBoarding
import { driver, type Driver } from 'driver.js'
import 'driver.js/dist/driver.css'


export const useOnBoardingState = () => useState('onboardingState', () => ({
  isOnboardingActive: false,
  currentTourId: null,
  currentTourPath: null,
}))

export type UseOnBoardingParma = {
  'key':string,
  path: string,
  steps: OnboardingStep[],
}

export const useDriver = () => useState('driver', () => null)

export const useOnBoarding = (params: UseOnBoardingParma) => {

  const { key, steps, path } = params
  const driver = useDriver()
  const state = useOnBoardingState()

  function completeStep(step: string){
    const finishedSteps = localStorage.getItem(`onboarding_key`)
    if(finishedSteps){
      const finishedStepsArray = finishedSteps.split(',')
      const updatedFinishedSteps = [...new Set([...finishedStepsArray, step])]
      localStorage.setItem(`onboarding_key`, updatedFinishedSteps.join(','))
    }else{
      localStorage.setItem(`onboarding_key`, key)
    }
  }

  function needOnBoarding(){
    // store the finished steps in the local storage as a comma separated string
    const finishedSteps = localStorage.getItem(`onboarding_key`)

    if(finishedSteps){
      const isFinished = finishedSteps.split(',').includes(key)
      return !isFinished
    }
    return true
  }

  function stopTour(){
    if(driver.value){
      driver.value.destroy()
    }
    state.value.isOnboardingActive = false
    state.value.currentTourId = null
    state.value.currentTourPath = null
  }

  function startTour(){
    if(state.value.isOnboardingActive){
      // user may change the page, so we need to stop the current tour
      stopTour()
    }
    driver.value = driver({
      showProgress: true,
      steps: driverSteps
    })
    nextTick(() => {
      driver.value.drive()
      state.value.isOnboardingActive = true
      state.value.currentTourId = key
      state.value.currentTourPath = path
    })
  }



  onMounted(() => {
    if(needOnBoarding()){
      startTour()
    }
  })

}



// other page

<script setup lang="ts">

const dashboardTourSteps: OnboardingStep[] = [
  {
    element: '.dashboard-title',
    popover: {
      title: 'Dashboard',
      description: 'This is the dashboard',
      side: 'bottom',
      align: 'start',
      buttons: [
        {
          text: 'Skip',
          action: () => {
            completeStep()
          }
        }
      ]
    },
  },
]

const { completeStep } = useOnBoarding({
  key: 'dashboard',
  path: '/',
  steps: dashboardTourSteps,
})

</script>


```










