import { z } from 'zod'

// Login form validation schema
export const loginSchema = z.object({
  username: z.string()
    .min(1, 'Username is required')
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username must be less than 50 characters'),
  password: z.string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters')
})

// Registration form validation schema
export const registerSchema = z.object({
  display_name: z.string().min(1, 'Display name is required'),
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username must be less than 50 characters'),
  email: z.string().email('Invalid email format').optional().or(z.literal('')),
  country_code: z.string().min(1, 'Country code is required'),
  phone: z.string().min(1, 'Phone number is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
  language: z.enum(['en', 'zh-Hant'])
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
})

// Type exports
export type LoginForm = z.infer<typeof loginSchema>
export type RegisterForm = z.infer<typeof registerSchema>

// Composable function
export const useAuthValidation = () => {
  return {
    loginSchema,
    registerSchema
  }
} 