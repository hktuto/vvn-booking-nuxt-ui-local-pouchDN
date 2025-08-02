<template>
  <NuxtLayout name="default">
    <template #header>
      <div class="flex items-center justify-between w-full">
        <div>
          <h1 class="text-xl font-semibold text-gray-900 dark:text-white">
            {{ $t('classes.title') }}
          </h1>
          <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {{ $t('classes.description') }}
          </p>
        </div>
        <div class="flex gap-2">
          <UButton
            @click="showClassTypeModal = true"
            variant="soft"
            icon="i-heroicons-plus"
            size="sm"
          >
            {{ $t('classes.addClassType') }}
          </UButton>
          <UButton
            @click="showScheduleModal = true"
            icon="i-heroicons-plus"
            size="sm"
          >
            {{ $t('classes.addSchedule') }}
          </UButton>
        </div>
      </div>
    </template>

    <div class="p-6">

    <!-- Tabs -->
    <UTabs :items="tabs" class="mb-6">
      <template #item="{ item }">
        <div class="flex items-center gap-2">
          <UIcon :name="item.icon" class="h-5 w-5" />
          {{ item.label }}
        </div>
      </template>
    </UTabs>

    <!-- Schedules Tab -->
    <div v-if="activeTab === 'schedules'">
      <div class="grid gap-6">
        <UCard v-for="schedule in schedules" :key="schedule.id">
          <template #header>
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                  {{ schedule.classType?.name }}
                </h3>
                <p class="text-sm text-gray-500">
                  {{ schedule.location?.name }}
                </p>
              </div>
              <UBadge :color="schedule.active ? 'green' : 'gray'">
                {{ schedule.active ? $t('common.active') : $t('common.inactive') }}
              </UBadge>
            </div>
          </template>
          
          <div class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <p class="text-sm font-medium text-gray-500">{{ $t('classes.schedule') }}</p>
                <p class="text-sm text-gray-900 dark:text-white">
                  {{ formatScheduleDays(schedule.weekly_days) }}
                </p>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-500">{{ $t('classes.time') }}</p>
                <p class="text-sm text-gray-900 dark:text-white">
                  {{ formatTime(schedule.start_time) }} - {{ formatTime(schedule.end_time) }}
                </p>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-500">{{ $t('classes.capacity') }}</p>
                <p class="text-sm text-gray-900 dark:text-white">
                  {{ schedule.max_capacity }} {{ $t('classes.students') }}
                </p>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-500">{{ $t('classes.creditCost') }}</p>
                <p class="text-sm text-gray-900 dark:text-white">
                  {{ schedule.credit_cost }} {{ $t('classes.credits') }}
                </p>
              </div>
            </div>
            
            <div class="flex gap-2">
              <UButton
                @click="editSchedule(schedule)"
                variant="soft"
                size="sm"
                icon="i-heroicons-pencil-square"
              >
                {{ $t('common.edit') }}
              </UButton>
              <UButton
                @click="toggleScheduleStatus(schedule)"
                :variant="schedule.active ? 'soft' : 'solid'"
                size="sm"
                :icon="schedule.active ? 'i-heroicons-pause' : 'i-heroicons-play'"
              >
                {{ schedule.active ? $t('common.pause') : $t('common.activate') }}
              </UButton>
              <UButton
                @click="viewScheduleClasses(schedule)"
                variant="soft"
                size="sm"
                icon="i-heroicons-calendar-days"
              >
                {{ $t('classes.viewClasses') }}
              </UButton>
            </div>
          </div>
        </UCard>
      </div>
    </div>

    <!-- Class Types Tab -->
    <div v-if="activeTab === 'types'">
      <div class="grid gap-6">
        <UCard v-for="classType in classTypes" :key="classType.id">
          <template #header>
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                {{ classType.name }}
              </h3>
              <UBadge :color="classType.active ? 'green' : 'gray'">
                {{ classType.active ? $t('common.active') : $t('common.inactive') }}
              </UBadge>
            </div>
          </template>
          
          <div class="space-y-4">
            <p class="text-gray-600 dark:text-gray-400">
              {{ classType.description || $t('classes.noDescription') }}
            </p>
            
            <div class="flex items-center gap-4">
              <div>
                <p class="text-sm font-medium text-gray-500">{{ $t('classes.defaultCreditCost') }}</p>
                <p class="text-lg font-semibold text-primary-600">
                  {{ classType.default_credit_cost }} {{ $t('classes.credits') }}
                </p>
              </div>
            </div>
            
            <div class="flex gap-2">
              <UButton
                @click="editClassType(classType)"
                variant="soft"
                size="sm"
                icon="i-heroicons-pencil-square"
              >
                {{ $t('common.edit') }}
              </UButton>
              <UButton
                @click="toggleClassTypeStatus(classType)"
                :variant="classType.active ? 'soft' : 'solid'"
                size="sm"
                :icon="classType.active ? 'i-heroicons-pause' : 'i-heroicons-play'"
              >
                {{ classType.active ? $t('common.pause') : $t('common.activate') }}
              </UButton>
            </div>
          </div>
        </UCard>
      </div>
    </div>

    <!-- Locations Tab -->
    <div v-if="activeTab === 'locations'">
      <div class="grid gap-6">
        <UCard v-for="location in locations" :key="location.id">
          <template #header>
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                {{ location.name }}
              </h3>
              <UBadge :color="location.active ? 'green' : 'gray'">
                {{ location.active ? $t('common.active') : $t('common.inactive') }}
              </UBadge>
            </div>
          </template>
          
          <div class="space-y-4">
            <div class="grid grid-cols-1 gap-2">
              <div class="flex items-center gap-2">
                <UIcon name="i-heroicons-map-pin" class="h-4 w-4 text-gray-400" />
                <span class="text-sm text-gray-600 dark:text-gray-400">{{ location.address }}</span>
              </div>
              <div class="flex items-center gap-2">
                <UIcon name="i-heroicons-phone" class="h-4 w-4 text-gray-400" />
                <span class="text-sm text-gray-600 dark:text-gray-400">{{ location.phone }}</span>
              </div>
              <div v-if="location.email" class="flex items-center gap-2">
                <UIcon name="i-heroicons-envelope" class="h-4 w-4 text-gray-400" />
                <span class="text-sm text-gray-600 dark:text-gray-400">{{ location.email }}</span>
              </div>
              <div v-if="location.website" class="flex items-center gap-2">
                <UIcon name="i-heroicons-globe-alt" class="h-4 w-4 text-gray-400" />
                <a :href="location.website" target="_blank" class="text-sm text-primary-600 hover:underline">
                  {{ location.website }}
                </a>
              </div>
            </div>
            
            <div class="flex gap-2">
              <UButton
                @click="editLocation(location)"
                variant="soft"
                size="sm"
                icon="i-heroicons-pencil-square"
              >
                {{ $t('common.edit') }}
              </UButton>
              <UButton
                @click="toggleLocationStatus(location)"
                :variant="location.active ? 'soft' : 'solid'"
                size="sm"
                :icon="location.active ? 'i-heroicons-pause' : 'i-heroicons-play'"
              >
                {{ location.active ? $t('common.pause') : $t('common.activate') }}
              </UButton>
            </div>
          </div>
        </UCard>
      </div>
    </div>

    <!-- Modals -->
    <ClassTypeModal 
      v-model:open="showClassTypeModal"
      :class-type="editingClassType"
      @saved="onClassTypeSaved"
    />
    
    <ScheduleModal 
      v-model:open="showScheduleModal"
      :schedule="editingSchedule"
      @saved="onScheduleSaved"
    />
    
    <LocationModal 
      v-model:open="showLocationModal"
      :location="editingLocation"
      @saved="onLocationSaved"
    />
  </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
