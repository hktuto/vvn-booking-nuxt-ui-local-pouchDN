<template>
  <div class="flex items-center justify-between">
    <div class="flex items-center gap-3">
      <UIcon name="i-heroicons-user-circle" class="w-8 h-8 text-gray-500 dark:text-gray-400" />
      <div>
        <p class="text-sm font-medium text-gray-900 dark:text-white">
          {{ auth.user?.username || 'User' }}
        </p>
        <p class="text-xs text-gray-500 dark:text-gray-400">
          {{ t('common.teacher') }}
        </p>
      </div>
    </div>
    <UPopover>
      <UButton
        variant="ghost"
        icon="i-heroicons-ellipsis-vertical"
        size="sm"
      />
      <template #content>
        <UNavigationMenu  :items="userProfileItems" orientation="vertical" />
      </template>
    </UPopover>
  </div>
</template>

<script setup lang="ts">
const { auth } = useAuth()
const { t, locale, setLocale } = useI18n()
const { isDark, toggleDarkMode } = useDarkMode()

// Language toggle function
const toggleLanguage = () => {
  const newLocale = locale.value === 'en' ? 'zh-Hant' : 'en'
  setLocale(newLocale)
}

// User profile dropdown items
const userProfileItems = computed(() => [
  [
    {
      label: t('common.toggleColorMode'),
      icon: isDark.value ? 'i-heroicons-sun' : 'i-heroicons-moon',
      onSelect: () => toggleDarkMode()
    },
    {
      label: t('common.language'),
      icon: 'i-heroicons-language',
      onSelect: () => toggleLanguage()
    }
  ],
  [
    {
      label: t('profile.settings'),
      icon: 'i-heroicons-cog-6-tooth',
      to: '/settings'
    },
    {
      label: t('profile.profile'),
      icon: 'i-heroicons-user',
      to: '/profile'
    }
  ],
  [
    {
      label: t('auth.logout'),
      icon: 'i-heroicons-arrow-right-on-rectangle',
      onSelect: () => logout()
    }
  ]
])

const { logout } = useAuth()


</script> 