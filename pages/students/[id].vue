<template>
  <NuxtLayout name="default">
    <template #header>
      <div class="flex items-center justify-between w-full">
        <div>
          <h1 class="text-xl font-semibold text-gray-900 dark:text-white">
            {{ t('student.detailTitle', { name: student?.name || '' }) }}
          </h1>
          <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {{ t('student.detailSubtitle') }}
          </p>
        </div>
        <UButton
          @click="$router.back()"
          variant="ghost"
          icon="i-heroicons-arrow-left"
          size="sm"
        >
          {{ t('common.back') }}
        </UButton>
      </div>
    </template>

    <UiPageContainer class="space-y-6">

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center py-12">
      <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 animate-spin text-primary-500" />
    </div>

    <!-- Error State -->
    <UAlert
      v-else-if="error"
      :title="t('common.error')"
      :description="error"
      color="error"
      variant="soft"
    />

    <!-- Student Information -->
    <div v-else-if="student" class="space-y-6">
      <!-- Student Info Card -->
      <StudentInfoCard 
        :student="student"
        @edit="editStudent"
      />

      <!-- Student Packages -->
      <StudentPackagesCard
        :student-packages="studentPackages"
        :package-filter="packageFilter"
        :package-search-query="packageSearchQuery"
        @add-package="showAddPackageModal = true"
        @edit-package="editStudentPackage"
        @delete-package="handleDeleteStudentPackage"
        @update:package-filter="packageFilter = $event"
        @update:package-search-query="packageSearchQuery = $event"
      />

      <!-- Recent Bookings -->
      <StudentBookingsCard
        :student-bookings="studentBookings"
        :classes="classes"
        :loading="bookingsLoading"
        @refresh="loadStudentBookings"
        @view-booking="viewBooking"
      />

      <!-- Recent Transactions -->
      <StudentTransactionsCard
        :student-transactions="studentTransactions"
        :loading="transactionsLoading"
        @refresh="loadStudentTransactions"
        @view-transaction="viewTransaction"
      />
    </div>

    <!-- Add Package Modal -->
    <AddPackageToStudent
      v-model="showAddPackageModal"
      :student="student"
      @saved="handlePackageAdded"
    />

    <!-- Edit Student Modal -->
    <StudentForm
      v-model="showEditStudentModal"
      :student="student"
      @saved="handleStudentUpdated"
    />
    </UiPageContainer>
  </NuxtLayout>
</template>

<script setup lang="ts">
const route = useRoute()
const { t } = useI18n()

// State
const loading = ref(true)
const error = ref('')
const student = ref<any>(null)
const studentPackages = ref<any[]>([])
const studentBookings = ref<any[]>([])
const studentTransactions = ref<any[]>([])
const showAddPackageModal = ref(false)
const showEditStudentModal = ref(false)
const packageFilter = ref('all')
const packageSearchQuery = ref('')
const bookingsLoading = ref(false)
const transactionsLoading = ref(false)

// Composables
const { getStudentById, updateStudent } = useStudents()
const { loadStudentPackagesByStudent } = useStudentPackages()
const { getBookingsByStudent } = useBookings()
const { getTransactionsByStudent } = useTransactions()
const { classes, loadClasses } = useClasses()

// Computed - removed as it's now handled by StudentPackagesCard component

// Methods
const loadStudentData = async () => {
  try {
    loading.value = true
    error.value = ''
    
    const studentId = route.params.id as string
    const studentData = await getStudentById(studentId)
    
    if (!studentData) {
      error.value = t('student.notFound')
      return
    }
    
    student.value = studentData
    await loadStudentPackages()
  } catch (err) {
    error.value = t('common.errorLoading')
    console.error('Error loading student:', err)
  } finally {
    loading.value = false
  }
}

const loadStudentPackages = async () => {
  if (!student.value) return
  
  try {
    const packages = await loadStudentPackagesByStudent(student.value.id)
    studentPackages.value = packages
  } catch (err) {
    console.error('Error loading student packages:', err)
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString()
}

const editStudent = () => {
  showEditStudentModal.value = true
}

const handleStudentUpdated = async (updatedStudent: any) => {
  await updateStudent(student.value.id, updatedStudent)
  student.value = updatedStudent
  showEditStudentModal.value = false
}

const handlePackageAdded = async () => {
  showAddPackageModal.value = false
  // Refresh both student data (for updated credits) and packages
  await loadStudentData()
}

const editStudentPackage = (studentPackage: any) => {
  // TODO: Implement edit student package functionality
  console.log('Edit student package:', studentPackage)
}

const handleDeleteStudentPackage = async (studentPackage: any) => {
  if (confirm(t('student.deletePackageConfirm', { name: studentPackage.package_name }))) {
    try {
      const { deleteStudentPackage } = useStudentPackages()
      await deleteStudentPackage(studentPackage.id)
      // Refresh both student data (for updated credits) and packages
      await loadStudentData()
    } catch (err) {
      console.error('Error deleting student package:', err)
    }
  }
}

// Load student bookings
const loadStudentBookings = async () => {
  if (!student.value) return
  
  try {
    bookingsLoading.value = true
    const bookings = await getBookingsByStudent(student.value.id, 10)
    studentBookings.value = bookings
  } catch (err) {
    console.error('Error loading student bookings:', err)
  } finally {
    bookingsLoading.value = false
  }
}

// Load student transactions
const loadStudentTransactions = async () => {
  if (!student.value) return
  
  try {
    transactionsLoading.value = true
    const transactions = await getTransactionsByStudent(student.value.id, 10)
    studentTransactions.value = transactions
  } catch (err) {
    console.error('Error loading student transactions:', err)
  } finally {
    transactionsLoading.value = false
  }
}

// Utility functions - removed as they're now handled by individual components

// View booking details
const viewBooking = (booking: any) => {
  // TODO: Navigate to booking detail page
  console.log('View booking:', booking)
}

// View transaction details
const viewTransaction = (transaction: any) => {
  // TODO: Navigate to transaction detail page
  console.log('View transaction:', transaction)
}

// Load data on mount
onMounted(() => {
  loadStudentData()
  loadStudentBookings()
  loadStudentTransactions()
})
</script> 