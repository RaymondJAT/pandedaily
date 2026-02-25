import { motion } from 'framer-motion'

const CheckoutActions = ({
  selectedDates,
  selectedTime,
  onProceedToPayment,
  processing,
  faqItem,
}) => {
  const isDisabled = selectedDates.length === 0 || !selectedTime || processing

  return (
    <motion.div className="mt-8" variants={faqItem} transition={{ delay: 0.25 }}>
      <div className="flex justify-center lg:justify-end">
        <motion.button
          onClick={onProceedToPayment}
          disabled={isDisabled}
          className={`px-8 sm:px-12 py-4 rounded-full font-bold font-[titleFont] text-sm sm:text-base transition-all duration-200 shadow-lg cursor-pointer w-full sm:w-auto flex items-center justify-center gap-2 ${
            isDisabled ? 'opacity-70 cursor-not-allowed' : ''
          }`}
          style={{
            backgroundColor: !isDisabled ? '#9C4A15' : '#9CA3AF',
            color: '#F5EFE7',
          }}
          whileHover={!isDisabled ? { scale: 1.02 } : {}}
          whileTap={!isDisabled ? { scale: 0.98 } : {}}
        >
          {processing ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Processing...</span>
            </>
          ) : selectedDates.length === 0 ? (
            'Select Delivery Dates'
          ) : !selectedTime ? (
            'Select Delivery Time'
          ) : (
            `Proceed to Payment`
          )}
        </motion.button>
      </div>
    </motion.div>
  )
}

export default CheckoutActions
