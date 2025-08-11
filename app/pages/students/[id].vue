<template>
  <NuxtLayout name="default">
    <template #header>
      <div class="flex items-center justify-between w-full">
        <div>
          <h1 class="text-xl font-semibold text-gray-900 dark:text-white">
            {{ t('student.detailTitle', { name: student?.name || '' }) }}
          </h1>
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
        :student-id="student.id"
        @add-package="showAddPackageModal = true"
        @edit-package="editStudentPackage"
        @delete-package="handleDeleteStudentPackage"
      />

      <!-- Recent Bookings -->
      <StudentBookingsCard
        :student-id="student.id"
        @view-booking="viewBooking"
      />

      <!-- Recent Transactions -->
      <StudentTransactionsCard
        :student-id="student.id"
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
const showAddPackageModal = ref(false)
const showEditStudentModal = ref(false)

// Composables
const { getStudentById, updateStudent } = useStudents()

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
  } catch (err) {
    error.value = t('common.errorLoading')
    console.error('Error loading student:', err)
  } finally {
    loading.value = false
  }
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
  // Refresh student data (for updated credits)
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
      // Refresh student data (for updated credits)
      await loadStudentData()
    } catch (err) {
      console.error('Error deleting student package:', err)
    }
  }
}

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
})
</script> 