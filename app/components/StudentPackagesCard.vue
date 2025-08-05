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
              @click="$emit('edit-package', studentPackage)"
              variant="ghost"
              size="sm"
              icon="i-heroicons-pencil-square"
              :aria-label="t('common.edit')"
            />
            <UButton
              @click="$emit('delete-package', studentPackage)"
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
  studentPackages: any[]
}
const packageFilter = defineModel<string>('packageFilter', {
  required: true,
  default: 'all'
})
const packageSearchQuery = defineModel<string>('packageSearchQuery', {
  required: true,
  default: ''
})
interface Emits {
  (e: 'add-package'): void
  (e: 'edit-package', studentPackage: any): void
  (e: 'delete-package', studentPackage: any): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const { t } = useI18n()

// Computed
const packageFilterOptions = computed(() => [
  { label: t('student.filterAll'), value: 'all' },
  { label: t('student.filterActive'), value: 'active' },
  { label: t('student.filterExpired'), value: 'expired' },
  { label: t('student.filterCompleted'), value: 'completed' }
])

const filteredStudentPackages = computed(() => {
  let filtered = props.studentPackages

  // Apply status filter
  if (props.packageFilter !== 'all') {
    filtered = filtered.filter(pkg => pkg.status === props.packageFilter)
  }

  // Apply search filter
  if (props.packageSearchQuery) {
    const query = props.packageSearchQuery.toLowerCase()
    filtered = filtered.filter(pkg => 
      pkg.package_name.toLowerCase().includes(query) ||
      pkg.notes?.toLowerCase().includes(query)
    )
  }

  return filtered
})

// Methods
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
</script> 