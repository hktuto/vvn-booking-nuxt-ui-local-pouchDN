export default defineNuxtPlugin(() => {
  const { initOnboarding } = useOnboarding()
  
  // Initialize onboarding when the app is ready
  onMounted(() => {
    initOnboarding()
  })
}) 