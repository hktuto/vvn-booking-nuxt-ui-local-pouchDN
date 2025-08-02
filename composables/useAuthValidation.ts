import { z } from 'zod'

// Login form validation schema
export const loginSchema = z.object({
  username: z.string()
    .min(1, 'validation.username.required')
    .min(3, 'validation.username.minLength')
    .max(50, 'validation.username.maxLength'),
  password: z.string()
    .min(1, 'validation.password.required')
    .min(6, 'validation.password.minLength')
})

// Registration form validation schema
export const registerSchema = z.object({
  display_name: z.string()
    .min(1, 'validation.displayName.required')
    .max(100, 'validation.displayName.maxLength'),
  username: z.string()
    .min(3, 'validation.username.minLength')
    .max(50, 'validation.username.maxLength')
    .regex(/^[a-zA-Z0-9_]+$/, 'validation.username.format'),
  email: z.string()
    .email('validation.email.invalid')
    .optional()
    .or(z.literal(''))
    .transform(val => val || ''),
  country_code: z.string()
    .min(1, 'validation.countryCode.required'),
  phone: z.string()
    .min(1, 'validation.phone.required')
    .regex(/^[0-9+\-\s()]+$/, 'validation.phone.invalid'),
  password: z.string()
    .min(6, 'validation.password.minLength')
    .max(128, 'validation.password.maxLength'),
  confirmPassword: z.string()
    .min(1, 'validation.password.confirm'),
  language: z.enum(['en', 'zh-Hant'], {
    errorMap: () => ({ message: 'validation.language.invalid' })
  })
}).refine((data) => data.password === data.confirmPassword, {
  message: 'validation.password.mismatch',
  path: ["confirmPassword"]
})

// Type exports
export type LoginForm = z.infer<typeof loginSchema>
export type RegisterForm = z.infer<typeof registerSchema>

// Composable function
export const useAuthValidation = () => {
  const { t } = useI18n()

  // Create schemas with translated messages
  const translatedLoginSchema = z.object({
    username: z.string()
      .min(1, t('validation.username.required'))
      .min(3, t('validation.username.minLength'))
      .max(50, t('validation.username.maxLength')),
    password: z.string()
      .min(1, t('validation.password.required'))
      .min(6, t('validation.password.minLength'))
  })

  const translatedRegisterSchema = z.object({
    display_name: z.string()
      .min(1, t('validation.displayName.required'))
      .max(100, t('validation.displayName.maxLength')),
    username: z.string()
      .min(3, t('validation.username.minLength'))
      .max(50, t('validation.username.maxLength'))
      .regex(/^[a-zA-Z0-9_]+$/, t('validation.username.format')),
    email: z.string()
      .email(t('validation.email.invalid'))
      .optional()
      .or(z.literal(''))
      .transform(val => val || ''),
    country_code: z.string()
      .min(1, t('validation.countryCode.required')),
    phone: z.string()
      .min(1, t('validation.phone.required'))
      .regex(/^[0-9+\-\s()]+$/, t('validation.phone.invalid')),
    password: z.string()
      .min(6, t('validation.password.minLength'))
      .max(128, t('validation.password.maxLength')),
    confirmPassword: z.string()
      .min(1, t('validation.password.confirm')),
    language: z.enum(['en', 'zh-Hant'], {
      errorMap: () => ({ message: t('validation.language.invalid') })
    })
  }).refine((data) => data.password === data.confirmPassword, {
    message: t('validation.password.mismatch'),
    path: ["confirmPassword"]
  })

  return {
    loginSchema: translatedLoginSchema,
    registerSchema: translatedRegisterSchema
  }
} 