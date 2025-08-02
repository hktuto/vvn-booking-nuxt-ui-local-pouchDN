<template>
  <NuxtLayout name="default">
    <template #header>
      <div class="flex items-center justify-between w-full">
        <div>
          <h1 class="text-xl font-semibold text-gray-900 dark:text-white">
            {{ $t('transactions.title') }}
          </h1>
          <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {{ $t('transactions.description') }}
          </p>
        </div>
        <UButton
          @click="showTransactionModal = true"
          icon="i-heroicons-plus"
          size="sm"
        >
          {{ $t('transactions.addTransaction') }}
        </UButton>
      </div>
    </template>

    <div class="p-6">

    <!-- Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-base font-semibold text-gray-900 dark:text-white">
              {{ $t('transactions.totalRevenue') }}
            </h3>
            <UIcon name="i-heroicons-banknotes" class="h-6 w-6 text-green-500" />
          </div>
        </template>
        <div>
          <p class="text-3xl font-bold text-green-600">${{ totalRevenue.toFixed(2) }}</p>
          <p class="text-sm text-gray-500 mt-1">
            {{ $t('transactions.allTime') }}
          </p>
        </div>
      </UCard>

      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-base font-semibold text-gray-900 dark:text-white">
              {{ $t('transactions.monthlyRevenue') }}
            </h3>
            <UIcon name="i-heroicons-calendar" class="h-6 w-6 text-blue-500" />
          </div>
        </template>
        <div>
          <p class="text-3xl font-bold text-blue-600">${{ monthlyRevenue.toFixed(2) }}</p>
          <p class="text-sm text-gray-500 mt-1">
            {{ $t('transactions.thisMonth') }}
          </p>
        </div>
      </UCard>

      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-base font-semibold text-gray-900 dark:text-white">
              {{ $t('transactions.totalCredits') }}
            </h3>
            <UIcon name="i-heroicons-star" class="h-6 w-6 text-yellow-500" />
          </div>
        </template>
        <div>
          <p class="text-3xl font-bold text-yellow-600">{{ totalCredits }}</p>
          <p class="text-sm text-gray-500 mt-1">
            {{ $t('transactions.sold') }}
          </p>
        </div>
      </UCard>

      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-base font-semibold text-gray-900 dark:text-white">
              {{ $t('transactions.pendingPayments') }}
            </h3>
            <UIcon name="i-heroicons-clock" class="h-6 w-6 text-orange-500" />
          </div>
        </template>
        <div>
          <p class="text-3xl font-bold text-orange-600">${{ pendingPayments.toFixed(2) }}</p>
          <p class="text-sm text-gray-500 mt-1">
            {{ $t('transactions.toCollect') }}
          </p>
        </div>
      </UCard>
    </div>

    <!-- Filters -->
    <UCard class="mb-6">
      <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
        <UFormGroup :label="$t('transactions.filterByType')">
          <USelect
            v-model="filters.type"
            :options="typeOptions"
            option-attribute="label"
            value-attribute="value"
            :placeholder="$t('transactions.allTypes')"
            clearable
          />
        </UFormGroup>
        
        <UFormGroup :label="$t('transactions.filterByStudent')">
          <USelect
            v-model="filters.student_id"
            :options="studentOptions"
            option-attribute="label"
            value-attribute="value"
            :placeholder="$t('transactions.allStudents')"
            clearable
          />
        </UFormGroup>
        
        <UFormGroup :label="$t('transactions.filterByPaymentMethod')">
          <USelect
            v-model="filters.payment_method"
            :options="paymentMethodOptions"
            option-attribute="label"
            value-attribute="value"
            :placeholder="$t('transactions.allMethods')"
            clearable
          />
        </UFormGroup>
        
        <UFormGroup :label="$t('transactions.filterByDateFrom')">
          <UInput
            v-model="filters.date_from"
            type="date"
            clearable
          />
        </UFormGroup>
        
        <UFormGroup :label="$t('transactions.filterByDateTo')">
          <UInput
            v-model="filters.date_to"
            type="date"
            clearable
          />
        </UFormGroup>
      </div>
    </UCard>

    <!-- Transactions Table -->
    <UCard>
      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            {{ $t('transactions.recentTransactions') }}
          </h3>
          <div class="flex items-center gap-2">
            <UButton
              @click="exportTransactions"
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
        :rows="filteredTransactions"
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

        <template #type-data="{ row }">
          <UBadge :color="getTypeColor(row.type)">
            {{ $t(`transactions.type.${row.type}`) }}
          </UBadge>
        </template>

        <template #amount-data="{ row }">
          <span class="font-medium text-gray-900 dark:text-white">
            ${{ row.amount.toFixed(2) }}
          </span>
        </template>

        <template #credit-change-data="{ row }">
          <span :class="row.credit_change >= 0 ? 'text-green-600' : 'text-red-600'" class="font-medium">
            {{ row.credit_change >= 0 ? '+' : '' }}{{ row.credit_change }} {{ $t('common.credits') }}
          </span>
        </template>

        <template #payment_method-data="{ row }">
          <UBadge :color="getPaymentMethodColor(row.payment_method)">
            {{ $t(`transactions.paymentMethod.${row.payment_method}`) }}
          </UBadge>
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
    <TransactionModal 
      v-model:open="showTransactionModal"
      :transaction="editingTransaction"
      @saved="onTransactionSaved"
    />
  </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
const { t } = useI18n()

