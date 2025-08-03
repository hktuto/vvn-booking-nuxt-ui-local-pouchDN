<template>
  <div 
    class="p-3 rounded-lg border transition-all duration-200 hover:shadow-md"
    :class="{
      'border-blue-200 bg-blue-50 dark:border-blue-700 dark:bg-blue-900/20': booking.is_virtual,
      'border-green-200 bg-green-50 dark:border-green-700 dark:bg-green-900/20': !booking.is_virtual && booking.total_booked > 0,
      'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800': !booking.is_virtual && booking.total_booked === 0
    }"
  >
    <!-- Class Header -->
    <div class="flex items-start justify-between mb-2">
      <div class="flex-1">
        <div class="flex items-center gap-2 mb-1">
          <h4 class="font-medium text-gray-900 dark:text-white">
            {{ getClassInfo(booking)?.name || 'Unknown Class' }}
          </h4>
          <UBadge
            v-if="booking.is_virtual"
            color="blue"
            variant="soft"
            size="xs"
          >
            {{ t('booking.virtual') }}
          </UBadge>
          <UBadge
            v-else
            color="green"
            variant="soft"
            size="xs"
          >
            {{ t('booking.booked') }}
          </UBadge>
        </div>
        
        <div class="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
          <span class="flex items-center gap-1">
            <UIcon name="i-heroicons-clock" class="w-3 h-3" />
            {{ booking.class_time }}
          </span>
          <span class="flex items-center gap-1">
            <UIcon name="i-heroicons-users" class="w-3 h-3" />
            {{ booking.total_booked }}/{{ booking.max_capacity }}
          </span>
          <span class="flex items-center gap-1">
            <UIcon name="i-heroicons-academic-cap" class="w-3 h-3" />
            {{ getClassInfo(booking)?.credits || 0 }} {{ t('common.credits') }}
          </span>
        </div>
      </div>
      
      <!-- Actions -->
      <UDropdownMenu :items="getBookingActions()">
        <UButton
          variant="ghost"
          size="sm"
          icon="i-heroicons-ellipsis-vertical"
          :aria-label="t('common.actions')"
        />
      </UDropdownMenu>
    </div>

    <!-- Student List -->
    <div v-if="booking.bookings && booking.bookings.length > 0" class="space-y-1">
      <div class="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
        {{ t('booking.students') }}:
      </div>
      <div
        v-for="studentBooking in booking.bookings"
        :key="studentBooking.student_id"
        class="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded border"
      >
        <div class="flex items-center gap-2">
          <UIcon name="i-heroicons-user" class="w-4 h-4 text-gray-500" />
          <span class="text-sm font-medium">{{ studentBooking.student_name }}</span>
          <UBadge
            :color="getStatusColor(studentBooking.status)"
            variant="soft"
            size="xs"
          >
            {{ t(`booking.status.${studentBooking.status}`) }}
          </UBadge>
        </div>
        
        <div class="flex items-center gap-2">
          <span class="text-xs text-gray-500">
            {{ studentBooking.credits_used }} {{ t('common.credits') }}
          </span>
          <UButton
            @click="$emit('remove-student', booking.id, studentBooking.student_id)"
            variant="ghost"
            size="xs"
            icon="i-heroicons-x-mark"
            color="red"
            :aria-label="t('booking.removeStudent')"
          />
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-3">
      <div class="text-sm text-gray-500 dark:text-gray-400 mb-2">
        {{ booking.is_virtual ? t('booking.noStudentsBooked') : t('booking.noStudents') }}
      </div>
      <UButton
        @click="$emit('add-student', booking)"
        size="sm"
        color="primary"
        variant="soft"
      >
        {{ t('booking.addStudent') }}
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()
const { classes } = useClasses()

interface Props {
  booking: any
  timeSlot: string
}

interface Emits {
  (e: 'add-student', booking: any): void
  (e: 'remove-student', bookingId: string, studentId: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Get class information
const getClassInfo = (booking: any) => {
  if (booking.class_info) return booking.class_info
  return classes.value.find(c => c.id === booking.class_id)
}

// Get status color
const getStatusColor = (status: string) => {
  switch (status) {
    case 'confirmed': return 'green'
    case 'cancelled': return 'red'
    case 'completed': return 'blue'
    case 'no_show': return 'orange'
    default: return 'gray'
  }
}

// Get booking actions
const getBookingActions = () => [
  {
    label: t('booking.addStudent'),
    icon: 'i-heroicons-plus',
    click: () => emit('add-student', props.booking)
  },
  {
    label: t('booking.viewDetails'),
    icon: 'i-heroicons-eye',
    click: () => {
      // Navigate to booking details
      navigateTo(`/bookings/${props.booking.id}`)
    }
  }
]
</script> 