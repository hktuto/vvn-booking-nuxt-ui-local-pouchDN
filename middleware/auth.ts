export default defineNuxtRouteMiddleware((to) => {
  const { auth } = useAuth()
  // Skip middleware if auth is still loading
  if (auth.value.loading) {
    return
  }
  
  // Allow access to login page
  if (to.path === '/login') {
    // Redirect to dashboard if already authenticated
    if (auth.value.isAuthenticated) {
      return navigateTo('/')
    }
    return
  }
  
  // Require authentication for all other routes
  if (!auth.value.isAuthenticated) {
    return navigateTo('/login')
  }
}) 