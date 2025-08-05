import type { UserDocument } from './usePouchDB'
import { usePouchCRUD } from './usePouchDB'
import { useUserDB } from '~/utils/dbStateHelper'

export const useUsers = () => {
  const { getDB } = useUserDB()
  
  // Check if any users exist
  const hasUsers = async (): Promise<boolean> => {
    try {
      const usersDB = await getDB()
      console.log('usersDB', usersDB)
      const result = await usersDB.find({
        selector: { type: 'user' },
        limit: 1
      })
      return result.docs.length > 0
    } catch (error) {
      console.error('Error checking for users:', error)
      return false
    }
  }
  
  // Get user by username
  const getUserByUsername = async (username: string): Promise<UserDocument | null> => {
    try {
      const usersDB = await getDB()
      const result = await usersDB.find({
        selector: { 
          type: 'user',
          username: username
        }
      })
      return result.docs.length > 0 ? result.docs[0] as UserDocument : null
    } catch (error) {
      console.error('Error getting user by username:', error)
      return null
    }
  }
  
  // Create new user (register)
  const createUser = async (userData: {
    username: string
    password: string
    email?: string
    phone: string
    country_code: string
    display_name: string
    settings?: {
      language?: 'en' | 'zh-Hant'
      timezone?: string
      currency?: string
    }
  }) => {
    try {
      const usersDB = await getDB()
      const usersCRUD = usePouchCRUD<UserDocument>(usersDB)
      
      // Check if username already exists
      const existingUser = await getUserByUsername(userData.username)
      if (existingUser) {
        throw new Error('Username already exists')
      }
      
      // Hash password (simple hash for now, in production use proper bcrypt)
      const password_hash = btoa(userData.password + 'salt')
      
      const user = await usersCRUD.create({
        type: 'user',
        username: userData.username,
        password_hash,
        email: userData.email,
        phone: userData.phone,
        country_code: userData.country_code,
        role: 'teacher', // Default role
        display_name: userData.display_name,
        settings: {
          language: userData.settings?.language || 'en',
          timezone: userData.settings?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
          currency: userData.settings?.currency || 'USD'
        }
      })
        
      return user
    } catch (error) {
      console.error('Error creating user:', error)
      throw error
    }
  }
  
  // Authenticate user
  const authenticateUser = async (username: string, password: string): Promise<UserDocument | null> => {
    try {
      const user = await getUserByUsername(username)
      if (!user) {
        return null
      }
      
      // Simple password verification (in production use proper bcrypt)
      const password_hash = btoa(password + 'salt')
      if (user.password_hash === password_hash) {
        return user
      }
      
      return null
    } catch (error) {
      console.error('Error authenticating user:', error)
      return null
    }
  }
  
  // Update user settings
  const updateUserSettings = async (userId: string, settings: Partial<UserDocument['settings']>) => {
    try {
      const usersDB = await getDB()
      const usersCRUD = usePouchCRUD<UserDocument>(usersDB)
      
      const user = await usersCRUD.findById(userId)
      if (!user) {
        throw new Error('User not found')
      }
      
      const updatedUser = await usersCRUD.update(userId, {
        settings: {
          ...user.settings,
          ...settings
        }
      })
      
      return updatedUser
    } catch (error) {
      console.error('Error updating user settings:', error)
      throw error
    }
  }
  
  return {
    hasUsers,
    getUserByUsername,
    createUser,
    authenticateUser,
    updateUserSettings
  }
}