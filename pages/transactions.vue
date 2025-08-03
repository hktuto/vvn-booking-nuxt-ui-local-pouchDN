<template>
  <NuxtLayout>
    <!-- Header -->
    <template #header>
      <div class="flex items-center justify-between w-full">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
            {{ t('transactions.title') }}
          </h1>
          <p class="text-gray-600 dark:text-gray-400">
            {{ t('transactions.description') }}
          </p>
        </div>
        <UButton
          @click="exportTransactions"
          variant="outline"
          icon="i-heroicons-arrow-down-tray"
          :loading="exporting"
        >
          {{ t('transactions.export') }}
        </UButton>
      </div>
    </template>

    <!-- Filters Section -->
    <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
      <div class="flex flex-col lg:flex-row gap-4">
        <!-- Date Range Filter -->
        <div class="flex-1">
          <label class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
            {{ t('transactions.dateRange') }}
          </label>
          <div class="flex gap-2">
            <UiDatePicker v-model="filters.value.startDate" class="flex-1" />
            <UiDatePicker v-model="filters.value.endDate" class="flex-1" />
          </div>
        </div>

        <!-- Transaction Type Filter -->
        <!-- add a row to wrap transaction type and student filter -->
        <div class="flex flex-row gap-2">
        <div class="flex-1">
          <label class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
            {{ t('transactions.transactionType') }}
          </label>
          <USelect
            v-model="filters.value.transactionType"
            :items="transactionTypeOptions"
            :placeholder="t('transactions.allTypes')"
            class="w-full"
          />
        </div>

        <!-- Student Filter -->
        <div class="flex-1">
          <label class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
            {{ t('transactions.student') }}
          </label>
            <USelect
              v-model="filters.value.studentId"
              :items="studentOptions"
              :placeholder="t('transactions.allStudents')"
              class="w-full"
            />
        </div>
        </div>

        <!-- Clear Filters -->
        <div class="flex items-end">
          <UButton
            @click="clearFilters"
            variant="ghost"
            icon="i-heroicons-x-mark"
            :disabled="!hasActiveFilters"
          >
            {{ t('transactions.clearFilters') }}
          </UButton>
        </div>
      </div>
    </div>

    <!-- Statistics Cards -->
    <div class="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-2 mb-6">
      <UCard>
        <div class="flex items-center">
          <div class="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
            <UIcon name="i-heroicons-arrow-up" class="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600 dark:text-gray-400">
              {{ t('transactions.totalRevenue') }}
            </p>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">
              ${{ stats.totalRevenue.toFixed(2) }}
            </p>
          </div>
        </div>
      </UCard>

      <UCard>
        <div class="flex items-center">
          <div class="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
            <UIcon name="i-heroicons-arrow-down" class="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600 dark:text-gray-400">
              {{ t('transactions.totalRefunds') }}
            </p>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">
              ${{ stats.totalRefunds.toFixed(2) }}
            </p>
          </div>
        </div>
      </UCard>

      <UCard>
        <div class="flex items-center">
          <div class="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
            <UIcon name="i-heroicons-currency-dollar" class="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600 dark:text-gray-400">
              {{ t('transactions.netRevenue') }}
            </p>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">
              ${{ stats.netRevenue.toFixed(2) }}
            </p>
          </div>
        </div>
      </UCard>

      <UCard>
        <div class="flex items-center">
          <div class="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
            <UIcon name="i-heroicons-document-text" class="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600 dark:text-gray-400">
              {{ t('transactions.totalTransactions') }}
            </p>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">
              {{ stats.totalTransactions }}
            </p>
          </div>
        </div>
      </UCard>
    </div>

    <!-- Transactions List -->
    <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <div class="p-6 border-b border-gray-200 dark:border-gray-700">
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
            {{ t('transactions.recentTransactions') }}
          </h2>
          <div class="flex items-center gap-2">
            <USelect
              v-model="sortBy"
              :items="sortOptions"
              size="sm"
            />
            <UButton
              @click="refreshTransactions"
              variant="ghost"
              icon="i-heroicons-arrow-path"
              :loading="loading"
              size="sm"
            />
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="p-12 text-center">
        <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 animate-spin text-gray-400 mx-auto mb-4" />
        <p class="text-gray-600 dark:text-gray-400">{{ t('common.loading') }}</p>
      </div>

      <!-- Transactions Table -->
      <div v-else-if="transactions.length > 0" class="overflow-x-auto w-full">
      <UTable
        
        :data="transactions"
        :columns="columns"
        :loading="loading"
        class="flex-1"
      >
        <template #student_id-data="{ row }">
          <div class="flex items-center">
            <div class="w-8 h-8 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
              <UIcon name="i-heroicons-user" class="w-4 h-4 text-primary-600 dark:text-primary-400" />
            </div>
            <div class="ml-3">
              <div class="text-sm font-medium text-gray-900 dark:text-white">
                {{ getStudentName(row.student_id) }}
              </div>
            </div>
          </div>
        </template>

        <template #transaction_type-data="{ row }">
          <UBadge
            :color="getTransactionTypeColor(row.transaction_type)"
            variant="soft"
          >
            {{ t(`transactions.types.${row.transaction_type}`) }}
          </UBadge>
        </template>

        <template #description-data="{ row }">
          <div class="max-w-xs truncate" :title="row.description">
            {{ row.description }}
          </div>
          <div v-if="row.notes" class="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {{ row.notes }}
          </div>
        </template>

        <template #amount-data="{ row }">
          <span :class="row.amount >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'">
            {{ row.amount >= 0 ? '+' : '' }}${{ row.amount.toFixed(2) }}
          </span>
        </template>

        <template #status-data="{ row }">
          <UBadge
            :color="getStatusColor(row.status)"
            variant="soft"
          >
            {{ t(`transactions.status.${row.status}`) }}
          </UBadge>
        </template>

        <template #actions-data="{ row }">
          <UButton
            @click="viewTransactionDetails(row)"
            variant="ghost"
            size="sm"
            icon="i-heroicons-eye"
          >
            {{ t('transactions.view') }}
          </UButton>
        </template>
      </UTable>
      </div>
      <!-- Empty State -->
      <div v-else class="p-12 text-center">
        <UIcon name="i-heroicons-document-text" class="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
          {{ t('transactions.noTransactions') }}
        </h3>
        <p class="text-gray-600 dark:text-gray-400 mb-4">
          {{ t('transactions.noTransactionsDescription') }}
        </p>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { CalendarDate, DateFormatter, getLocalTimeZone } from '@internationalized/date'
