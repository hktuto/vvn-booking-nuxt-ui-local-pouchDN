import { computed } from 'vue'

export interface TransactionFilters {
  startDate: string
  endDate: string
  transactionType: string
  studentId: string
}

// Move useState outside the composable to prevent memory trapping
const useTransactionFilterState = () => useState<TransactionFilters>('transaction-filters', () => {
  // Get current month start and end dates
  const getCurrentMonthDates = () => {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    
    return {
      startDate: startOfMonth.toISOString().split('T')[0],
      endDate: endOfMonth.toISOString().split('T')[0]
    }
  }

  const { startDate: defaultStartDate, endDate: defaultEndDate } = getCurrentMonthDates()

  return {
    startDate: defaultStartDate,
    endDate: defaultEndDate,
    transactionType: '',
    studentId: ''
  }
})

export const useTransactionFilters = () => {
  // Get current month start and end dates
  const getCurrentMonthDates = () => {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    
    return {
      startDate: startOfMonth.toISOString().split('T')[0],
      endDate: endOfMonth.toISOString().split('T')[0]
    }
  }

  const { startDate: defaultStartDate, endDate: defaultEndDate } = getCurrentMonthDates()

  // Use the state from outside the composable
  const filters = useTransactionFilterState()

  // Computed properties
  const hasActiveFilters = computed(() => {
    return filters.value.startDate || 
           filters.value.endDate || 
           filters.value.transactionType || 
           filters.value.studentId
  })

  const isDefaultDateRange = computed(() => {
    return filters.value.startDate === defaultStartDate && 
           filters.value.endDate === defaultEndDate
  })

  // Methods
  const setFilters = (newFilters: Partial<TransactionFilters>) => {
    filters.value = { ...filters.value, ...newFilters }
  }

  const clearFilters = () => {
    filters.value = {
      startDate: defaultStartDate,
      endDate: defaultEndDate,
      transactionType: '',
      studentId: ''
    }
  }

  const resetToDefaultDates = () => {
    filters.value.startDate = defaultStartDate
    filters.value.endDate = defaultEndDate
  }

  const updateDateRange = (startDate: string, endDate: string) => {
    filters.value.startDate = startDate
    filters.value.endDate = endDate
  }

  const updateTransactionType = (transactionType: string) => {
    filters.value.transactionType = transactionType
  }

  const updateStudentId = (studentId: string) => {
    filters.value.studentId = studentId
  }

  return {
    // State
    filters,
    
    // Computed
    hasActiveFilters,
    isDefaultDateRange,
    
    // Methods
    setFilters,
    clearFilters,
    resetToDefaultDates,
    updateDateRange,
    updateTransactionType,
    updateStudentId
  }
}