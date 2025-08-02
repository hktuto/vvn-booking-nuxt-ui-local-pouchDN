<template>
  <div class="p-6">
    <!-- Page Header -->
    <div class="mb-8">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
            {{ $t('bookings.title') }}
          </h1>
          <p class="text-gray-600 dark:text-gray-400 mt-2">
            {{ $t('bookings.description') }}
          </p>
        </div>
        <div class="flex gap-3">
          <UButton
            @click="showBulkBookingModal = true"
            variant="soft"
            icon="i-heroicons-plus"
          >
            {{ $t('bookings.bulkBooking') }}
          </UButton>
          <UButton
            @click="showBookingModal = true"
            icon="i-heroicons-plus"
          >
            {{ $t('bookings.addBooking') }}
          </UButton>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <UCard class="mb-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <UFormGroup :label="$t('bookings.filterByStatus')">
          <USelect
            v-model="filters.status"
            :options="statusOptions"
            option-attribute="label"
            value-attribute="value"
            :placeholder="$t('bookings.allStatuses')"
            clearable
          />
        </UFormGroup>
        
        <UFormGroup :label="$t('bookings.filterByStudent')">
          <USelect
            v-model="filters.student_id"
            :options="studentOptions"
            option-attribute="label"
            value-attribute="value"
            :placeholder="$t('bookings.allStudents')"
            clearable
          />
        </UFormGroup>
        
        <UFormGroup :label="$t('bookings.filterByClass')">
          <USelect
            v-model="filters.class_type_id"
            :options="classTypeOptions"
            option-attribute="label"
            value-attribute="value"
            :placeholder="$t('bookings.allClasses')"
            clearable
          />
        </UFormGroup>
        
        <UFormGroup :label="$t('bookings.filterByDate')">
          <UInput
            v-model="filters.date"
            type="date"
            clearable
          />
        </UFormGroup>
      </div>
    </UCard>

    <!-- Bookings Table -->
    <UCard>
      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            {{ $t('bookings.recentBookings') }}
          </h3>
          <div class="flex items-center gap-2">
            <UButton
              @click="exportBookings"
              variant="soft"
              icon="i-heroicons-arrow-down-tray"
              size="sm"
            >
              {{ $t('common.export') }}
            </UButton>
          </div>
        </div>
      </template>

      <UTable
        :rows="filteredBookings"
        :columns="columns"
        :loading="loading"
      >
        <template #student-data="{ row }">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
              <span class="text-sm font-medium text-primary-700 dark:text-primary-300">
                {{ row.student?.name?.charAt(0) }}
              </span>
            </div>
            <div>
              <p class="font-medium text-gray-900 dark:text-white">
                {{ row.student?.name }}
              </p>
              <p class="text-sm text-gray-500">
                {{ row.student?.phone }}
              </p>
            </div>
          </div>
        </template>

        <template #class-data="{ row }">
          <div>
            <p class="font-medium text-gray-900 dark:text-white">
              {{ row.class?.classType?.name }}
            </p>
            <p class="text-sm text-gray-500">
              {{ formatDate(row.class?.date) }} {{ formatTime(row.class?.start_time) }}
            </p>
            <p class="text-sm text-gray-500">
              {{ row.class?.location?.name }}
            </p>
          </div>
        </template>

        <template #status-data="{ row }">
          <UBadge :color="getStatusColor(row.status)">
            {{ $t(`bookings.status.${row.status}`) }}
          </UBadge>
        </template>

        <template #credits-data="{ row }">
          <span class="font-medium text-gray-900 dark:text-white">
            {{ row.class?.credit_cost }} {{ $t('common.credits') }}
          </span>
        </template>

        <template #actions-data="{ row }">
          <UDropdown :items="getActionItems(row)">
            <UButton
              variant="ghost"
              icon="i-heroicons-ellipsis-vertical"
              size="sm"
            />
          </UDropdown>
        </template>
      </UTable>
    </UCard>

    <!-- Modals -->
    <BookingModal 
      v-model:open="showBookingModal"
      :booking="editingBooking"
      @saved="onBookingSaved"
    />
    
    <BulkBookingModal 
      v-model:open="showBulkBookingModal"
      @saved="onBulkBookingSaved"
    />
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()

// Mock data - replace with real composables
const bookings = ref([
  {
    id: '1',
    student: { name: 'John Doe', phone: '+1 234 567 8900' },
    class: {
      classType: { name: 'Yoga Basics' },
      date: '2024-01-15',
      start_time: '09:00',
      location: { name: 'Studio A' },
      credit_cost: 2
    },
    status: 'booked',
    booking_time: '2024-01-10T10:00:00Z'
  },
  {
    id: '2',
    student: { name: 'Jane Smith', phone: '+1 234 567 8901' },
    class: {
      classType: { name: 'Advanced Yoga' },
      date: '2024-01-16',
      start_time: '10:00',
      location: { name: 'Studio B' },
      credit_cost: 3
    },
    status: 'completed',
    booking_time: '2024-01-10T11:00:00Z'
  }
])