const { t, locale } = useI18n()
const { getRecentTransactions, getTransactionStats, getTransactionsByStudent, getTransactionsByDateRange } = useTransactions()
const { students, loadStudents } = useStudents()
const { filters, hasActiveFilters, clearFilters: clearFiltersComposable } = useTransactionFilters()

const df = new DateFormatter(locale.value === 'zh-Hant' ? 'zh-HK' : 'en-US', {
  dateStyle: 'medium'
})

// State
const loading = ref(false)
const exporting = ref(false)
const transactions = ref<any[]>([])
const stats = ref({
  totalRevenue: 0,
  totalRefunds: 0,
  netRevenue: 0,
  totalTransactions: 0
})

// Sort
const sortBy = ref('date-desc')

const transactionTypeOptions = [
  { label: t('transactions.types.package_purchase'), value: 'package_purchase' },
  { label: t('transactions.types.credit_usage'), value: 'credit_usage' },
  { label: t('transactions.types.cash_payment'), value: 'cash_payment' },
  { label: t('transactions.types.refund'), value: 'refund' }
]

const studentOptions = computed(() => {
  return students.value.map(student => ({
    label: student.name,
    value: student.id
  }))
})

const sortOptions = [
  { label: t('transactions.sort.dateDesc'), value: 'date-desc' },
  { label: t('transactions.sort.dateAsc'), value: 'date-asc' },
  { label: t('transactions.sort.amountDesc'), value: 'amount-desc' },
  { label: t('transactions.sort.amountAsc'), value: 'amount-asc' }
]

