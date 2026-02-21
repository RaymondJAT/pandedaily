import { motion } from 'framer-motion'
import { FiShield } from 'react-icons/fi'

const PaymentButton = ({
  isProcessing,
  paymentMethod,
  agreedToTerms,
  onSubmit,
  buttonText,
  formatCurrency,
  calculateTotalWithFee,
}) => {
  const isDisabled = isProcessing || !paymentMethod || !agreedToTerms

  return (
    <div className="mt-6">
      <motion.button
        onClick={onSubmit}
        disabled={isDisabled}
        className={`w-full py-4 rounded-full font-bold font-[titleFont] text-base transition-all duration-200 shadow-lg cursor-pointer ${
          isProcessing ? 'opacity-70 cursor-not-allowed' : ''
        }`}
        style={{
          backgroundColor: paymentMethod && agreedToTerms ? '#9C4A15' : '#9CA3AF',
          color: '#F5EFE7',
        }}
        whileHover={!isDisabled ? { scale: 1.02 } : {}}
        whileTap={!isDisabled ? { scale: 0.98 } : {}}
      >
        {isProcessing ? (
          <div className="flex items-center justify-center gap-2">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            Processing...
          </div>
        ) : !paymentMethod ? (
          'Select Payment Method'
        ) : !agreedToTerms ? (
          'Agree to Terms'
        ) : (
          buttonText || `Pay ${formatCurrency(calculateTotalWithFee())}`
        )}
      </motion.button>

      <div
        className="flex items-center justify-center gap-2 mt-3 text-xs"
        style={{ color: '#9C4A15' }}
      >
        <FiShield className="w-3 h-3" />
        <span>Secure • Free Delivery • Fresh Daily</span>
      </div>
    </div>
  )
}

export default PaymentButton
