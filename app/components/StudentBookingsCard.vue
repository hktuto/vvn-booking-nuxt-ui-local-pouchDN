<template>
  <UCard>
    <template #header>
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-semibold">{{ t('student.recentBookings') }}</h2>
        <UButton
          @click="$emit('refresh')"
          variant="ghost"
          size="sm"
          icon="i-heroicons-arrow-path"
          :loading="loading"
        >
          {{ t('common.refresh') }}
        </UButton>
      </div>
    </template>
    
    <div v-if="studentBookings.length > 0" class="space-y-3">
      <div
        v-for="booking in studentBookings"
        :key="booking.id"
        class="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
      >
        <div class="flex items-center justify-between">
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-2">
              <h3 class="font-medium text-gray-900 dark:text-white">
                {{ getClassById(booking.class_id)?.name || 'Unknown Class' }}
              </h3>
              <UBadge
                :color="getBookingStatusColor(booking.studentBooking.status)"
                variant="soft"
                size="sm"
              >
                {{ t(`booking.status.${booking.studentBooking.status}`) }}
              </UBadge>
              <UBadge
                :color="getPaymentStatusColor(booking.studentBooking.payment_status)"
                variant="soft"
                size="sm"
              >
                {{ t(`booking.paymentStatus.${booking.studentBooking.payment_status}`) }}
              </UBadge>
            </div>
            
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 dark:text-gray-400">
              <div>
                <span class="font-medium">{{ t('booking.date') }}:</span>
                {{ formatDate(booking.class_date) }}
              </div>
              <div>
                <span class="font-medium">{{ t('booking.time') }}:</span>
                {{ formatTime(booking.class_time) }}
              </div>
              <div>
                <span class="font-medium">{{ t('booking.creditsUsed') }}:</span>
                {{ booking.studentBooking.credits_used }}
              </div>
              <div>
                <span class="font-medium">{{ t('booking.bookedAt') }}:</span>
                {{ formatDate(booking.studentBooking.booked_at) }}
              </div>
            </div>
            
            <div v-if="booking.studentBooking.notes" class="mt-2 text-sm text-gray-600 dark:text-gray-400">
              <span class="font-medium">{{ t('common.notes') }}:</span>
              {{ booking.studentBooking.notes }}
            </div>
          </div>
          
          <div class="flex gap-2 ml-4">
            <UButton
              @click="$emit('view-booking', booking)"
              variant="ghost"
              size="sm"
              icon="i-heroicons-eye"
              :aria-label="t('common.view')"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-8">
      <UIcon name="i-heroicons-calendar" class="w-12 h-12 mx-auto text-gray-400 mb-4" />
      <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
        {{ t('student.noBookings') }}
      </h3>
      <p class="text-gray-600 dark:text-gray-400">
        {{ t('student.noBookingsMessage') }}
      </p>
    </div>
  </UCard>
</template>

<script setup lang="ts">
interface Props {
  studentBookings: readonly any[]
  classes: readonly any[]
  loading?: boolean
}

interface Emits {
  (e: 'refresh'): void
  (e: 'view-booking', booking: any): void
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
})
const emit = defineEmits<Emits>()

const { t } = useI18n()

// Methods
const getClassById = (classId: string) => {
  return props.classes.find(c => c.id === classId)
}

const getBookingStatusColor = (status: string) => {
  switch (status) {
    case 'confirmed': return 'primary'
    case 'completed': return 'success'
    case 'cancelled': return 'error'
    case 'no_show': return 'warning'
    default: return 'neutral'
  }
}

const getPaymentStatusColor = (status: string) => {
  switch (status) {
    case 'paid': return 'success'
    case 'unpaid': return 'warning'
    case 'refunded': return 'info'
    default: return 'neutral'
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString()
}

const formatTime = (timeString: string) => {
  return timeString
}
</script> 