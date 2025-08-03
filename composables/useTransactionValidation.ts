import { z } from 'zod'

export const useTransactionValidation = () => {
  const { t } = useI18n()

  const transactionSchema = z.object({
    student_id: z.string().min(1, t('validation.student.required')),
    transaction_type: z.enum(['package_purchase', 'credit_usage', 'cash_payment', 'refund']),
    status: z.enum(['completed', 'refunded', 'pending', 'cancelled']),
    amount: z.number().min(0.01, t('validation.amount.min')),
    currency: z.string().default('HKD'),
    class_id: z.string().optional(),
    package_id: z.string().optional(),
    booking_id: z.string().optional(),
    original_transaction_id: z.string().optional(),
    description: z.string().min(1, t('validation.description.required')).max(200, t('validation.description.maxLength')),
    payment_method: z.enum(['cash', 'payme', 'wechat', 'alipay', 'fps', 'credit_card']).optional(),
    notes: z.string().max(500, t('validation.notes.maxLength')).optional().or(z.literal(''))
  }).refine((data) => {
    // Validate that refund transactions have original_transaction_id
    if (data.transaction_type === 'refund' && !data.original_transaction_id) {
      return false
    }
    return true
  }, {
    message: t('validation.refund.originalTransactionRequired'),
    path: ['original_transaction_id']
  }).refine((data) => {
    // Validate that package_purchase has package_id
    if (data.transaction_type === 'package_purchase' && !data.package_id) {
      return false
    }
    return true
  }, {
    message: t('validation.packagePurchase.packageRequired'),
    path: ['package_id']
  }).refine((data) => {
    // Validate that credit_usage and cash_payment have class_id
    if ((data.transaction_type === 'credit_usage' || data.transaction_type === 'cash_payment') && !data.class_id) {
      return false
    }
    return true
  }, {
    message: t('validation.booking.classRequired'),
    path: ['class_id']
  })

  const refundSchema = z.object({
    original_transaction_id: z.string().min(1, t('validation.originalTransaction.required')),
    refund_amount: z.number().min(0.01, t('validation.refundAmount.min')),
    notes: z.string().max(500, t('validation.notes.maxLength')).optional().or(z.literal(''))
  })

  return {
    transactionSchema,
    refundSchema
  }
}

export type TransactionForm = z.infer<ReturnType<typeof useTransactionValidation>['transactionSchema']>
export type RefundForm = z.infer<ReturnType<typeof useTransactionValidation>['refundSchema']> 