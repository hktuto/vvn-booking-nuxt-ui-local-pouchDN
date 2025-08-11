<template>
  <UCard>
    <template #header>
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-semibold">{{ t('transactions.recentTransactions') }}</h2>
        <UButton
          @click="loadTransactions"
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

    <!-- Transactions Table -->
    <div v-else-if="transactions.length > 0" class="overflow-x-auto">
      <UTable
        :data="paginatedTransactions"
        :columns="columns"
        :loading="loading"
      />
      
      <!-- Pagination -->
      <div class="flex items-center justify-between mt-4">
        <div class="text-sm text-gray-600 dark:text-gray-400">
          {{ t('common.showing', { from: paginationStart + 1, to: paginationEnd, total: transactions.length }) }}
        </div>
        <UPagination
          v-model="currentPage"
          :page-count="pageCount"
          :total="transactions.length"
        />
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-8">
      <UIcon name="i-heroicons-credit-card" class="w-12 h-12 mx-auto text-gray-400 mb-4" />
      <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
        {{ t('student.noTransactions') }}
      </h3>
      <p class="text-gray-600 dark:text-gray-400">
        {{ t('student.noTransactionsMessage') }}
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
  (e: 'view-transaction', transaction: any): void
}

const props = withDefaults(defineProps<Props>(), {
  limit: 10
})
const emit = defineEmits<Emits>()

const { t } = useI18n()
const { getTransactionsByStudent } = useTransactions()

// State
const loading = ref(false)
const transactions = ref<any[]>([])
const currentPage = ref(1)
const pageSize = ref(10)

// Table columns
const columns = computed(() => [
  {
    accessorKey: 'description',
    header: t('transactions.description')
  },
  {
    accessorKey: 'status',
    header: t('transactions.status')
  },
  {
    accessorKey: 'transaction_type',
    header: t('transactions.typelabel')
  },
  {
    accessorKey: 'amount',
    header: t('transactions.amount')
  },
  {
    accessorKey: 'created_at',
    header: t('transactions.date')
  },
  {
    accessorKey: 'payment_method',
    header: t('transactions.paymentMethodLabel')
  },
  {
    accessorKey: 'actions',
    header: t('transactions.actions')
  }
])

// Pagination computed
const pageCount = computed(() => Math.ceil(transactions.value.length / pageSize.value))
const paginationStart = computed(() => (currentPage.value - 1) * pageSize.value)
const paginationEnd = computed(() => Math.min(paginationStart.value + pageSize.value, transactions.value.length))
const paginatedTransactions = computed(() => {
  const start = paginationStart.value
  const end = paginationStart.value + pageSize.value
  return transactions.value.slice(start, end)
})

// Methods
const loadTransactions = async () => {
  if (!props.studentId) return
  
  try {
    loading.value = true
    const data = await getTransactionsByStudent(props.studentId, props.limit)
    transactions.value = data
  } catch (err) {
    console.error('Error loading transactions:', err)
  } finally {
    loading.value = false
  }
}

const getTransactionStatusColor = (status: string) => {
  switch (status) {
    case 'completed': return 'success'
    case 'pending': return 'warning'
    case 'cancelled': return 'error'
    case 'refunded': return 'info'
    default: return 'neutral'
  }
}

const getTransactionTypeColor = (type: string) => {
  switch (type) {
    case 'package_purchase': return 'primary'
    case 'credit_usage': return 'success'
    case 'cash_payment': return 'warning'
    case 'refund': return 'info'
    default: return 'neutral'
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString()
}

// Load data on mount
onMounted(() => {
  loadTransactions()
})

// Watch for studentId changes
watch(() => props.studentId, () => {
  if (props.studentId) {
    loadTransactions()
    currentPage.value = 1
  }
})
</script> 