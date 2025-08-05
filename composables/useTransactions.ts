import type { TransactionDocument } from './usePouchDB'
import { usePouchDB, usePouchCRUD } from './usePouchDB'
import { useTransactionDetailsDialog } from './useTransactionDetailsDialog'

const transformTransactionDoc = (doc: TransactionDocument) => ({
  id: doc._id,
  student_id: doc.student_id,
  transaction_type: doc.transaction_type,
  status: doc.status,
  amount: doc.amount,
  currency: doc.currency,
  class_id: doc.class_id,
  package_id: doc.package_id,
  student_package_id: doc.student_package_id,
  booking_id: doc.booking_id,
  original_transaction_id: doc.original_transaction_id,
  description: doc.description,
  payment_method: doc.payment_method,
  unit_price: doc.unit_price,
  total_amount: doc.total_amount,
  notes: doc.notes,
  created_at: doc.created_at,
  updated_at: doc.updated_at
})

export const useTransactions = () => {
  const { transactions: transactionsDB } = usePouchDB()
  const transactionsCRUD = usePouchCRUD<TransactionDocument>(transactionsDB)

  const loading = ref(false)
  const error = ref<string | null>(null)

  // Use the transaction details dialog composable
  const { showTransactionDetailsDialog } = useTransactionDetailsDialog()

  // Create a new transaction
  const createTransaction = async (transactionData: {
    student_id: string
    transaction_type: 'package_purchase' | 'credit_usage' | 'cash_payment' | 'refund'
    status: 'completed' | 'refunded' | 'pending' | 'cancelled'
    amount: number
    currency?: string
    class_id?: string
    package_id?: string
    student_package_id?: string
    booking_id?: string
    original_transaction_id?: string
    description: string
    payment_method?: 'cash' | 'payme' | 'wechat' | 'alipay' | 'fps' | 'credit_card'
    unit_price?: number
    total_amount?: number
    notes?: string
    showDetailsDialog?: boolean
    student?: any
    packageInfo?: any
    classInfo?: any
    bookingInfo?: any
  }) => {
    try {
      const doc = {
        ...transactionData,
        type: 'transaction' as const,
        currency: transactionData.currency || 'HKD',
        notes: transactionData.notes || ''
      }
      
      const newTransaction = await transactionsCRUD.create(doc)
      const transformedTransaction = transformTransactionDoc(newTransaction)
      
      // Show transaction details dialog if requested
      if (transactionData.showDetailsDialog) {
        await showTransactionDetailsDialog(transformedTransaction, transactionData.student, transactionData.packageInfo, transactionData.classInfo, transactionData.bookingInfo)
      }
      
      return transformedTransaction
    } catch (err) {
      console.error('Error creating transaction:', err)
      throw new Error('Failed to create transaction')
    }
  }

  // Get transaction by ID
  const getTransactionById = async (id: string) => {
    try {
      const doc = await transactionsCRUD.findById(id)
      return doc ? transformTransactionDoc(doc) : null
    } catch (err) {
      console.error('Error getting transaction by ID:', err)
      return null
    }
  }

  // Get transactions for a specific student
  const getTransactionsByStudent = async (studentId: string, limit?: number) => {
    try {
      const result = await transactionsDB.find({
        selector: { 
          type: 'transaction',
          student_id: studentId
        },
        limit: limit || 50
      })
      
      return result.docs.map(doc => transformTransactionDoc(doc as TransactionDocument))
    } catch (err) {
      console.error('Error getting transactions by student:', err)
      return []
    }
  }

  // Get transactions for a specific class
  const getTransactionsByClass = async (classId: string, limit?: number) => {
    try {
      const result = await transactionsDB.find({
        selector: { 
          type: 'transaction',
          class_id: classId
        },
        limit: limit || 50
      })
      
      return result.docs.map(doc => transformTransactionDoc(doc as TransactionDocument))
    } catch (err) {
      console.error('Error getting transactions by class:', err)
      return []
    }
  }

  // Get transactions for a specific package
  const getTransactionsByPackage = async (packageId: string, limit?: number) => {
    try {
      const result = await transactionsDB.find({
        selector: { 
          type: 'transaction',
          package_id: packageId
        },
        limit: limit || 50
      })
      
      return result.docs.map(doc => transformTransactionDoc(doc as TransactionDocument))
    } catch (err) {
      console.error('Error getting transactions by package:', err)
      return []
    }
  }

  // Get recent transactions (for dashboard)
  const getRecentTransactions = async (limit: number = 20) => {
    try {
      const result = await transactionsDB.find({
        selector: { type: 'transaction' },
        limit
      })
      
      return result.docs.map(doc => transformTransactionDoc(doc as TransactionDocument))
    } catch (err) {
      console.error('Error getting recent transactions:', err)
      return []
    }
  }

  // Get transactions by date range
  const getTransactionsByDateRange = async (startDate: string, endDate: string, limit?: number) => {
    try {
      const result = await transactionsDB.find({
        selector: { 
          type: 'transaction',
          created_at: {
            $gte: startDate,
            $lte: endDate
          }
        },
        limit: limit || 100
      })
      
      return result.docs.map(doc => transformTransactionDoc(doc as TransactionDocument))
    } catch (err) {
      console.error('Error getting transactions by date range:', err)
      return []
    }
  }

  // Get transactions by type
  const getTransactionsByType = async (transactionType: string, limit?: number) => {
    try {
      const result = await transactionsDB.find({
        selector: { 
          type: 'transaction',
          transaction_type: transactionType
        },
        limit: limit || 50
      })
      
      return result.docs.map(doc => transformTransactionDoc(doc as TransactionDocument))
    } catch (err) {
      console.error('Error getting transactions by type:', err)
      return []
    }
  }

  // Update transaction status
  const updateTransactionStatus = async (id: string, status: 'completed' | 'refunded' | 'pending' | 'cancelled') => {
    try {
      const updatedTransaction = await transactionsCRUD.update(id, { status })
      return transformTransactionDoc(updatedTransaction)
    } catch (err) {
      console.error('Error updating transaction status:', err)
      throw new Error('Failed to update transaction status')
    }
  }

  // Create refund transaction
  const createRefundTransaction = async (originalTransactionId: string, refundAmount: number, notes?: string) => {
    try {
      // Get the original transaction
      const originalTransaction = await getTransactionById(originalTransactionId)
      if (!originalTransaction) {
        throw new Error('Original transaction not found')
      }

      // Create refund transaction
      const refundTransaction = await createTransaction({
        student_id: originalTransaction.student_id,
        transaction_type: 'refund',
        status: 'completed',
        amount: -Math.abs(refundAmount), // Negative amount for refund
        currency: originalTransaction.currency,
        class_id: originalTransaction.class_id,
        package_id: originalTransaction.package_id,
        booking_id: originalTransaction.booking_id,
        original_transaction_id: originalTransactionId,
        description: `Refund for: ${originalTransaction.description}`,
        notes: notes || 'Refund transaction'
      })

      // Update original transaction status to refunded
      await updateTransactionStatus(originalTransactionId, 'refunded')

      return refundTransaction
    } catch (err) {
      console.error('Error creating refund transaction:', err)
      throw new Error('Failed to create refund transaction')
    }
  }

  // Get transaction statistics
  const getTransactionStats = async (startDate?: string, endDate?: string, userId?: string, transactionType?: string) => {
    try {
      const selector: any = { type: 'transaction' }
      
      if (startDate && endDate) {
        selector.created_at = {
          $gte: startDate,
          $lte: endDate
        }
      }
      if(userId) {
        selector.student_id = userId
      }
      if(transactionType) {
        selector.transaction_type = transactionType
      }
      const result = await transactionsDB.find({ selector })
      
      const transactions = result.docs.map(doc => transformTransactionDoc(doc as TransactionDocument))
      
      const stats = {
        totalTransactions: transactions.length,
        totalRevenue: transactions
          .filter(t => t.amount > 0 && t.status === 'completed')
          .reduce((sum, t) => sum + t.amount, 0),
        totalRefunds: transactions
          .filter(t => t.amount < 0 && t.status === 'completed')
          .reduce((sum, t) => sum + Math.abs(t.amount), 0),
        netRevenue: transactions
          .filter(t => t.status === 'completed')
          .reduce((sum, t) => sum + t.amount, 0),
        byType: {
          package_purchase: transactions.filter(t => t.transaction_type === 'package_purchase').length,
          credit_usage: transactions.filter(t => t.transaction_type === 'credit_usage').length,
          cash_payment: transactions.filter(t => t.transaction_type === 'cash_payment').length,
          refund: transactions.filter(t => t.transaction_type === 'refund').length
        }
      }
      
      return stats
    } catch (err) {
      console.error('Error getting transaction stats:', err)
      return {
        totalTransactions: 0,
        totalRevenue: 0,
        totalRefunds: 0,
        netRevenue: 0,
        byType: {
          package_purchase: 0,
          credit_usage: 0,
          cash_payment: 0,
          refund: 0
        }
      }
    }
  }

  return {
    loading: readonly(loading),
    error: readonly(error),
    createTransaction,
    getTransactionById,
    getTransactionsByStudent,
    getTransactionsByClass,
    getTransactionsByPackage,
    getRecentTransactions,
    getTransactionsByDateRange,
    getTransactionsByType,
    updateTransactionStatus,
    createRefundTransaction,
    getTransactionStats
  }
} 