// Mock data - replace with real composables
const transactions = ref([
  {
    id: '1',
    student: { name: 'John Doe', phone: '+1 234 567 8900' },
    type: 'package_purchase',
    amount: 50.00,
    credit_change: 10,
    payment_method: 'cash',
    payment_note: 'Payment received',
    reference_number: 'REF001',
    created_at: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    student: { name: 'Jane Smith', phone: '+1 234 567 8901' },
    type: 'class_credit',
    amount: 0,
    credit_change: -2,
    payment_method: 'other',
    payment_note: 'Class attendance',
    reference_number: null,
    created_at: '2024-01-16T09:00:00Z'
  }
])

const students = ref([
  { id: '1', name: 'John Doe', phone: '+1 234 567 8900' },
  { id: '2', name: 'Jane Smith', phone: '+1 234 567 8901' }
])

// State
const loading = ref(false)
const showTransactionModal = ref(false)
const editingTransaction = ref(null)

const filters = ref({
  type: '',
  student_id: '',
  payment_method: '',
  date_from: '',
  date_to: ''
})

// Computed
const typeOptions = computed(() => [
  { label: t('transactions.type.package_purchase'), value: 'package_purchase' },
  { label: t('transactions.type.class_credit'), value: 'class_credit' },
  { label: t('transactions.type.manual_adjustment'), value: 'manual_adjustment' }
])

const studentOptions = computed(() => 
  students.value.map(s => ({
    label: `${s.name} (${s.phone})`,
    value: s.id
  }))
)

const paymentMethodOptions = computed(() => [
  { label: t('transactions.paymentMethod.cash'), value: 'cash' },
  { label: t('transactions.paymentMethod.bank_transfer'), value: 'bank_transfer' },
  { label: t('transactions.paymentMethod.other'), value: 'other' }
])

const filteredTransactions = computed(() => {
  let filtered = transactions.value

  if (filters.value.type) {
    filtered = filtered.filter(t => t.type === filters.value.type)
  }

  if (filters.value.student_id) {
    filtered = filtered.filter(t => t.student?.id === filters.value.student_id)
  }

  if (filters.value.payment_method) {
    filtered = filtered.filter(t => t.payment_method === filters.value.payment_method)
  }

  if (filters.value.date_from) {
    filtered = filtered.filter(t => t.created_at >= filters.value.date_from)
  }

  if (filters.value.date_to) {
    filtered = filtered.filter(t => t.created_at <= filters.value.date_to)
  }

  return filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
})

const totalRevenue = computed(() => 
  transactions.value
    .filter(t => t.type === 'package_purchase')
    .reduce((sum, t) => sum + t.amount, 0)
)

const monthlyRevenue = computed(() => {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  
  return transactions.value
    .filter(t => t.type === 'package_purchase' && new Date(t.created_at) >= startOfMonth)
    .reduce((sum, t) => sum + t.amount, 0)
})

const totalCredits = computed(() => 
  transactions.value
    .filter(t => t.type === 'package_purchase')
    .reduce((sum, t) => sum + t.credit_change, 0)
)

const pendingPayments = computed(() => 
  transactions.value
    .filter(t => t.type === 'package_purchase' && t.payment_method === 'other')
    .reduce((sum, t) => sum + t.amount, 0)
)

const columns = computed(() => [
  {
    key: 'student',
    label: t('transactions.student'),
    sortable: true
  },
  {
    key: 'type',
    label: t('transactions.type'),
    sortable: true
  },
  {
    key: 'amount',
    label: t('transactions.amount'),
    sortable: true
  },
  {
    key: 'credit_change',
    label: t('transactions.creditChange'),
    sortable: true
  },
  {
    key: 'payment_method',
    label: t('transactions.paymentMethod'),
    sortable: true
  },
  {
    key: 'created_at',
    label: t('transactions.date'),
    sortable: true
  },
  {
    key: 'actions',
    label: t('common.actions')
  }
])

// Methods
const getTypeColor = (type: string) => {
  const colors = {
    package_purchase: 'green',
    class_credit: 'blue',
    manual_adjustment: 'yellow'
  }
  return colors[type] || 'gray'
}

const getPaymentMethodColor = (method: string) => {
  const colors = {
    cash: 'green',
    bank_transfer: 'blue',
    other: 'orange'
  }
  return colors[method] || 'gray'
}

const getActionItems = (transaction: any) => [
  {
    label: t('transactions.viewDetails'),
    icon: 'i-heroicons-eye',
    click: () => viewTransaction(transaction)
  },
  {
    label: t('transactions.editTransaction'),
    icon: 'i-heroicons-pencil-square',
    click: () => editTransaction(transaction)
  },
  {
    label: t('transactions.printReceipt'),
    icon: 'i-heroicons-printer',
    click: () => printReceipt(transaction),
    disabled: transaction.type !== 'package_purchase'
  }
]

const viewTransaction = (transaction: any) => {
  // Navigate to transaction details
  navigateTo(`/transactions/${transaction.id}`)
}

const editTransaction = (transaction: any) => {
  editingTransaction.value = transaction
  showTransactionModal.value = true
}

const printReceipt = (transaction: any) => {
  // TODO: Implement receipt printing
  console.log('Printing receipt for transaction:', transaction.id)
}

const exportTransactions = () => {
  // TODO: Implement export functionality
  console.log('Exporting transactions...')
}

const onTransactionSaved = () => {
  showTransactionModal.value = false
  editingTransaction.value = null
}

definePageMeta({
  middleware: 'auth'
})
</script>