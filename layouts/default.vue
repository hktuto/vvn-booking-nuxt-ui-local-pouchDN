<template>
  <!-- 
    Default Layout with Header Slot
    
    Pages can now use the header slot to provide custom header content:
    
    <template #header>
      <div class="flex items-center justify-between w-full">
        <div>
          <h1 class="text-xl font-semibold text-gray-900 dark:text-white">Page Title</h1>
          <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">Page description</p>
        </div>
        <UButton icon="i-heroicons-plus" size="sm">Action</UButton>
      </div>
    </template>
  -->
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Mobile Navigation Header -->
    <div class="lg:hidden">
      <div class="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <UButton 
          @click="sidebarOpen = !sidebarOpen"
          variant="ghost"
          icon="i-heroicons-bars-3"
          size="sm"
        />
        <!-- Mobile header slot or fallback -->
        <div v-if="$slots.header" class="flex-1 px-2">
          <slot name="header" />
        </div>
        <h1 v-else class="text-lg font-semibold text-gray-900 dark:text-white">
          {{ t('app.title') }}
        </h1>
        
        <div class="flex items-center gap-2">
          <UButton 
            @click="toggleLanguage"
            variant="ghost"
            icon="i-heroicons-language"
            size="sm"
          />
          <UButton 
            @click="toggleDarkMode"
            variant="ghost"
            :icon="isDark ? 'i-heroicons-sun' : 'i-heroicons-moon'"
            size="sm"
          />
        </div>
      </div>
    </div>

    <!-- Mobile Slideover -->
    <USlideover v-model:open="sidebarOpen" side="left">
      <template #content>
        <div class="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <h1 class="text-xl font-semibold text-gray-900 dark:text-white">
            {{ t('app.title') }}
          </h1>
          <div class="flex items-center gap-2">
            <UButton 
              @click="sidebarOpen = !sidebarOpen"
              variant="ghost"
              icon="i-heroicons-x-mark"
              size="sm"
            />
            
          </div>
        </div>
        <div class="p-4 w-full">
          <UNavigationMenu 
            :items="navigationLinks"
            orientation="vertical"
            class="w-full"
            @click="sidebarOpen = false"
          />
        </div>
        
        <!-- Mobile User Profile Section -->
        <div class="mt-auto p-4 border-t border-gray-200 dark:border-gray-700">
          <UserProfileMobile />
        </div>
      </template>
    </USlideover>

    <div class="flex h-svh">
      <!-- Sidebar -->
      

      <!-- Desktop Sidebar -->
      <div class="hidden lg:flex lg:w-64 lg:flex-col">
        <div class="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
          <div class="flex items-center justify-between px-4 mb-8">
            <h1 class="text-xl font-semibold text-gray-900 dark:text-white">
              {{ t('app.title') }}
            </h1>
            <div class="flex items-center gap-2">
              <UButton 
                @click="toggleLanguage"
                variant="ghost"
                icon="i-heroicons-language"
                size="sm"
              />
              <UButton 
                @click="toggleDarkMode"
                variant="ghost"
                :icon="isDark ? 'i-heroicons-sun' : 'i-heroicons-moon'"
                size="sm"
              />
            </div>
          </div>
          <nav class="px-4">
            <UNavigationMenu 
            :items="navigationLinks"
              orientation="vertical" />
          </nav>
        </div>
      </div>

      <!-- Main Content -->
      <div class="flex-1 lg:pl-0">
        <!-- Desktop Top Header -->
        <div class="hidden lg:flex items-center justify-between p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div class="flex items-center gap-4">
            <!-- Default page title (fallback) -->
            <h2 v-if="!$slots.header" class="text-lg font-medium text-gray-900 dark:text-white">
              {{ getCurrentPageTitle() }}
            </h2>
            <!-- Custom header slot -->
            <slot name="header" />
          </div>
          
          <!-- User Profile Dropdown -->
          <UserProfile />
        </div>
        
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">

const sidebarOpen = ref(false)
const { locale, setLocale, t } = useI18n()
const { isDark, toggleDarkMode } = useDarkMode()
const route = useRoute()

const navigation = [
  { to: '/', label: 'navigation.dashboard', icon: 'i-heroicons-home' },
  { to: '/students', label: 'navigation.students', icon: 'i-heroicons-users' },
  { to: '/classes', label: 'navigation.classes', icon: 'i-heroicons-calendar-days' },
  { to: '/packages', label: 'navigation.packages', icon: 'i-heroicons-book-open' },
  { to: '/bookings', label: 'navigation.bookings', icon: 'i-heroicons-clipboard-document-list' },
  { to: '/transactions', label: 'navigation.transactions', icon: 'i-heroicons-banknotes' }
]

// Format navigation for UNavigationMenu
const navigationLinks = computed(() => 
  navigation.map(item => ({
    label: t(item.label),
    to: item.to,
    icon: item.icon
  }))
)

// Get current page title
const getCurrentPageTitle = () => {
  const currentRoute = route.path
  const navItem = navigation.find(item => item.to === currentRoute)
  return navItem ? t(navItem.label) : t('navigation.dashboard')
}

const toggleLanguage = () => {
  const newLocale = locale.value === 'en' ? 'zh-Hant' : 'en'
  setLocale(newLocale)
}
</script>