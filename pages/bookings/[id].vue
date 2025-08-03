<template>
  <div class="max-w-4xl mx-auto p-6 space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          {{ t('booking.bookingDetails') }}
        </h1>
        <p class="text-gray-600 dark:text-gray-400 mt-1">
          {{ formatDate(booking?.class_date) }} at {{ booking?.class_time }}
        </p>
      </div>
      <UButton
        @click="navigateBack"
        variant="ghost"
        icon="i-heroicons-arrow-left"
      >
        {{ t('common.back') }}
      </UButton>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center py-12">
      <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 animate-spin text-gray-400" />
    </div>

    <!-- Booking Details -->
    <div v-else-if="booking" class="space-y-6">
      <!-- Virtual Event Notice -->
      <div v-if="booking.is_virtual" class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
        <div class="flex items-center gap-2">
          <UIcon name="i-heroicons-information-circle" class="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <div>
            <h3 class="font-medium text-blue-900 dark:text-blue-100">
              {{ t('booking.virtualEvent') }}
            </h3>
            <p class="text-sm text-blue-700 dark:text-blue-300">
              {{ t('booking.virtualEventDescription') }}
            </p>
          </div>
        </div>
      </div>

      <!-- Class Information -->
      <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div class="flex items-start justify-between mb-4">
          <div>
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {{ getClassInfo(booking)?.name || 'Unknown Class' }}
            </h2>
            <div class="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
              <span class="flex items-center gap-1">
                <UIcon name="i-heroicons-calendar" class="w-4 h-4" />
                {{ formatDate(booking.class_date) }}
              </span>
              <span class="flex items-center gap-1">
                <UIcon name="i-heroicons-clock" class="w-4 h-4" />
                {{ booking.class_time }}
              </span>
              <span class="flex items-center gap-1">
                <UIcon name="i-heroicons-academic-cap" class="w-4 h-4" />
                {{ getClassInfo(booking)?.credits || 0 }} {{ t('common.credits') }}
              </span>
              <span class="flex items-center gap-1">
                <UIcon name="i-heroicons-users" class="w-4 h-4" />
                {{ booking.total_booked }}/{{ booking.max_capacity }}
              </span>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <UBadge
              v-if="booking.is_virtual"
              color="blue"
              variant="soft"
            >
              {{ t('booking.virtual') }}
            </UBadge>
            <UBadge
              v-else
              color="green"
              variant="soft"
            >
              {{ t('booking.inPerson') }}
            </UBadge>
          </div>
        </div>

        <!-- Class Description -->
        <div v-if="getClassInfo(booking)?.description" class="text-gray-600 dark:text-gray-400">
          {{ getClassInfo(booking)?.description }}
        </div>
      </div>

      <!-- Students Section -->
      <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div class="p-6 border-b border-gray-200 dark:border-gray-700">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              {{ t('booking.students') }}
            </h3>
            <UButton
              @click="showAddStudentModal = true"
              :disabled="booking.total_booked >= booking.max_capacity"
              color="primary"
              icon="i-heroicons-plus"
            >
              {{ t('booking.addStudent') }}
            </UButton>
          </div>
        </div>

        <!-- Students List -->
        <div class="p-6">
          <div v-if="booking.bookings && booking.bookings.length > 0" class="space-y-3">
            <div
              v-for="studentBooking in booking.bookings"
              :key="studentBooking.student_id"
              class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
            >
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                  <UIcon name="i-heroicons-user" class="w-5 h-5 text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                  <div class="font-medium text-gray-900 dark:text-white">
                    {{ studentBooking.student_name }}
                  </div>
                  <div class="text-sm text-gray-600 dark:text-gray-400">
                    {{ studentBooking.credits_used }} {{ t('common.credits') }}
                    <span class="mx-2">•</span>
                    {{ t(`booking.status.${studentBooking.status}`) }}
                  </div>
                </div>
              </div>
              
              <div class="flex items-center gap-2">
                <UBadge
                  :color="getStatusColor(studentBooking.status)"
                  variant="soft"
                >
                  {{ t(`booking.status.${studentBooking.status}`) }}
                </UBadge>
                <UButton
                  @click="handleRemoveStudent(studentBooking.student_id)"
                  variant="ghost"
                  size="sm"
                  icon="i-heroicons-x-mark"
                  color="red"
                  :aria-label="t('booking.removeStudent')"
                />
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div v-else class="text-center py-12">
            <UIcon name="i-heroicons-users" class="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {{ t('booking.noStudentsBooked') }}
            </h3>
            <p class="text-gray-600 dark:text-gray-400 mb-4">
              {{ t('booking.addFirstStudent') }}
            </p>
            <UButton
              @click="showAddStudentModal = true"
              color="primary"
              icon="i-heroicons-plus"
            >
              {{ t('booking.addStudent') }}
            </UButton>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex justify-end gap-3">
        <UButton
          @click="navigateBack"
          variant="ghost"
        >
          {{ t('common.cancel') }}
        </UButton>
        <UButton
          v-if="!booking?.is_virtual"
          @click="handleDeleteBooking"
          color="red"
          variant="soft"
          icon="i-heroicons-trash"
        >
          {{ t('booking.deleteBooking') }}
        </UButton>
      </div>
    </div>

    <!-- Error State -->
    <div v-else class="text-center py-12">
      <UIcon name="i-heroicons-exclamation-triangle" class="w-16 h-16 text-red-400 mx-auto mb-4" />
      <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
        {{ t('booking.bookingNotFound') }}
      </h3>
      <p class="text-gray-600 dark:text-gray-400 mb-4">
        {{ t('booking.bookingNotFoundDescription') }}
      </p>
      <UButton
        @click="navigateBack"
        color="primary"
      >
        {{ t('common.back') }}
      </UButton>
    </div>

    <!-- Add Student Modal -->
    <AddStudentToBookingModal
      v-model="showAddStudentModal"
      :booking="booking"
      @student-added="handleStudentAdded"
      @student-removed="handleStudentRemoved"
      @virtual-booking-conversion="handleVirtualBookingConversion"
      @refresh-needed="loadBooking"
    />
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const { getBookingById, deleteBooking, addStudentToBooking, removeStudentFromBooking, convertVirtualBookingToReal } = useBookings()
const { classes, loadClasses } = useClasses()

