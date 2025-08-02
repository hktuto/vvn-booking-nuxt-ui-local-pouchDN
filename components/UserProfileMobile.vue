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
const { t } = useI18n()

// User profile dropdown items
const userProfileItems = computed(() => [
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