// Table columns configuration
const columns = [
  {
    accessorKey: 'created_at',
    header: t('transactions.date'),
    sortable: true
  },
  {
    accessorKey: 'student_id',
    header: t('transactions.student'),
    sortable: true
  },
  {
    accessorKey: 'transaction_type',
    header: t('transactions.type'),
    sortable: true
  },
  {
    accessorKey: 'description',
    header: t('transactions.description'),
    sortable: false
  },
  {
    accessorKey: 'amount',
    header: t('transactions.amount'),
    sortable: true
  },
  {
    accessorKey: 'status',
    header: t('transactions.status'),
    sortable: true
  },
  {
    accessorKey: 'actions',
    header: t('transactions.actions'),
    sortable: false
  }
]

// Methods
const loadTransactions = async () => {
  loading.value = true
  
  try {
    // Load transactions based on filters
    let transactionsData: any[] = []
    
    if (filters.value.studentId) {
      transactionsData = await getTransactionsByStudent(filters.value.studentId)
    } else if (filters.value.startDate && filters.value.endDate) {
      transactionsData = await getTransactionsByDateRange(filters.value.startDate, filters.value.endDate)
    } else {
      transactionsData = await getRecentTransactions(100)
    }
    
    // Filter by transaction type if specified
    if (filters.value.transactionType) {
      transactionsData = transactionsData.filter(t => t.transaction_type === filters.value.transactionType)
    }
    
    // Sort transactions
    transactionsData = sortTransactions(transactionsData, sortBy.value)
    
    transactions.value = transactionsData
    
    // Load statistics
    const statsData = await getTransactionStats(filters.value.startDate, filters.value.endDate)
    stats.value = statsData
  } catch (error) {
    console.error('Error loading transactions:', error)
  } finally {
    loading.value = false
  }
}

const sortTransactions = (data: any[], sortBy: string) => {
  return [...data].sort((a, b) => {
    switch (sortBy) {
      case 'date-desc':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      case 'date-asc':
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      case 'amount-desc':
        return b.amount - a.amount
      case 'amount-asc':
        return a.amount - b.amount
      default:
        return 0
    }
  })
}

const clearFilters = () => {
  clearFiltersComposable()
  loadTransactions()
}

const refreshTransactions = () => {
  loadTransactions()
}

const exportTransactions = async () => {
  exporting.value = true
  
  try {
    // Create CSV content
    const headers = ['Date', 'Student', 'Type', 'Description', 'Amount', 'Status', 'Notes']
    const csvContent = [
      headers.join(','),
      ...transactions.value.map(t => [
        formatDate(t.created_at),
        getStudentName(t.student_id),
        t(`transactions.types.${t.transaction_type}`),
        `"${t.description}"`,
        t.amount,
        t(`transactions.status.${t.status}`),
        `"${t.notes || ''}"`
      ].join(','))
    ].join('\n')
    
    // Download file
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Error exporting transactions:', error)
  } finally {
    exporting.value = false
  }
}

const getStudentName = (studentId: string) => {
  const student = students.value.find(s => s.id === studentId)
  return student?.name || 'Unknown Student'
}

const getTransactionTypeColor = (type: string) => {
  switch (type) {
    case 'package_purchase': return 'success'
    case 'credit_usage': return 'info'
    case 'cash_payment': return 'primary'
    case 'refund': return 'warning'
    default: return 'neutral'
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed': return 'success'
    case 'pending': return 'warning'
    case 'cancelled': return 'error'
    case 'refunded': return 'info'
    default: return 'neutral'
  }
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const viewTransactionDetails = (transaction: any) => {
  // Navigate to transaction detail page
  navigateTo(`/transactions/${transaction.id}`)
}

// Watchers
watch([filters, sortBy], () => {
  loadTransactions()
}, { deep: true })

// Load data on mount
onMounted(async () => {
  await loadStudents()
  await loadTransactions()
})
</script>