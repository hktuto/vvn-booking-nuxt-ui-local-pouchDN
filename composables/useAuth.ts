

export const useAuthState = () => useState('auth', () => ({
  isAuthenticated: false,
  user: null as any,
  loading: true
}))

export const useAuth = () => {
  const auth = useAuthState()
  const { hasUsers, authenticateUser } = useUsers()

  // Check for existing session on composable initialization
  const initAuth = () => {
    try {
      const storedUser = localStorage.getItem('auth_user')
      const storedToken = localStorage.getItem('auth_token')
      
      if (storedUser && storedToken) {
        auth.value.user = JSON.parse(storedUser)
        auth.value.isAuthenticated = true
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
      const user = await authenticateUser(username, password)
      
      if (user) {
        const authUser = {
          id: user._id,
          username: user.username,
          role: user.role,
          display_name: user.display_name,
          email: user.email,
          phone: user.phone,
          country_code: user.country_code,
          settings: user.settings,
          created_at: user.created_at
        }
        
        const token = 'auth-token-' + Date.now()
        
        // Store in localStorage
        localStorage.setItem('auth_user', JSON.stringify(authUser))
        localStorage.setItem('auth_token', token)
        
        // Update reactive state
        auth.value.user = authUser
        auth.value.isAuthenticated = true
        
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