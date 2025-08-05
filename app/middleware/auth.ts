export default defineNuxtRouteMiddleware((to) => {
  const { auth } = useAuth()
  
  // Skip middleware if auth is still loading
  if (auth.value.loading) {
    return
  }
  
  // Check if the page explicitly doesn't require authentication
  if (to.meta.auth === false) {
    return // Allow access to public pages
  }
  
  // Allow access to login and register pages
  if (to.path === '/login' || to.path === '/register') {
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