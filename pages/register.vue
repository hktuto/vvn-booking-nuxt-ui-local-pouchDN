<template>
  <div class="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
          {{ $t('auth.setupAccount') }}
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          {{ $t('auth.firstTimeSetup') }}
        </p>
      </div>
      
      <UCard>
        <UForm :state="form" :schema="registerSchema" class="space-y-4" @submit="handleRegister">
          <UFormField
            name="display_name"
            :label="$t('auth.displayName')"
            required
          >
            <UInput
              v-model="form.display_name"
              class="w-full"
              :placeholder="$t('auth.displayNamePlaceholder')"
              autocomplete="name"
            />
          </UFormField>

          <UFormField
            name="username"
            :label="$t('auth.username')"
            required
          >
            <UInput
              v-model="form.username"
              class="w-full"
              :placeholder="$t('auth.usernamePlaceholder')"
              autocomplete="username"
            />
          </UFormField>

          <UFormField
            name="email"
            :label="$t('auth.email')"
          >
            <UInput
              v-model="form.email"
              type="email"
              class="w-full"
              :placeholder="$t('auth.emailPlaceholder')"
              autocomplete="email"
            />
          </UFormField>

          <UFormField
            name="phone"
            :label="$t('auth.phone')"
            required
          >
            <div class="flex gap-2">
              <USelect
                v-model="form.country_code"
                class="w-32"
                :items="countryCodeOptions"
                :placeholder="$t('auth.countryCodePlaceholder')"
              />
              <UInput
                v-model="form.phone"
                type="tel"
                class="flex-1"
                :placeholder="$t('auth.phonePlaceholder')"
                autocomplete="tel"
              />
            </div>
          </UFormField>

          <UFormField
            name="password"
            :label="$t('auth.password')"
            required
          >
            <UInput
              v-model="form.password"
              type="password"
              class="w-full"
              :placeholder="$t('auth.passwordPlaceholder')"
              autocomplete="new-password"
            />
          </UFormField>

          <UFormField
            name="confirmPassword"
            :label="$t('auth.confirmPassword')"
            required
          >
            <UInput
              v-model="form.confirmPassword"
              type="password"
              class="w-full"
              :placeholder="$t('auth.confirmPasswordPlaceholder')"
              autocomplete="new-password"
            />
          </UFormField>

          <UFormField
            name="language"
            :label="$t('auth.preferredLanguage')"
            required
          >
            <USelect
              v-model="form.language"
              class="w-full"
              :items="languageOptions"
            />
          </UFormField>

          <UAlert
            v-if="error"
            color="error"
            variant="soft"
            :title="$t('auth.registrationError')"
            :description="error"
            icon="i-heroicons-exclamation-triangle"
          />

          <UButton
            type="submit"
            :loading="loading"
            block
            size="lg"
          >
            {{ $t('auth.createAccount') }}
          </UButton>
        </UForm>
      </UCard>

      <!-- Language and Dark Mode Toggles -->
      <div class="text-center space-x-4">
        <UButton
          @click="toggleLanguage"
          variant="ghost"
          size="sm"
          icon="i-heroicons-language"
        >
          {{ $t('common.language') }}
        </UButton>
        <UButton
          @click="toggleDarkMode"
          variant="ghost"
          size="sm"
          :icon="isDark ? 'i-heroicons-sun' : 'i-heroicons-moon'"
        >
          {{ isDark ? $t('common.lightMode') : $t('common.darkMode') }}
        </UButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { RegisterForm } from '~/composables/useAuthValidation'
import type { FormSubmitEvent } from '@nuxt/ui'

// Use blank layout for register page
definePageMeta({
  layout: 'blank'
})

const { createUser } = useUsers()
const { isDark, toggleDarkMode } = useDarkMode()
const { registerSchema } = useAuthValidation()

const { t, locale, setLocale } = useI18n()
const loading = ref(false)
const error = ref('')

const form = reactive<RegisterForm>({
  display_name: '',
  username: '',
  email: '',
  country_code: '+852', // Default to Hong Kong
  phone: '',
  password: '',
  confirmPassword: '',
  language: locale.value
})

const countryCodeOptions = [
  { label: '🇭🇰 +852', value: '+852' },
  { label: '🇨🇳 +86', value: '+86' },
  { label: '🇹🇼 +886', value: '+886' },
  { label: '🇺🇸 +1', value: '+1' },
  { label: '🇬🇧 +44', value: '+44' },
  { label: '🇯🇵 +81', value: '+81' },
  { label: '🇰🇷 +82', value: '+82' },
  { label: '🇸🇬 +65', value: '+65' },
  { label: '🇲🇾 +60', value: '+60' },
  { label: '🇹🇭 +66', value: '+66' },
  { label: '🇦🇺 +61', value: '+61' },
  { label: '🇨🇦 +1', value: '+1' }
]

const languageOptions = [
  { label: 'English', value: 'en' },
  { label: '繁體中文', value: 'zh-Hant' }
]

const toggleLanguage = () => {
  const newLocale = locale.value === 'en' ? 'zh-Hant' : 'en'
  setLocale(newLocale)
  form.language = newLocale
}

const handleRegister = async (event: FormSubmitEvent<RegisterForm>) => {
  loading.value = true
  error.value = ''
  
  try {
    // Create user
    await createUser({
      username: event.data.username,
      password: event.data.password,
      email: event.data.email || undefined,
      phone: event.data.phone,
      country_code: event.data.country_code,
      display_name: event.data.display_name,
      settings: {
        language: event.data.language,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        currency: 'USD'
      }
    })
    
    // Set language preference
    setLocale(event.data.language)
    
    // Navigate to login page with success message
    await navigateTo('/login?registered=true')
    
  } catch (err: any) {
    error.value = err.message || t('auth.registrationError')
    console.error('Registration error:', err)
  } finally {
    loading.value = false
  }
}
</script>