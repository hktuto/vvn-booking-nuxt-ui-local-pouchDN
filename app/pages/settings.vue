<template>
  <NuxtLayout>
    <template #header>
      <div class="flex items-center justify-between w-full">
        <div>
          <h1 class="text-xl font-semibold text-gray-900 dark:text-white">
            {{ $t('settings.title') }}
          </h1>
          <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {{ $t('settings.description') }}
          </p>
        </div>
      </div>
    </template>

    <UiPageContainer>
      <div class="max-w-2xl mx-auto space-y-6">
        <!-- Profile Information -->
        <UCard>
          <template #header>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              {{ $t('settings.profile.title') }}
            </h3>
            <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {{ $t('settings.profile.description') }}
            </p>
          </template>
          
          <form @submit.prevent="updateProfile" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <UFormGroup :label="$t('auth.displayName')" required>
                <UInput
                  v-model="profileForm.display_name"
                  :placeholder="$t('auth.displayNamePlaceholder')"
                  required
                />
              </UFormGroup>
              
              <UFormGroup :label="$t('auth.username')" required>
                <UInput
                  v-model="profileForm.username"
                  :placeholder="$t('auth.usernamePlaceholder')"
                  required
                  disabled
                />
                <template #help>
                  {{ $t('settings.profile.usernameHelp') }}
                </template>
              </UFormGroup>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <UFormGroup :label="$t('auth.email')">
                <UInput
                  v-model="profileForm.email"
                  type="email"
                  :placeholder="$t('auth.emailPlaceholder')"
                />
              </UFormGroup>
              
              <UFormGroup :label="$t('auth.phone')" required>
                <div class="flex gap-2">
                  <USelect
                    v-model="profileForm.country_code"
                    :options="countryCodes"
                    option-attribute="label"
                    value-attribute="value"
                    class="w-24"
                    required
                  />
                  <UInput
                    v-model="profileForm.phone"
                    :placeholder="$t('auth.phonePlaceholder')"
                    required
                  />
                </div>
              </UFormGroup>
            </div>
            
            <div class="flex justify-end">
              <UButton
                type="submit"
                :loading="profileLoading"
                :disabled="profileLoading"
              >
                {{ $t('common.save') }}
              </UButton>
            </div>
          </form>
        </UCard>

        <!-- Preferences -->
        <UCard>
          <template #header>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              {{ $t('settings.preferences.title') }}
            </h3>
            <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {{ $t('settings.preferences.description') }}
            </p>
          </template>
          
          <div class="space-y-6">
            <!-- Language Setting -->
            <div class="flex items-center justify-between">
              <div>
                <h4 class="text-base font-medium text-gray-900 dark:text-white">
                  {{ $t('common.language') }}
                </h4>
                <p class="text-sm text-gray-600 dark:text-gray-400">
                  {{ $t('settings.preferences.languageHelp') }}
                </p>
              </div>
              <USelect
                v-model="preferencesForm.language"
                :options="languageOptions"
                option-attribute="label"
                value-attribute="value"
                class="w-32"
                @update:model-value="updateLanguage"
              />
            </div>
            
            <!-- Dark Mode Setting -->
            <div class="flex items-center justify-between">
              <div>
                <h4 class="text-base font-medium text-gray-900 dark:text-white">
                  {{ $t('settings.preferences.theme') }}
                </h4>
                <p class="text-sm text-gray-600 dark:text-gray-400">
                  {{ $t('settings.preferences.themeHelp') }}
                </p>
              </div>
              <USelect
                v-model="preferencesForm.theme"
                :options="themeOptions"
                option-attribute="label"
                value-attribute="value"
                class="w-32"
                @update:model-value="updateTheme"
              />
            </div>
            
            <!-- Timezone Setting -->
            <div class="flex items-center justify-between">
              <div>
                <h4 class="text-base font-medium text-gray-900 dark:text-white">
                  {{ $t('settings.preferences.timezone') }}
                </h4>
                <p class="text-sm text-gray-600 dark:text-gray-400">
                  {{ $t('settings.preferences.timezoneHelp') }}
                </p>
              </div>
              <USelect
                v-model="preferencesForm.timezone"
                :options="timezoneOptions"
                option-attribute="label"
                value-attribute="value"
                class="w-48"
                @update:model-value="updateTimezone"
              />
            </div>
            
            <!-- Currency Setting -->
            <div class="flex items-center justify-between">
              <div>
                <h4 class="text-base font-medium text-gray-900 dark:text-white">
                  {{ $t('settings.preferences.currency') }}
                </h4>
                <p class="text-sm text-gray-600 dark:text-gray-400">
                  {{ $t('settings.preferences.currencyHelp') }}
                </p>
              </div>
              <USelect
                v-model="preferencesForm.currency"
                :options="currencyOptions"
                option-attribute="label"
                value-attribute="value"
                class="w-32"
                @update:model-value="updateCurrency"
              />
            </div>
          </div>
        </UCard>

        <!-- Account Actions -->
        <UCard>
          <template #header>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              {{ $t('settings.account.title') }}
            </h3>
            <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {{ $t('settings.account.description') }}
            </p>
          </template>
          
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <div>
                <h4 class="text-base font-medium text-gray-900 dark:text-white">
                  {{ $t('settings.account.changePassword') }}
                </h4>
                <p class="text-sm text-gray-600 dark:text-gray-400">
                  {{ $t('settings.account.changePasswordHelp') }}
                </p>
              </div>
              <UButton
                variant="outline"
                @click="showChangePasswordModal = true"
              >
                {{ $t('settings.account.changePassword') }}
              </UButton>
            </div>
            
            <div class="flex items-center justify-between">
              <div>
                <h4 class="text-base font-medium text-gray-900 dark:text-white">
                  {{ $t('settings.account.exportData') }}
                </h4>
                <p class="text-sm text-gray-600 dark:text-gray-400">
                  {{ $t('settings.account.exportDataHelp') }}
                </p>
              </div>
              <UButton
                variant="outline"
                @click="exportUserData"
                :loading="exportLoading"
              >
                {{ $t('settings.account.exportData') }}
              </UButton>
            </div>
          </div>
        </UCard>
      </div>
    </UiPageContainer>

    <!-- Change Password Modal -->
    <UModal v-model="showChangePasswordModal">
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            {{ $t('settings.account.changePassword') }}
          </h3>
        </template>
        
        <form @submit.prevent="changePassword" class="space-y-4">
          <UFormGroup :label="$t('settings.account.currentPassword')" required>
            <UInput
              v-model="passwordForm.currentPassword"
              type="password"
              :placeholder="$t('settings.account.currentPasswordPlaceholder')"
              required
            />
          </UFormGroup>
          
          <UFormGroup :label="$t('settings.account.newPassword')" required>
            <UInput
              v-model="passwordForm.newPassword"
              type="password"
              :placeholder="$t('settings.account.newPasswordPlaceholder')"
              required
            />
          </UFormGroup>
          
          <UFormGroup :label="$t('auth.confirmPassword')" required>
            <UInput
              v-model="passwordForm.confirmPassword"
              type="password"
              :placeholder="$t('auth.confirmPasswordPlaceholder')"
              required
            />
          </UFormGroup>
          
          <div class="flex justify-end gap-2">
            <UButton
              variant="outline"
              @click="showChangePasswordModal = false"
            >
              {{ $t('common.cancel') }}
            </UButton>
            <UButton
              type="submit"
              :loading="passwordLoading"
              :disabled="passwordLoading"
            >
              {{ $t('settings.account.changePassword') }}
            </UButton>
          </div>
        </form>
      </UCard>
    </UModal>
  </NuxtLayout>
