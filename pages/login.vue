<template>
  <div class="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
          {{ $t('auth.login') }}
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          {{ $t('auth.welcomeMessage') }}
        </p>
      </div>
      
      <UCard>
        <UForm :state="form" :schema="loginSchema" class="space-y-4" @submit="handleLogin">
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
            name="password"
            :label="$t('auth.password')"
            required
          >
            <UInput
              v-model="form.password"
              class="w-full"
              type="password"
              :placeholder="$t('auth.passwordPlaceholder')"
              autocomplete="current-password"
            />
          </UFormField>

          <UAlert
            v-if="error"
            color="error"
            variant="soft"
            :title="$t('auth.loginError')"
            :description="error"
            icon="i-heroicons-exclamation-triangle"
          />

          <UButton
            type="submit"
            :loading="loading"
            block
            size="lg"
          >
            {{ $t('auth.loginButton') }}
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

      <!-- Development Tools -->
      <div class="text-center mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <UButton
          @click="handleRemoveAllData"
          variant="outline"
          color="error"
          size="sm"
          icon="i-heroicons-trash"
          :loading="removingData"
        >
          {{ $t('common.removeAllData') }}
        </UButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { LoginForm } from '~/composables/useAuthValidation'
import type { FormSubmitEvent } from '@nuxt/ui'
import { clearAllData } from '~/utils/dbHelper'

// Use blank layout for login page
definePageMeta({
  layout: 'blank'
})

const { auth, login, checkFirstTimeSetup } = useAuth()
const { loginSchema } = useAuthValidation()
const { isDark, toggleDarkMode } = useDarkMode()

// Check for first time setup
const isFirstTime = await checkFirstTimeSetup()
if (isFirstTime) {
  await navigateTo('/register')
}

// Redirect if already logged in
if (auth.value.isAuthenticated) {
  await navigateTo('/')
}

const { t, locale } = useI18n()
const loading = ref(false)
const error = ref('')
const removingData = ref(false)

const form = reactive<LoginForm>({
  username: '',
  password: ''
})

const toggleLanguage = () => {
  const newLocale = locale.value === 'en' ? 'zh-Hant' : 'en'
  locale.value = newLocale
}

const handleLogin = async (event: FormSubmitEvent<LoginForm>) => {
  loading.value = true
  error.value = ''
  
  try {
    await login(event.data.username, event.data.password)
    // Redirect to dashboard (handled by composable)
  } catch (err: any) {
    error.value = err.message || t('auth.loginError')
    console.error('Login error:', err)
  } finally {
    loading.value = false
  }
}

const handleRemoveAllData = async () => {
  if (!confirm(t('common.confirmRemoveAllData'))) {
    return
  }
  
  removingData.value = true
  try {
    await clearAllData()
  } catch (err) {
    console.error('Error removing data:', err)
    error.value = t('common.removeDataError')
  } finally {
    removingData.value = false
  }
}
</script> 