<template>
  <NuxtLayout>
    <!-- Header -->
    <template #header>
    <div class="flex items-center justify-between w-full">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          {{ t('booking.bookingDetails') }}
        </h1>
      </div>
      <UButton
        @click="navigateBack"
        variant="ghost"
        icon="i-heroicons-arrow-left"
      >
        {{ t('common.back') }}
      </UButton>
    </div>
    </template>
    <UiPageContainer>
    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center py-12">
      <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 animate-spin text-gray-400" />
    </div>

    <!-- Booking Details -->
    <div v-else-if="booking" class="space-y-2">
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
            <div class="flex flex-col sm:flex-row items-start sm:items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <span class="flex items-center gap-1">
                <UIcon name="i-heroicons-calendar" class="w-4 h-4" />
                {{ formatDate(booking.class_date) }}@{{ booking.class_time }}
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
            <UButton
              v-if="!booking.is_virtual"
              @click="showEditBookingModal = true"
              variant="ghost"
              size="sm"
              icon="i-heroicons-pencil-square"
              :aria-label="t('booking.editBooking')"
            />
            <UBadge
              v-if="booking.is_virtual"
              color="primary"
              variant="soft"
            >
              {{ t('booking.virtual') }}
            </UBadge>
            <UBadge
              v-else
              color="success"
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
                    <!-- {{ studentBooking.credits_used }} {{ t('common.credits') }} -->
                    {{ t(`booking.status.${studentBooking.status}`) }}
                    <span class="mx-2">•</span>
                    {{ t(`booking.status.${studentBooking.payment_status}`) }}
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
                <UPopover>
                  <UButton
                    variant="ghost"
                    icon="i-heroicons-ellipsis-vertical"
                    size="sm"
                  />
                  <template #content>
                    <UNavigationMenu
                      orientation="vertical"
                      :items="getStudentActions(studentBooking)"
                    />
                  </template>
                </UPopover>
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
          v-if="!booking?.is_virtual"
          @click="handleDeleteBooking"
          color="error"
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

    <!-- Edit Booking Modal -->
    <EditBookingModal
      v-model="showEditBookingModal"
      :booking="booking"
      @saved="handleBookingUpdated"
    />

    <!-- Redeem Modal -->
    <RedeemModal
      v-model="showRedeemModal"
      :student="selectedStudent"
      :class-info="getClassInfo(booking)"
      :booking-id="booking?.id"
      @redeem-completed="handleRedeemCompleted"
      @package-purchased="handlePackagePurchased"
    />
    </UiPageContainer>
  </NuxtLayout>
</template>

<script setup lang="ts">
const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const { getBookingById, deleteBooking, addStudentToBooking, removeStudentFromBooking, convertVirtualBookingToReal, updateBooking } = useBookings()
const { classes, loadClasses } = useClasses()
const { getStudentById } = useStudents()

// State
const loading = ref(true)
const booking = ref<any>(null)
const showAddStudentModal = ref(false)
const showEditBookingModal = ref(false)
const showRedeemModal = ref(false)
const selectedStudent = ref<any>(null)

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
const { locale } = useI18n()
// Format date
const formatDate = (dateString: string) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString(locale.value, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// Get status color
const getStatusColor = (status: string) => {
  switch (status) {
    case 'confirmed': return 'primary'
    case 'cancelled': return 'error'
    case 'completed': return 'info'
    case 'no_show': return 'warning'
    default: return 'neutral'
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

// Handle booking updated
const handleBookingUpdated = async (bookingId: string, updates: any) => {
  try {
    await updateBooking(bookingId, updates)
    await loadBooking()
  } catch (err) {
    console.error('Error updating booking:', err)
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

// Handle redeem
const handleRedeem = async(studentBooking: any) => {
  console.log("handleRedeem", studentBooking)
  const student = await getStudentById(studentBooking.student_id)
  // Find the student data

  selectedStudent.value = student
  showRedeemModal.value = true
}

// Handle redeem completed
const handleRedeemCompleted = async (data: any) => {
  showRedeemModal.value = false
  selectedStudent.value = null
  
  // Show success message
  const message = t('validation.booking.redeem.success', { 
    method: data.paymentMethod === 'credit' ? t('validation.booking.redeem.credit') : t('validation.booking.redeem.cash'),
    amount: data.amount
  })
  
  // Reload booking to refresh data
  await loadBooking()
}

// Handle package purchased
const handlePackagePurchased = async (studentPackage: any) => {
  // Package was purchased, modal will handle the rest
  console.log('Package purchased:', studentPackage)
}

// Get student actions for navigation menu
const getStudentActions = (studentBooking: any) => {
  return [
    {
      label: t('common.detail'),
      icon: 'i-heroicons-user',
      onSelect: () => {
        router.push(`/students/${studentBooking.student_id}`)
      }
    },
    {
      label: t('validation.booking.redeem.title'),
      icon: 'i-heroicons-credit-card',
      // disabled: studentBooking.status === 'completed',
      onSelect: () => handleRedeem(studentBooking)
    },
    {
      label: t('booking.removeStudent'),
      icon: 'i-heroicons-x-mark',
      disabled: studentBooking.status === 'completed',
      onSelect: () => handleRemoveStudent(studentBooking.student_id)
    }
  ]
}

// Navigate back
const navigateBack = () => {
  router.push({
      path: '/bookings'
    })
}

// Load booking on mount
onMounted(() => {
  loadBooking()
})
</script>