</template>

<script setup lang="ts">
const { auth } = useAuth()
const { updateUserSettings } = useUsers()
const { locale, setLocale } = useI18n()
const { isDark, setDarkMode } = useDarkMode()

// Form states
const profileLoading = ref(false)
const passwordLoading = ref(false)
const exportLoading = ref(false)
const showChangePasswordModal = ref(false)

// Profile form
const profileForm = ref({
  username: auth.value.user?.username || '',
  display_name: auth.value.user?.display_name || '',
  email: auth.value.user?.email || '',
  phone: auth.value.user?.phone || '',
  country_code: auth.value.user?.country_code || '+852'
})

// Preferences form
const preferencesForm = ref({
  language: auth.value.user?.settings?.language || 'en',
  theme: isDark.value ? 'dark' : 'light',
  timezone: auth.value.user?.settings?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
  currency: auth.value.user?.settings?.currency || 'HKD'
})

// Password form
const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// Options
const countryCodes = [
  { label: '+852', value: '+852' },
  { label: '+86', value: '+86' },
  { label: '+1', value: '+1' },
  { label: '+44', value: '+44' },
  { label: '+81', value: '+81' },
  { label: '+65', value: '+65' }
]

const languageOptions = [
  { label: 'English', value: 'en' },
  { label: '繁體中文', value: 'zh-Hant' }
]

const themeOptions = [
  { label: 'Light', value: 'light' },
  { label: 'Dark', value: 'dark' }
]

const timezoneOptions = [
  { label: 'Hong Kong (UTC+8)', value: 'Asia/Hong_Kong' },
  { label: 'Beijing (UTC+8)', value: 'Asia/Shanghai' },
  { label: 'Tokyo (UTC+9)', value: 'Asia/Tokyo' },
  { label: 'Singapore (UTC+8)', value: 'Asia/Singapore' },
  { label: 'New York (UTC-5)', value: 'America/New_York' },
  { label: 'London (UTC+0)', value: 'Europe/London' }
]

const currencyOptions = [
  { label: 'HKD', value: 'HKD' },
  { label: 'USD', value: 'USD' },
  { label: 'CNY', value: 'CNY' },
  { label: 'EUR', value: 'EUR' },
  { label: 'JPY', value: 'JPY' }
]

