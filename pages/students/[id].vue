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
          @click="navigateTo('/students')"
          variant="ghost"
          icon="i-heroicons-arrow-left"
          size="sm"
        >
          {{ t('common.back') }}
        </UButton>
      </div>
    </template>

    <div class="space-y-6 p-6">

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
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-semibold">{{ t('student.information') }}</h2>
            <UButton
              @click="editStudent"
              variant="ghost"
              size="sm"
              icon="i-heroicons-pencil-square"
            >
              {{ t('common.edit') }}
            </UButton>
          </div>
        </template>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="space-y-4">
            <div>
              <label class="text-sm font-medium text-gray-700 dark:text-gray-300">
                {{ t('student.name') }}
              </label>
              <p class="text-gray-900 dark:text-white">{{ student.name }}</p>
            </div>
            
            <div>
              <label class="text-sm font-medium text-gray-700 dark:text-gray-300">
                {{ t('student.phone') }}
              </label>
              <p class="text-gray-900 dark:text-white">{{ student.country_code }} {{ student.phone }}</p>
            </div>
            
            <div v-if="student.email">
              <label class="text-sm font-medium text-gray-700 dark:text-gray-300">
                {{ t('student.email') }}
              </label>
              <p class="text-gray-900 dark:text-white">{{ student.email }}</p>
            </div>
          </div>
          
          <div class="space-y-4">
            <div>
              <label class="text-sm font-medium text-gray-700 dark:text-gray-300">
                {{ t('student.credits') }}
              </label>
              <p class="text-gray-900 dark:text-white">{{ student.credits }}</p>
            </div>
            
            <div v-if="student.address">
              <label class="text-sm font-medium text-gray-700 dark:text-gray-300">
                {{ t('student.address') }}
              </label>
              <p class="text-gray-900 dark:text-white">{{ student.address }}</p>
            </div>
            
            <div v-if="student.notes">
              <label class="text-sm font-medium text-gray-700 dark:text-gray-300">
                {{ t('student.notes') }}
              </label>
              <p class="text-gray-900 dark:text-white">{{ student.notes }}</p>
            </div>
          </div>
        </div>
      </UCard>

      <!-- Student Packages -->
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-semibold">{{ t('student.packages') }}</h2>
            <UButton
              @click="showAddPackageModal = true"
              variant="solid"
              size="sm"
              icon="i-heroicons-plus"
            >
              {{ t('student.addPackage') }}
            </UButton>
          </div>
        </template>

        <!-- Package Filters -->
        <div class="mb-4 flex flex-wrap gap-2">
          <USelect
            v-model="packageFilter"
            :options="packageFilterOptions"
            placeholder="Filter packages"
            size="sm"
            class="w-48"
          />
          <UInput
            v-model="packageSearchQuery"
            :placeholder="t('student.searchPackages')"
            size="sm"
            class="w-64"
            icon="i-heroicons-magnifying-glass"
          />
        </div>

        <!-- Package List -->
        <div v-if="filteredStudentPackages.length > 0" class="space-y-3">
          <div
            v-for="studentPackage in filteredStudentPackages"
            :key="studentPackage.id"
            class="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <div class="flex items-center justify-between">
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-2">
                  <h3 class="font-medium text-gray-900 dark:text-white">
                    {{ studentPackage.package_name }}
                  </h3>
                  <UBadge
                    v-if="studentPackage.is_custom"
                    color="secondary"
                    variant="soft"
                    size="sm"
                  >
                    {{ t('student.customPackage') }}
                  </UBadge>
                  <UBadge
                    :color="getStatusColor(studentPackage.status)"
                    variant="soft"
                    size="sm"
                  >
                    {{ t(`student.packageStatus.${studentPackage.status}`) }}
                  </UBadge>
                </div>
                
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 dark:text-gray-400">
                  <div>
                    <span class="font-medium">{{ t('student.creditsPurchased') }}:</span>
                    {{ studentPackage.credits_purchased }}
                  </div>
                  <div>
                    <span class="font-medium">{{ t('student.creditsRemaining') }}:</span>
                    {{ studentPackage.credits_remaining }}
                  </div>
                  <div>
                    <span class="font-medium">{{ t('student.purchaseDate') }}:</span>
                    {{ formatDate(studentPackage.purchase_date) }}
                  </div>
                  <div>
                    <span class="font-medium">{{ t('student.expiryDate') }}:</span>
                    {{ formatDate(studentPackage.expiry_date) }}
                  </div>
                </div>
                
                <div v-if="studentPackage.notes" class="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  <span class="font-medium">{{ t('student.notes') }}:</span>
                  {{ studentPackage.notes }}
                </div>
              </div>
              
              <div class="flex gap-2 ml-4">
                <UButton
                  @click="editStudentPackage(studentPackage)"
                  variant="ghost"
                  size="sm"
                  icon="i-heroicons-pencil-square"
                  :aria-label="t('common.edit')"
                />
                <UButton
                  @click="deleteStudentPackage(studentPackage)"
                  variant="ghost"
                  size="sm"
                  color="error"
                  icon="i-heroicons-trash"
                  :aria-label="t('common.delete')"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else class="text-center py-8">
          <UIcon name="i-heroicons-cube" class="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {{ t('student.noPackages') }}
          </h3>
          <p class="text-gray-600 dark:text-gray-400 mb-4">
            {{ t('student.noPackagesMessage') }}
          </p>
          <UButton
            @click="showAddPackageModal = true"
            variant="solid"
            icon="i-heroicons-plus"
          >
            {{ t('student.addFirstPackage') }}
          </UButton>
        </div>
      </UCard>

      <!-- Booking Log (Placeholder) -->
      <UCard>
        <template #header>
          <h2 class="text-lg font-semibold">{{ t('student.bookingLog') }}</h2>
        </template>
        
        <div class="text-center py-8">
          <UIcon name="i-heroicons-calendar" class="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {{ t('student.bookingLogComingSoon') }}
          </h3>
          <p class="text-gray-600 dark:text-gray-400">
            {{ t('student.bookingLogMessage') }}
          </p>
        </div>
      </UCard>
    </div>

    <!-- Add Package Modal -->
    <AddPackageToStudent
      v-model="showAddPackageModal"
      :student="student"
      @package-added="handlePackageAdded"
    />

    <!-- Edit Student Modal -->
    <StudentForm
      v-model="showEditStudentModal"
      :student="student"
      @saved="handleStudentUpdated"
    />
  </div>
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
const showAddPackageModal = ref(false)
const showEditStudentModal = ref(false)
const packageFilter = ref('all')
const packageSearchQuery = ref('')

