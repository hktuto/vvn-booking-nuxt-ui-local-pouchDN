

export const useAuthState = () => useState('auth', () => ({
  isAuthenticated: false,
  user: null as any,
  loading: true
}))

export const useAuth = () => {
  const auth = useAuthState()
  

  // Check for existing session on composable initialization
  const initAuth = () => {
    try {
      const storedUser = localStorage.getItem('auth_user')
      const storedToken = localStorage.getItem('auth_token')
      
      if (storedUser && storedToken) {
        auth.value.user = JSON.parse(storedUser)
        auth.value.isAuthenticated = true

        // Attempt to resume sync if remote credentials are available
        try {
          const remoteRaw = localStorage.getItem('remote_auth')
          if (remoteRaw) {
            const remote = JSON.parse(remoteRaw) as { username: string; password: string; baseUrl: string }
            const { initializeLocalDatabases, startCouchSync } = useSync()
            initializeLocalDatabases().then(() => startCouchSync(remote))
          }
        } catch (e) {
          console.warn('Failed to resume sync:', e)
        }
      }
    } catch (error) {
      console.error('Error loading auth state:', error)
      // Clear invalid data
      localStorage.removeItem('auth_user')
      localStorage.removeItem('auth_token')
      auth.value.user = null
      auth.value.isAuthenticated = false
    } finally {
      auth.value.loading = false
    }
  }

  // Check if this is first time setup
  const checkFirstTimeSetup = async () => {
    try {
      const { hasUsers } = useUsers()
      const usersExist = await hasUsers()
      return !usersExist
    } catch (error) {
      console.error('Error checking first time setup:', error)
      return false
    }
  }

  // Login function
  const login = async (username: string, password: string) => {
    try {
      const runtimeConfig = useRuntimeConfig()
      const resp = await $fetch<{ success: boolean; user?: any; baseUrl?: string }>('/api/auth/login', {
        method: 'POST',
        body: { username, password }
      })

      if (resp?.success) {
        const authUser = {
          id: username, // use username as stable identifier
          username,
          role: resp.user?.role || 'teacher',
          display_name: username,
          email: '',
          phone: '',
          country_code: '',
          settings: {
            language: 'en',
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            currency: 'USD'
          },
          created_at: new Date().toISOString()
        }
        
        const token = 'auth-token-' + Date.now()
        
        // Store in localStorage
        localStorage.setItem('auth_user', JSON.stringify(authUser))
        localStorage.setItem('auth_token', token)
        localStorage.setItem('remote_auth', JSON.stringify({
          username,
          password,
          baseUrl: resp.baseUrl || (runtimeConfig.public as any).couchdbBaseUrl
        }))
        
        // Update reactive state
        auth.value.user = authUser
        auth.value.isAuthenticated = true
        
        // Initialize local databases and start sync
        const { initializeLocalDatabases, startCouchSync } = useSync()
        await initializeLocalDatabases()
        await startCouchSync({
          username,
          password,
          baseUrl: resp.baseUrl || (runtimeConfig.public as any).couchdbBaseUrl
        })
        
        // Redirect to dashboard
        await navigateTo('/')
        
        return { success: true, user: authUser }
      } else {
        auth.value.user = null
        auth.value.isAuthenticated = false
        throw new Error('Invalid credentials')
      }
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  // Logout function
  const logout = () => {
    // Clear localStorage
    localStorage.removeItem('auth_user')
    localStorage.removeItem('auth_token')
    localStorage.removeItem('remote_auth')
    
    // Update reactive state
    auth.value.user = null
    auth.value.isAuthenticated = false
    
    // Redirect to login
    navigateTo('/login')
  }

  // Initialize auth on composable creation
  initAuth()

  return {
    auth,
    login,
    logout,
    initAuth,
    checkFirstTimeSetup
  }
} 