import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiXCircle } from 'react-icons/fi'

const PaymentCancel = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-[#F5EFE7] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center"
      >
        <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FiXCircle className="w-8 h-8 text-yellow-600" />
        </div>

        <h2 className="text-xl font-bold mb-2" style={{ color: '#2A1803' }}>
          Payment Cancelled
        </h2>

        <p className="text-gray-600 mb-6">Your payment was cancelled. No charges were made.</p>

        <div className="space-y-3">
          <button
            onClick={() => navigate('/checkout')}
            className="w-full px-6 py-3 bg-[#9C4A15] text-white rounded-lg hover:opacity-90 transition-opacity"
          >
            Return to Checkout
          </button>

          <button
            onClick={() => navigate('/order')}
            className="w-full px-6 py-3 border-2 border-[#9C4A15] text-[#9C4A15] rounded-lg hover:bg-[#F5EFE7] transition-colors"
          >
            Modify Order
          </button>
        </div>
      </motion.div>
    </div>
  )
}

export default PaymentCancel