// Composables
const { getStudentById } = useStudents()
const { loadStudentPackagesByStudent } = useStudentPackages()

// Computed
const packageFilterOptions = computed(() => [
  { label: t('student.filterAll'), value: 'all' },
  { label: t('student.filterActive'), value: 'active' },
  { label: t('student.filterExpired'), value: 'expired' },
  { label: t('student.filterCompleted'), value: 'completed' }
])

const filteredStudentPackages = computed(() => {
  let filtered = studentPackages.value

  // Apply status filter
  if (packageFilter.value !== 'all') {
    filtered = filtered.filter(pkg => pkg.status === packageFilter.value)
  }

  // Apply search filter
  if (packageSearchQuery.value) {
    const query = packageSearchQuery.value.toLowerCase()
    filtered = filtered.filter(pkg => 
      pkg.package_name.toLowerCase().includes(query) ||
      pkg.notes?.toLowerCase().includes(query)
    )
  }

  return filtered
})

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

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active': return 'primary'
    case 'expired': return 'error'
    case 'completed': return 'info'
    default: return 'neutral'
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString()
}

const editStudent = () => {
  showEditStudentModal.value = true
}

const handleStudentUpdated = async (updatedStudent: any) => {
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

const deleteStudentPackage = async (studentPackage: any) => {
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

// Load data on mount
onMounted(() => {
  loadStudentData()
})
</script> 