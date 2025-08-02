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
  display_name: z.string()
    .min(1, 'Display name is required')
    .max(100, 'Display name must be less than 100 characters'),
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username must be less than 50 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  email: z.string()
    .email('Please enter a valid email address')
    .optional()
    .or(z.literal(''))
    .transform(val => val || ''),
  country_code: z.string()
    .min(1, 'Country code is required'),
  phone: z.string()
    .min(1, 'Phone number is required')
    .regex(/^[0-9+\-\s()]+$/, 'Please enter a valid phone number'),
  password: z.string()
    .min(6, 'Password must be at least 6 characters')
    .max(128, 'Password must be less than 128 characters'),
  confirmPassword: z.string()
    .min(1, 'Please confirm your password'),
  language: z.enum(['en', 'zh-Hant'], {
    errorMap: () => ({ message: 'Please select a valid language' })
  })
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