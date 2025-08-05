import { useOverlay } from '#imports'

export const useTransactionDetailsDialog = () => {
  const overlay = useOverlay()

  const showTransactionDetailsDialog = async (transaction: any, student: any, packageInfo: any, classInfo: any, bookingInfo: any) => {
    // Dynamically import the TransactionDetailsDialog component
    const { default: TransactionDetailsDialog } = await import('~/components/TransactionDetailsDialog.vue')
    
    // Create the transaction details dialog
    const transactionDialog = overlay.create(TransactionDetailsDialog, {
      props: {
        transaction,
        student,
        packageInfo,
        classInfo,
        bookingInfo
      }
    })
    
    // Open the dialog and wait for it to close
    await transactionDialog.open()
  }

  return {
    showTransactionDetailsDialog
  }
} 