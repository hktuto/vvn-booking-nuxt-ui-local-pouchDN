<template>
  <UDropdown :items="userProfileItems" :popper="{ placement: placement }">
    <UButton
      variant="ghost"
      class="flex items-center gap-2"
    >
      <UIcon name="i-heroicons-user-circle" class="w-5 h-5" />
      <span v-if="showUsername" class="hidden sm:block text-sm font-medium text-gray-900 dark:text-white">
        {{ auth.user?.username || 'User' }}
      </span>
      <UPopover>
        <UIcon name="i-heroicons-chevron-down" class="w-4 h-4" />
        <template #content>
          <UNavigationMenu  :items="userProfileItems" orientation="vertical" />
        </template>
      </UPopover>
      
      
    </UButton>
  </UDropdown>
</template>

<script setup lang="ts">
interface Props {
  placement?: 'bottom-end' | 'top-end' | 'bottom-start' | 'top-start'
  showUsername?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  placement: 'bottom-end',
  showUsername: true
})

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