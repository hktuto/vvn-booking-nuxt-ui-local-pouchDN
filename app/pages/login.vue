<template>
  <div class="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
          {{ $t('auth.login') }}
        </h2>
      </div>
      
      <UCard>
        <UAlert
          v-if="showRegistrationSuccess"
          color="success"
          variant="soft"
          :title="$t('auth.registrationSuccess')"
          :description="$t('auth.registrationSuccessDescription')"
          icon="i-heroicons-check-circle"
          class="mb-4"
        />

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
      <div class="text-center mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
        <UButton
          @click="handleGenerateFirstInviteCode"
          variant="outline"
          color="primary"
          size="sm"
          icon="i-heroicons-ticket"
          :loading="generatingInviteCode"
        >
          Generate First Invite Code
        </UButton>
        <div class="block">
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
  </div>
</template>

<script setup lang="ts">
import type { LoginForm } from '~/composables/useAuthValidation'
import type { FormSubmitEvent } from '@nuxt/ui'
import { cleanupOldDatabases } from '~/utils/cleanupOldDatabases'

// Use blank layout for login page and mark as public
definePageMeta({
  layout: 'blank',
  auth: false
})

const { auth, login } = useAuth()
const { loginSchema } = useAuthValidation()
const { isDark, toggleDarkMode } = useDarkMode()


// Redirect if already logged in
if (auth.value.isAuthenticated) {
  await navigateTo('/')
}

const { t, locale } = useI18n()
const route = useRoute()
const loading = ref(false)
const error = ref('')
const removingData = ref(false)
const generatingInviteCode = ref(false)

// Check if user just registered successfully
const showRegistrationSuccess = computed(() => route.query.registered === 'true')

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

const handleGenerateFirstInviteCode = async () => {
  generatingInviteCode.value = true
  try {
    const response = await fetch('/api/auth/invite-codes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        count: 1,
        created_by: 'admin'
      })
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json()
    alert(`✅ First invite code generated: ${result.inviteCodes[0].code}`)
  } catch (err: any) {
    console.error('Error generating invite code:', err)
    alert(`❌ Error: ${err.message}`)
  } finally {
    generatingInviteCode.value = false
  }
}

const handleRemoveAllData = async () => {
  if (!confirm(t('common.confirmRemoveAllData'))) {
    return
  }
  
  removingData.value = true
  try {
    await cleanupOldDatabases()
  } catch (err) {
    console.error('Error removing data:', err)
    error.value = t('common.removeDataError')
  } finally {
    removingData.value = false
  }
}
</script> 