// State
const loading = ref(true)
const booking = ref<any>(null)
const showAddStudentModal = ref(false)

// Get booking ID from route
const bookingId = route.params.id as string

// Load booking data
async function loadBooking() {
  loading.value = true
  try {
    // Ensure classes are loaded for virtual bookings
    await loadClasses()
    booking.value = await getBookingById(bookingId)
  } catch (error) {
    console.error('Error loading booking:', error)
    booking.value = null
  } finally {
    loading.value = false
  }
}

// Get class information
const getClassInfo = (booking: any) => {
  if (booking?.class_info) return booking.class_info
  return classes.value.find(c => c.id === booking?.class_id)
}

// Format date
const formatDate = (dateString: string) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
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

// Handle virtual booking conversion
const handleVirtualBookingConversion = async (virtualBookingId: string, studentIds: string[], creditsUsed: number, notes: string) => {
  try {
    const result = await convertVirtualBookingToReal(virtualBookingId, studentIds, creditsUsed, notes)
    
    if (result.success) {
      showAddStudentModal.value = false
      
      // Show success message
      const message = t('booking.virtualBookingConvertedMessage', { count: studentIds.length })
      // You can add a toast notification here if you have a notification system
      console.log(t('booking.virtualBookingConverted'), message)
      
      // Navigate to the new real booking page
      await navigateTo(`/bookings/${result.newBookingId}`)
    }
  } catch (err) {
    console.error('Error converting virtual booking:', err)
  }
}

// Handle student added
const handleStudentAdded = async (bookingId: string, studentId: string, creditsUsed: number, notes: string) => {
  try {
    const result = await addStudentToBooking(bookingId, studentId, creditsUsed, notes)
    
    if (result.success) {
      showAddStudentModal.value = false
      
      // If this was a virtual booking conversion, redirect to the new booking page
      if (result.isVirtualConversion) {
        // Navigate to the new real booking page
        await navigateTo(`/bookings/${result.newBookingId}`)
      } else {
        // Just reload the current booking
        await loadBooking()
      }
    }
  } catch (err) {
    console.error('Error adding student:', err)
  }
}

// Handle student removed
const handleStudentRemoved = async (bookingId: string, studentId: string) => {
  try {
    await removeStudentFromBooking(bookingId, studentId)
    await loadBooking()
  } catch (err) {
    console.error('Error removing student:', err)
  }
}

// Handle remove student
const handleRemoveStudent = async (studentId: string) => {
  if (!booking.value) return
  
  try {
    await removeStudentFromBooking(booking.value.id, studentId)
    await loadBooking()
  } catch (err) {
    console.error('Error removing student:', err)
  }
}

// Handle delete booking
const handleDeleteBooking = async () => {
  if (!booking.value) return
  
  // Virtual events cannot be deleted as they don't exist in the database
  if (booking.value.is_virtual) {
    console.warn('Cannot delete virtual booking')
    return
  }
  
  try {
    await deleteBooking(booking.value.id)
    navigateBack()
  } catch (err) {
    console.error('Error deleting booking:', err)
  }
}

// Navigate back
const navigateBack = () => {
  router.back()
}

// Load booking on mount
onMounted(() => {
  loadBooking()
})
</script>