const { t } = useI18n()

// Mock data - replace with real composables
const schedules = ref([
  {
    id: '1',
    classType: { name: 'Yoga Basics', id: '1' },
    location: { name: 'Studio A', id: '1' },
    weekly_days: ['mon', 'wed', 'fri'],
    start_time: '09:00',
    end_time: '10:00',
    max_capacity: 15,
    credit_cost: 2,
    active: true
  }
])

const classTypes = ref([
  {
    id: '1',
    name: 'Yoga Basics',
    description: 'Introduction to yoga fundamentals',
    default_credit_cost: 2,
    active: true
  }
])

const locations = ref([
  {
    id: '1',
    name: 'Studio A',
    address: '123 Main St, City',
    phone: '+1 234 567 8900',
    email: 'studio@example.com',
    website: 'https://studio.com',
    active: true
  }
])

// Modal states
const showClassTypeModal = ref(false)
const showScheduleModal = ref(false)
const showLocationModal = ref(false)
const editingClassType = ref(null)
const editingSchedule = ref(null)
const editingLocation = ref(null)

// Tabs
const activeTab = ref('schedules')
const tabs = computed(() => [
  {
    key: 'schedules',
    label: t('classes.schedules'),
    icon: 'i-heroicons-calendar-days'
  },
  {
    key: 'types',
    label: t('classes.classTypes'),
    icon: 'i-heroicons-academic-cap'
  },
  {
    key: 'locations',
    label: t('classes.locations'),
    icon: 'i-heroicons-map-pin'
  }
])

// Methods
const formatScheduleDays = (days: string[]) => {
  const dayMap = {
    mon: t('common.monday'),
    tue: t('common.tuesday'),
    wed: t('common.wednesday'),
    thu: t('common.thursday'),
    fri: t('common.friday'),
    sat: t('common.saturday'),
    sun: t('common.sunday')
  }
  return days.map(day => dayMap[day]).join(', ')
}

const formatTime = (time: string) => {
  return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })
}

const editClassType = (classType: any) => {
  editingClassType.value = classType
  showClassTypeModal.value = true
}

const editSchedule = (schedule: any) => {
  editingSchedule.value = schedule
  showScheduleModal.value = true
}

const editLocation = (location: any) => {
  editingLocation.value = location
  showLocationModal.value = true
}

const toggleClassTypeStatus = (classType: any) => {
  classType.active = !classType.active
}

const toggleScheduleStatus = (schedule: any) => {
  schedule.active = !schedule.active
}

const toggleLocationStatus = (location: any) => {
  location.active = !location.active
}

const viewScheduleClasses = (schedule: any) => {
  // Navigate to schedule classes view
  navigateTo(`/classes/schedule/${schedule.id}`)
}

const onClassTypeSaved = () => {
  showClassTypeModal.value = false
  editingClassType.value = null
}

const onScheduleSaved = () => {
  showScheduleModal.value = false
  editingSchedule.value = null
}

const onLocationSaved = () => {
  showLocationModal.value = false
  editingLocation.value = null
}

definePageMeta({
  middleware: 'auth'
})
</script>