// Methods
const updateProfile = async () => {
  try {
    profileLoading.value = true
    
    await updateUserSettings(auth.value.user?.id, {
      display_name: profileForm.value.display_name,
      email: profileForm.value.email,
      phone: profileForm.value.phone,
      country_code: profileForm.value.country_code
    })
    
    // Update local auth state
    auth.value.user = {
      ...auth.value.user,
      display_name: profileForm.value.display_name,
      email: profileForm.value.email,
      phone: profileForm.value.phone,
      country_code: profileForm.value.country_code
    }
    
    // Update localStorage
    localStorage.setItem('auth_user', JSON.stringify(auth.value.user))
    
    useToast().add({
      title: 'Success',
      description: 'Profile updated successfully',
      color: 'green'
    })
  } catch (error) {
    console.error('Error updating profile:', error)
    useToast().add({
      title: 'Error',
      description: 'Failed to update profile',
      color: 'red'
    })
  } finally {
    profileLoading.value = false
  }
}

const updateLanguage = async (language: string) => {
  try {
    await updateUserSettings(auth.value.user?.id, { language })
    setLocale(language)
    
    // Update local auth state
    if (auth.value.user?.settings) {
      auth.value.user.settings.language = language
      localStorage.setItem('auth_user', JSON.stringify(auth.value.user))
    }
    
    useToast().add({
      title: 'Success',
      description: 'Language updated successfully',
      color: 'green'
    })
  } catch (error) {
    console.error('Error updating language:', error)
    useToast().add({
      title: 'Error',
      description: 'Failed to update language',
      color: 'red'
    })
  }
}

const updateTheme = async (theme: string) => {
  try {
    setDarkMode(theme === 'dark')
    await updateUserSettings(auth.value.user?.id, { theme })
    
    // Update local auth state
    if (auth.value.user?.settings) {
      auth.value.user.settings.theme = theme
      localStorage.setItem('auth_user', JSON.stringify(auth.value.user))
    }
    
    useToast().add({
      title: 'Success',
      description: 'Theme updated successfully',
      color: 'green'
    })
  } catch (error) {
    console.error('Error updating theme:', error)
    useToast().add({
      title: 'Error',
      description: 'Failed to update theme',
      color: 'red'
    })
  }
}

const updateTimezone = async (timezone: string) => {
  try {
    await updateUserSettings(auth.value.user?.id, { timezone })
    
    // Update local auth state
    if (auth.value.user?.settings) {
      auth.value.user.settings.timezone = timezone
      localStorage.setItem('auth_user', JSON.stringify(auth.value.user))
    }
    
    useToast().add({
      title: 'Success',
      description: 'Timezone updated successfully',
      color: 'green'
    })
  } catch (error) {
    console.error('Error updating timezone:', error)
    useToast().add({
      title: 'Error',
      description: 'Failed to update timezone',
      color: 'red'
    })
  }
}

const updateCurrency = async (currency: string) => {
  try {
    await updateUserSettings(auth.value.user?.id, { currency })
    
    // Update local auth state
    if (auth.value.user?.settings) {
      auth.value.user.settings.currency = currency
      localStorage.setItem('auth_user', JSON.stringify(auth.value.user))
    }
    
    useToast().add({
      title: 'Success',
      description: 'Currency updated successfully',
      color: 'green'
    })
  } catch (error) {
    console.error('Error updating currency:', error)
    useToast().add({
      title: 'Error',
      description: 'Failed to update currency',
      color: 'red'
    })
  }
}

const changePassword = async () => {
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    useToast().add({
      title: 'Error',
      description: 'New passwords do not match',
      color: 'red'
    })
    return
  }
  
  if (passwordForm.value.newPassword.length < 6) {
    useToast().add({
      title: 'Error',
      description: 'Password must be at least 6 characters',
      color: 'red'
    })
    return
  }
  
  try {
    passwordLoading.value = true
    
    // TODO: Implement password change logic
    // For now, just show success message
    useToast().add({
      title: 'Success',
      description: 'Password changed successfully',
      color: 'green'
    })
    
    showChangePasswordModal.value = false
    passwordForm.value = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  } catch (error) {
    console.error('Error changing password:', error)
    useToast().add({
      title: 'Error',
      description: 'Failed to change password',
      color: 'red'
    })
  } finally {
    passwordLoading.value = false
  }
}

const exportUserData = async () => {
  try {
    exportLoading.value = true
    
    // TODO: Implement data export logic
    // For now, just show success message
    useToast().add({
      title: 'Success',
      description: 'Data export started. You will receive an email when ready.',
      color: 'green'
    })
  } catch (error) {
    console.error('Error exporting data:', error)
    useToast().add({
      title: 'Error',
      description: 'Failed to export data',
      color: 'red'
    })
  } finally {
    exportLoading.value = false
  }
}

// Initialize form with current user data
onMounted(() => {
  if (auth.value.user) {
    profileForm.value = {
      username: auth.value.user.username || '',
      display_name: auth.value.user.display_name || '',
      email: auth.value.user.email || '',
      phone: auth.value.user.phone || '',
      country_code: auth.value.user.country_code || '+852'
    }
    
    preferencesForm.value = {
      language: auth.value.user.settings?.language || 'en',
      theme: isDark.value ? 'dark' : 'light',
      timezone: auth.value.user.settings?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
      currency: auth.value.user.settings?.currency || 'HKD'
    }
  }
})

definePageMeta({
  middleware: 'auth'
})
</script> 