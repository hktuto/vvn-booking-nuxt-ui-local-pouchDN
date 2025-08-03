<template>
  <div class="space-y-4">
    <!-- Date Navigation -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-4">
        <UButton
          @click="previousDay"
          variant="ghost"
          icon="i-heroicons-chevron-left"
          size="sm"
        />
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
          {{ formatDate(selectedDate) }}
        </h2>
        <UButton
          @click="nextDay"
          variant="ghost"
          icon="i-heroicons-chevron-right"
          size="sm"
        />
      </div>
      <UButton
        @click="goToToday"
        variant="soft"
        size="sm"
      >
        {{ t('booking.today') }}
      </UButton>
    </div>

    <!-- Calendar Grid -->
    <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center py-12">
        <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 animate-spin text-gray-400" />
      </div>
      
      <!-- Time Slots -->
      <div v-else class="grid grid-cols-1 gap-1">
        <div
          v-for="timeSlot in timeSlots"
          :key="timeSlot.time"
          class="relative min-h-[80px] border-b border-gray-100 dark:border-gray-700"
        >
          <!-- Time Label -->
          <div class="absolute left-0 top-0 w-16 h-full bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex items-center justify-center text-sm text-gray-500 dark:text-gray-400 font-medium">
            {{ timeSlot.time }}
          </div>

          <!-- Bookings for this time slot -->
          <div class="ml-16 p-2">
            <div
              v-for="booking in getBookingsForTimeSlot(timeSlot.time)"
              :key="booking.id"
              class="mb-2"
            >
              <BookingCard
                :booking="booking"
                :time-slot="timeSlot.time"
                @view-details="handleViewDetails"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()
const { getBookingsForDate } = useBookings()

// Date management
const selectedDate = ref(new Date().toISOString().split('T')[0])
const { locale } = useI18n()

// Time slots (6 AM to 10 PM)
const timeSlots = computed(() => {
  const slots = []
  for (let hour = 6; hour <= 22; hour++) {
    slots.push({
      time: `${hour.toString().padStart(2, '0')}:00`,
      hour
    })
  }
  return slots
})

const bookings = ref<any[]>([])
const loading = ref(false)

async function loadBookings() {
  loading.value = true
  try {
    bookings.value = await getBookingsForDate(selectedDate.value)
  } catch (error) {
    console.error('Error loading bookings:', error)
    bookings.value = []
  } finally {
    loading.value = false
  }
}

// Date navigation
const previousDay = () => {
  const date = new Date(selectedDate.value)
  date.setDate(date.getDate() - 1)
  selectedDate.value = date.toISOString().split('T')[0]
}

const nextDay = () => {
  const date = new Date(selectedDate.value)
  date.setDate(date.getDate() + 1)
  selectedDate.value = date.toISOString().split('T')[0]
}

const goToToday = () => {
  selectedDate.value = new Date().toISOString().split('T')[0]
}

// Format date for display
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString(locale.value, {
    weekday: 'short',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric'
  })
}

// Get bookings for a specific time slot
const getBookingsForTimeSlot = (timeSlot: string) => {
  return bookings.value.filter(booking => booking.class_time === timeSlot)
}

// Handle viewing booking details
const handleViewDetails = (booking: any) => {
  navigateTo(`/bookings/${booking.id}`)
}

// Watch for date changes to reload bookings
watch(selectedDate, () => {
  loadBookings()
}, {
  immediate: true
})
</script> 