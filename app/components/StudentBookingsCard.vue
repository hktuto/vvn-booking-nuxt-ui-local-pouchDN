<template>
  <UCard>
    <template #header>
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-semibold">{{ t('bookings.recentBookings') }}</h2>
        <UButton
          @click="loadStudentBookings"
          variant="ghost"
          size="sm"
          icon="i-heroicons-arrow-path"
          :loading="loading"
        >
          {{ t('common.refresh') }}
        </UButton>
      </div>
    </template>
    
    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center py-8">
      <UIcon name="i-heroicons-arrow-path" class="w-6 h-6 animate-spin text-primary-500" />
    </div>

    <!-- Bookings Table -->
    <div v-else-if="studentBookings.length > 0" class="overflow-x-auto">
      <UTable
        :data="paginatedStudentBookings"
        :columns="columns"
        :loading="loading"
      />
      
      <!-- Pagination -->
      <div class="flex items-center justify-between mt-4">
        <div class="text-sm text-gray-600 dark:text-gray-400">
          {{ t('common.showing', { from: paginationStart + 1, to: paginationEnd, total: studentBookings.length }) }}
        </div>
        <UPagination
          v-model="currentPage"
          :page-count="pageCount"
          :total="studentBookings.length"
        />
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
  studentId: string
  limit?: number
}

interface Emits {
  (e: 'view-booking', booking: any): void
}

const props = withDefaults(defineProps<Props>(), {
  limit: 10
})
const emit = defineEmits<Emits>()

const { t } = useI18n()
const { getBookingsByStudent } = useBookings()
const { classes, loadClasses } = useClasses()

// State
const loading = ref(false)
const studentBookings = ref<any[]>([])
const currentPage = ref(1)
const pageSize = ref(10)

// Table columns
const columns = computed(() => [
  {
    accessorKey: 'class_name',
    header: t('booking.className')
  },
  {
    accessorKey: 'booking_status',
    header: t('bookings.statusLabel')
  },
  {
    accessorKey: 'payment_status',
    header: t('booking.paymentStatus')
  },
  {
    accessorKey: 'class_date',
    header: t('booking.date')
  },
  {
    accessorKey: 'class_time',
    header: t('booking.time')
  },
  {
    accessorKey: 'credits_used',
    header: t('booking.creditsUsed')
  },
  {
    accessorKey: 'booked_at',
    header: t('booking.bookedAt')
  },
  {
    accessorKey: 'actions',
    header: t('transactions.actions')
  }
])

// Pagination computed
const pageCount = computed(() => Math.ceil(studentBookings.value.length / pageSize.value))
const paginationStart = computed(() => (currentPage.value - 1) * pageSize.value)
const paginationEnd = computed(() => Math.min(paginationStart.value + pageSize.value, studentBookings.value.length))
const paginatedStudentBookings = computed(() => {
  const start = paginationStart.value
  const end = paginationStart.value + pageSize.value
  return studentBookings.value.slice(start, end)
})

// Methods
const loadStudentBookings = async () => {
  if (!props.studentId) return
  
  try {
    loading.value = true
    const bookings = await getBookingsByStudent(props.studentId, props.limit)
    
    // Transform bookings to include class names and format data for table
    const transformedBookings = bookings.map(booking => {
      const classInfo = classes.value.find(c => c.id === booking.class_id)
      return {
        ...booking,
        class_name: classInfo?.name || 'Unknown Class',
        booking_status: booking.studentBooking.status,
        payment_status: booking.studentBooking.payment_status,
        credits_used: booking.studentBooking.credits_used,
        booked_at: booking.studentBooking.booked_at,
        class_date: formatDate(booking.class_date),
        class_time: formatTime(booking.class_time)
      }
    })
    
    studentBookings.value = transformedBookings
  } catch (err) {
    console.error('Error loading student bookings:', err)
  } finally {
    loading.value = false
  }
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

// Load data on mount
onMounted(async () => {
  await loadClasses()
  loadStudentBookings()
})

// Watch for studentId changes
watch(() => props.studentId, () => {
  if (props.studentId) {
    loadStudentBookings()
    currentPage.value = 1
  }
})
</script> 