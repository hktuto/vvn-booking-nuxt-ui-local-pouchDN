import type { TransactionDocument } from './usePouchDB'
import { usePouchCRUD } from './usePouchDB'
import { useTransactionDB } from '~/utils/dbStateHelper'
import { useTransactionDetailsDialog } from './useTransactionDetailsDialog'

const transformTransactionDoc = (doc: TransactionDocument) => ({
  id: doc._id,
  student_id: doc.student_id,
  transaction_type: doc.transaction_type,
  status: doc.status,
  amount: doc.amount, // actual $ user earned , if payment is credit, then is the unit price * credits used
  currency: doc.currency, // always HKD
  class_id: doc.class_id,
  package_id: doc.package_id,
  student_package_id: doc.student_package_id,
  booking_id: doc.booking_id,
  original_transaction_id: doc.original_transaction_id,
  description: doc.description,
  payment_method: doc.payment_method,
  unit_price: doc.unit_price, // only apply to package purchase, the unit price of the package
  total_amount: doc.total_amount,  // Total amount for credit usage (credits_used)
  notes: doc.notes,
  created_at: doc.created_at,
  updated_at: doc.updated_at
})

export const useTransactions = () => {
  const { getDB } = useTransactionDB()
  const { getStudentById } = useStudents()
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
    packageInfo?: any
    classInfo?: any
    bookingInfo?: any
  }) => {
    try {
      const transactionsDB = await getDB()
      const transactionsCRUD = usePouchCRUD<TransactionDocument>(transactionsDB)
      
      const doc = {
        ...transactionData,
        type: 'transaction' as const,
        currency: transactionData.currency || 'HKD',
        notes: transactionData.notes || ''
      }
      
      const newTransaction = await transactionsCRUD.create(doc)
      const transformedTransaction = transformTransactionDoc(newTransaction)
      const student = await getStudentById(transactionData.student_id)
      // Show transaction details dialog if requested
      if (transactionData.showDetailsDialog) {
        await showTransactionDetailsDialog(transformedTransaction, student, transactionData.packageInfo, transactionData.classInfo, transactionData.bookingInfo)

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
      const transactionsDB = await getDB()
      const transactionsCRUD = usePouchCRUD<TransactionDocument>(transactionsDB)
      
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
      const transactionsDB = await getDB()
      const result = await transactionsDB.find({
        selector: { 
          type: 'transaction',
          student_id: studentId
        },
        limit: limit || 50
      })
      
      return result.docs
        .map((doc: any) => transformTransactionDoc(doc as TransactionDocument))
        .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    } catch (err) {
      console.error('Error getting transactions by student:', err)
      return []
    }
  }

  // Get transactions for a specific class
  const getTransactionsByClass = async (classId: string, limit?: number) => {
    try {
      const transactionsDB = await getDB()
      const result = await transactionsDB.find({
        selector: { 
          type: 'transaction',
          class_id: classId
        },
        limit: limit || 50
      })
      
      return result.docs
        .map((doc: any) => transformTransactionDoc(doc as TransactionDocument))
        .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    } catch (err) {
      console.error('Error getting transactions by class:', err)
      return []
    }
  }

  // Get transactions for a specific package
  const getTransactionsByPackage = async (packageId: string, limit?: number) => {
    try {
      const transactionsDB = await getDB()
      const result = await transactionsDB.find({
        selector: { 
          type: 'transaction',
          package_id: packageId
        },
        limit: limit || 50
      })
      
      return result.docs
        .map((doc: any) => transformTransactionDoc(doc as TransactionDocument))
        .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    } catch (err) {
      console.error('Error getting transactions by package:', err)
      return []
    }
  }

  // Get recent transactions
  const getRecentTransactions = async (limit: number = 20) => {
    try {
      const transactionsDB = await getDB()
      const result = await transactionsDB.find({
        selector: { 
          type: 'transaction'
        },
        limit: limit
      })
      
      return result.docs
        .map((doc: any) => transformTransactionDoc(doc as TransactionDocument))
        .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    } catch (err) {
      console.error('Error getting recent transactions:', err)
      return []
    }
  }

  // Get transactions by date range
  const getTransactionsByDateRange = async (startDate: string, endDate: string, limit?: number) => {
    try {
      const transactionsDB = await getDB()
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
      
      return result.docs
        .map((doc: any) => transformTransactionDoc(doc as TransactionDocument))
        .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    } catch (err) {
      console.error('Error getting transactions by date range:', err)
      return []
    }
  }

  // Get transactions by type
  const getTransactionsByType = async (transactionType: string, limit?: number) => {
    try {
      const transactionsDB = await getDB()
      const result = await transactionsDB.find({
        selector: { 
          type: 'transaction',
          transaction_type: transactionType
        },
        limit: limit || 50
      })
      
      return result.docs
        .map((doc: any) => transformTransactionDoc(doc as TransactionDocument))
        .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    } catch (err) {
      console.error('Error getting transactions by type:', err)
      return []
    }
  }

  // Update transaction status
  const updateTransactionStatus = async (id: string, status: 'completed' | 'refunded' | 'pending' | 'cancelled') => {
    try {
      const transactionsDB = await getDB()
      const transactionsCRUD = usePouchCRUD<TransactionDocument>(transactionsDB)
      
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
      const transactionsDB = await getDB()
      const transactionsCRUD = usePouchCRUD<TransactionDocument>(transactionsDB)
      
      // Get original transaction
      const originalTransaction = await transactionsCRUD.findById(originalTransactionId)
      if (!originalTransaction) {
        throw new Error('Original transaction not found')
      }
      
      // Create refund transaction
      const refundTransaction = await transactionsCRUD.create({
        type: 'transaction',
        student_id: originalTransaction.student_id,
        transaction_type: 'refund',
        status: 'completed',
        amount: -refundAmount, // Negative amount for refund
        currency: originalTransaction.currency,
        class_id: originalTransaction.class_id,
        package_id: originalTransaction.package_id,
        student_package_id: originalTransaction.student_package_id,
        booking_id: originalTransaction.booking_id,
        original_transaction_id: originalTransactionId,
        description: `Refund for: ${originalTransaction.description}`,
        payment_method: originalTransaction.payment_method,
        notes: notes || 'Refund transaction'
      })
      
      return transformTransactionDoc(refundTransaction)
    } catch (err) {
      console.error('Error creating refund transaction:', err)
      throw new Error('Failed to create refund transaction')
    }
  }

  // Get transaction statistics
  const getTransactionStats = async (startDate?: string, endDate?: string, userId?: string, transactionType?: string) => {
    try {
      const transactionsDB = await getDB()
      
      let selector: any = { type: 'transaction' }
      
      if (startDate && endDate) {
        selector.created_at = { $gte: startDate, $lte: endDate }
      }
      
      if (userId) {
        selector.student_id = userId
      }
      
      if (transactionType) {
        selector.transaction_type = transactionType
      }
      
      const result = await transactionsDB.find({ selector })
      
      const transactions = result.docs.map((doc: any) => transformTransactionDoc(doc as TransactionDocument))
      
      const totalRevenue = transactions.reduce((sum: number, t: any) => sum + t.amount, 0)
      const totalTransactions = transactions.length
      const completedTransactions = transactions.filter((t: any) => t.status === 'completed').length
      const totalRefunds = transactions.reduce((sum: number, t: any) => sum + (t.amount < 0 ? t.amount : 0), 0)
      const netRevenue = totalRevenue - totalRefunds
      const byType = transactions.reduce((acc: any, t: any) => {
        acc[t.transaction_type] = (acc[t.transaction_type] || 0) + 1
        return acc
      }, {
      } )
      return {
        totalRevenue,
        totalRefunds,
        netRevenue,
        totalTransactions,
        completedTransactions,
        byType,
      }
    } catch (err) {
      console.error('Error getting transaction stats:', err)
      return {
        totalAmount: 0,
        totalTransactions: 0,
        completedTransactions: 0,
        averageAmount: 0
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