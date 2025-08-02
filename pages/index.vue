<template>
  <div class="p-6">
    <!-- Dashboard Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
        {{ $t('dashboard.title') }}
      </h1>
      <p class="text-gray-600 dark:text-gray-400 mt-2">
        Welcome back! Here's your overview for today.
      </p>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-base font-semibold text-gray-900 dark:text-white">
              {{ $t('dashboard.totalStudents') }}
            </h3>
            <UIcon name="i-heroicons-users" class="h-6 w-6 text-primary-500" />
          </div>
        </template>
        <div>
          <p class="text-3xl font-bold text-primary-600">{{ students.length }}</p>
          <p class="text-sm text-gray-500 mt-1">
            {{ registeredStudents }} {{ $t('dashboard.registeredStudents').toLowerCase() }}
          </p>
        </div>
      </UCard>

      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-base font-semibold text-gray-900 dark:text-white">
              {{ $t('dashboard.activePackages') }}
            </h3>
            <UIcon name="i-heroicons-book-open" class="h-6 w-6 text-primary-500" />
          </div>
        </template>
        <div>
          <p class="text-3xl font-bold text-primary-600">{{ packages.length }}</p>
          <p class="text-sm text-gray-500 mt-1">Available packages</p>
        </div>
      </UCard>

      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-base font-semibold text-gray-900 dark:text-white">
              {{ $t('dashboard.todayClasses') }}
            </h3>
            <UIcon name="i-heroicons-calendar-days" class="h-6 w-6 text-primary-500" />
          </div>
        </template>
        <div>
          <p class="text-3xl font-bold text-primary-600">3</p>
          <p class="text-sm text-gray-500 mt-1">Scheduled for today</p>
        </div>
      </UCard>
    </div>

    <!-- Quick Actions -->
    <UCard>
      <template #header>
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
          Quick Actions
        </h3>
      </template>
      
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <UButton 
          to="/students"
          variant="soft"
          class="h-20 flex flex-col"
          block
        >
          <UIcon name="i-heroicons-users" class="h-6 w-6 mb-2" />
          <span class="text-sm">{{ $t('common.students') }}</span>
        </UButton>
        
        <UButton 
          to="/classes"
          variant="soft" 
          class="h-20 flex flex-col"
          block
        >
          <UIcon name="i-heroicons-calendar-days" class="h-6 w-6 mb-2" />
          <span class="text-sm">{{ $t('common.classes') }}</span>
        </UButton>
        
        <UButton 
          to="/packages"
          variant="soft"
          class="h-20 flex flex-col"
          block
        >
          <UIcon name="i-heroicons-book-open" class="h-6 w-6 mb-2" />
          <span class="text-sm">{{ $t('common.packages') }}</span>
        </UButton>
        
        <UButton 
          to="/bookings"
          variant="soft"
          class="h-20 flex flex-col"
          block
        >
          <UIcon name="i-heroicons-clipboard-document-list" class="h-6 w-6 mb-2" />
          <span class="text-sm">{{ $t('common.bookings') }}</span>
        </UButton>
        
        <UButton 
          to="/transactions"
          variant="soft"
          class="h-20 flex flex-col"
          block
        >
          <UIcon name="i-heroicons-banknotes" class="h-6 w-6 mb-2" />
          <span class="text-sm">{{ $t('common.transactions') }}</span>
        </UButton>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
const { students } = useStudents()
const { packages } = usePackages()

definePageMeta({
  middleware: 'auth'
})

const registeredStudents = computed(() => 
  students.value.filter((s: any) => s.registered).length
)
</script>