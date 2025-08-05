import type { OnboardingStep } from './useOnboarding'

export const usePageOnboarding = () => {
  const { startTour, isOnboardingActive, currentTourId } = useOnboarding()
  
  // Define tour steps for the current page
  const definePageTour = (steps: OnboardingStep[]) => {
    // Start the tour with custom steps
    startTour(undefined, steps)
  }
  
  // Helper function to create action handlers
  const createAction = (text: string, handler: () => void) => ({
    text,
    handler
  })
  
  // Helper function to create navigation actions
  const createNavigationAction = (text: string, path: string) => ({
    text,
    handler: () => navigateTo(path)
  })
  
  // Helper function to create modal opening actions
  const createModalAction = (text: string, modalRef: Ref<boolean>) => ({
    text,
    handler: () => {
      modalRef.value = true
    }
  })
  
  // Helper function to create button click actions
  const createClickAction = (text: string, elementSelector: string) => ({
    text,
    handler: () => {
      const element = document.querySelector(elementSelector) as HTMLElement
      if (element) {
        element.click()
      }
    }
  })
  
  // Helper function to create form focus actions
  const createFocusAction = (text: string, elementSelector: string) => ({
    text,
    handler: () => {
      const element = document.querySelector(elementSelector) as HTMLElement
      if (element) {
        element.focus()
      }
    }
  })
  
  // Helper function to create menu opening actions
  const createMenuAction = (text: string, menuRef: Ref<boolean>) => ({
    text,
    handler: () => {
      menuRef.value = true
    }
  })
  
  // Helper function to create tab switching actions
  const createTabAction = (text: string, tabRef: Ref<string>, tabValue: string) => ({
    text,
    handler: () => {
      tabRef.value = tabValue
    }
  })
  
  return {
    // State
    isOnboardingActive: readonly(isOnboardingActive),
    currentTourId: readonly(currentTourId),
    
    // Main function
    definePageTour,
    
    // Helper functions
    createAction,
    createNavigationAction,
    createModalAction,
    createClickAction,
    createFocusAction,
    createMenuAction,
    createTabAction
  }
} 