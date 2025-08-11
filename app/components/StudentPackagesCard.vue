<template>
  <UCard>
    <template #header>
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-semibold">{{ t('student.packages') }}</h2>
        <UButton
          @click="$emit('add-package')"
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

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center py-8">
      <UIcon name="i-heroicons-arrow-path" class="w-6 h-6 animate-spin text-primary-500" />
    </div>

    <!-- Package Table -->
    <div v-else-if="filteredStudentPackages.length > 0" class="overflow-x-auto">
      <UTable
        :data="paginatedStudentPackages"
        :columns="columns"
        :loading="loading"
      />
      
      <!-- Pagination -->
      <div class="flex items-center justify-between mt-4">
        <div class="text-sm text-gray-600 dark:text-gray-400">
          {{ t('common.showing', { from: paginationStart + 1, to: paginationEnd, total: filteredStudentPackages.length }) }}
        </div>
        <UPagination
          v-model="currentPage"
          :page-count="pageCount"
          :total="filteredStudentPackages.length"
        />
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
        @click="$emit('add-package')"
        variant="solid"
        icon="i-heroicons-plus"
      >
        {{ t('student.addFirstPackage') }}
      </UButton>
    </div>
  </UCard>
</template>

<script setup lang="ts">
interface Props {
  studentId: string
}

interface Emits {
  (e: 'add-package'): void
  (e: 'edit-package', studentPackage: any): void
  (e: 'delete-package', studentPackage: any): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const { t } = useI18n()
const { loadStudentPackagesByStudent } = useStudentPackages()

// State
const loading = ref(false)
const studentPackages = ref<any[]>([])
const packageFilter = ref('all')
const packageSearchQuery = ref('')
const currentPage = ref(1)
const pageSize = ref(10)

// Table columns
const columns = computed(() => [
  {
    accessorKey: 'package_name',
    header: t('student.packageNamePreview')
  },
  {
    accessorKey: 'status',
    header: t('transactions.status')
  },
  {
    accessorKey: 'credits_purchased',
    header: t('student.creditsPurchased')
  },
  {
    accessorKey: 'credits_remaining',
    header: t('student.creditsRemaining')
  },
  {
    accessorKey: 'purchase_date',
    header: t('student.purchaseDate')
  },
  {
    accessorKey: 'expiry_date',
    header: t('student.expiryDate')
  },
  {
    accessorKey: 'actions',
    header: t('transactions.actions')
  }
])

// Pagination computed
const pageCount = computed(() => Math.ceil(filteredStudentPackages.value.length / pageSize.value))
const paginationStart = computed(() => (currentPage.value - 1) * pageSize.value)
const paginationEnd = computed(() => Math.min(paginationStart.value + pageSize.value, filteredStudentPackages.value.length))
const paginatedStudentPackages = computed(() => {
  const start = paginationStart.value
  const end = paginationStart.value + pageSize.value
  return filteredStudentPackages.value.slice(start, end)
})

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
const loadStudentPackages = async () => {
  if (!props.studentId) return
  
  try {
    loading.value = true
    const data = await loadStudentPackagesByStudent(props.studentId)
    studentPackages.value = data
  } catch (err) {
    console.error('Error loading student packages:', err)
  } finally {
    loading.value = false
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

// Load data on mount
onMounted(() => {
  loadStudentPackages()
})

// Watch for studentId changes
watch(() => props.studentId, () => {
  if (props.studentId) {
    loadStudentPackages()
  }
})

// Watch for filter changes and reset pagination
watch([packageFilter, packageSearchQuery], () => {
  currentPage.value = 1
})
</script> 