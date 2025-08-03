<template>
  <NuxtLayout name="default">
    <template #header>
      <div class="flex items-center justify-between w-full">
        <div>
          <h1 class="text-xl font-semibold text-gray-900 dark:text-white">{{ t('class.classes') }}</h1>
          <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">{{ t('class.manageClasses') }}</p>
        </div>
      </div>
    </template>

    <div class="px-6 py-2">
      <!-- Tabs -->
      <UTabs v-model="activeTab" :items="tabItems" @update:model-value="handleTabChange" />

      <!-- Tab Content -->
      <div class="mt-2">
        <ClassTabContent v-if="activeTab === 'classes'" />
        <LocationTabContent v-else-if="activeTab === 'locations'" />
        <BookingTabContent v-else-if="activeTab === 'bookings'" />
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const { t } = useI18n()
const route = useRoute()
const router = useRouter()

// Tab management with URL query support
const activeTab = ref(route.query.tab as string || 'classes')

// Tab items configuration
const tabItems = [
  {
    value: 'classes',
    label: t('class.classes'),
    icon: 'i-heroicons-academic-cap',
  },
  {
    value: 'locations',
    label: t('location.locations'),
    icon: 'i-heroicons-map-pin',
  },
  {
    value: 'bookings',
    label: t('booking.bookings'),
    icon: 'i-heroicons-calendar-days'
  }
]

// Handle tab changes and update URL
const handleTabChange = (tab: string | number) => {
  activeTab.value = tab as string
  router.push({
    query: { ...route.query, tab: tab as string }
  })
}

// Watch for URL changes to sync tab state
watch(() => route.query.tab, (newTab) => {
  if (newTab && typeof newTab === 'string') {
    activeTab.value = newTab
  }
})
</script> 