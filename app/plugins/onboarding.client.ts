export default defineNuxtPlugin(() => {
  // Only run on client side
  if (process.server) return
  
  // Initialize onboarding when the app is ready
  onMounted(() => {
    const { initOnboarding } = useOnboarding()
    initOnboarding()
  })
}) 