const students = ref([
  { id: '1', name: 'John Doe', phone: '+1 234 567 8900' },
  { id: '2', name: 'Jane Smith', phone: '+1 234 567 8901' }
])

const classTypes = ref([
  { id: '1', name: 'Yoga Basics' },
  { id: '2', name: 'Advanced Yoga' }
])

// State
const loading = ref(false)
const showBookingModal = ref(false)
const showBulkBookingModal = ref(false)
const editingBooking = ref(null)

const filters = ref({
  status: '',
  student_id: '',
  class_type_id: '',
  date: ''
})

// Computed
const statusOptions = computed(() => [
  { label: t('bookings.status.booked'), value: 'booked' },
  { label: t('bookings.status.completed'), value: 'completed' },
  { label: t('bookings.status.cancelled'), value: 'cancelled' },
  { label: t('bookings.status.no_show'), value: 'no_show' }
])

const studentOptions = computed(() => 
  students.value.map(s => ({
    label: `${s.name} (${s.phone})`,
    value: s.id
  }))
)

const classTypeOptions = computed(() => 
  classTypes.value.map(ct => ({
    label: ct.name,
    value: ct.id
  }))
)

const filteredBookings = computed(() => {
  let filtered = bookings.value

  if (filters.value.status) {
    filtered = filtered.filter(b => b.status === filters.value.status)
  }

  if (filters.value.student_id) {
    filtered = filtered.filter(b => b.student?.id === filters.value.student_id)
  }

  if (filters.value.class_type_id) {
    filtered = filtered.filter(b => b.class?.classType?.id === filters.value.class_type_id)
  }

  if (filters.value.date) {
    filtered = filtered.filter(b => b.class?.date === filters.value.date)
  }

  return filtered.sort((a, b) => new Date(b.booking_time).getTime() - new Date(a.booking_time).getTime())
})

const columns = computed(() => [
  {
    key: 'student',
    label: t('bookings.student'),
    sortable: true
  },
  {
    key: 'class',
    label: t('bookings.class'),
    sortable: true
  },
  {
    key: 'status',
    label: t('bookings.status'),
    sortable: true
  },
  {
    key: 'credits',
    label: t('bookings.credits'),
    sortable: true
  },
  {
    key: 'booking_time',
    label: t('bookings.bookingTime'),
    sortable: true
  },
  {
    key: 'actions',
    label: t('common.actions')
  }
])

// Methods
const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString()
}

const formatTime = (time: string) => {
  return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })
}

const getStatusColor = (status: string) => {
  const colors = {
    booked: 'blue',
    completed: 'green',
    cancelled: 'red',
    no_show: 'yellow'
  }
  return colors[status] || 'gray'
}

const getActionItems = (booking: any) => [
  {
    label: t('bookings.viewDetails'),
    icon: 'i-heroicons-eye',
    click: () => viewBooking(booking)
  },
  {
    label: t('bookings.editBooking'),
    icon: 'i-heroicons-pencil-square',
    click: () => editBooking(booking)
  },
  {
    label: t('bookings.markCompleted'),
    icon: 'i-heroicons-check-circle',
    click: () => markCompleted(booking),
    disabled: booking.status !== 'booked'
  },
  {
    label: t('bookings.markNoShow'),
    icon: 'i-heroicons-x-circle',
    click: () => markNoShow(booking),
    disabled: booking.status !== 'booked'
  },
  {
    label: t('bookings.cancelBooking'),
    icon: 'i-heroicons-x-mark',
    click: () => cancelBooking(booking),
    disabled: booking.status !== 'booked'
  }
]

const viewBooking = (booking: any) => {
  // Navigate to booking details
  navigateTo(`/bookings/${booking.id}`)
}

const editBooking = (booking: any) => {
  editingBooking.value = booking
  showBookingModal.value = true
}

const markCompleted = async (booking: any) => {
  booking.status = 'completed'
  // TODO: Update in database
}

const markNoShow = async (booking: any) => {
  booking.status = 'no_show'
  // TODO: Update in database
}

const cancelBooking = async (booking: any) => {
  booking.status = 'cancelled'
  // TODO: Update in database
}

const exportBookings = () => {
  // TODO: Implement export functionality
  console.log('Exporting bookings...')
}

const onBookingSaved = () => {
  showBookingModal.value = false
  editingBooking.value = null
}

const onBulkBookingSaved = () => {
  showBulkBookingModal.value = false
}

definePageMeta({
  middleware: 'auth'
})
</script>