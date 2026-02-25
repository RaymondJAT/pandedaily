import { motion } from 'framer-motion'
import { FiSmartphone, FiCreditCard } from 'react-icons/fi'

const PaymentMethodSelector = ({ paymentMethods, selectedMethod, onMethodSelect, faqItem }) => {
  const getIcon = (methodId) => {
    switch (methodId) {
      case 'gcash':
      case 'paymaya':
        return <FiSmartphone className="w-5 h-5" />
      default:
        return <FiCreditCard className="w-5 h-5" />
    }
  }

  return (
    <motion.div variants={faqItem} className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-medium mb-4" style={{ color: '#2A1803' }}>
        Select Payment Method
      </h3>

      <div className="space-y-3">
        {paymentMethods.map((method) => (
          <button
            key={method.id}
            onClick={() => onMethodSelect(method.id)}
            className={`w-full flex items-center gap-4 p-4 border-2 rounded-lg transition-all ${
              selectedMethod === method.id
                ? 'border-[#9C4A15] bg-[#F5EFE7]'
                : 'border-gray-200 hover:border-[#9C4A15]'
            }`}
          >
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                selectedMethod === method.id
                  ? 'bg-[#9C4A15] text-white'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {getIcon(method.id)}
            </div>
            <div className="flex-1 text-left">
              <h4 className="font-medium" style={{ color: '#2A1803' }}>
                {method.name}
              </h4>
              <p className="text-sm text-gray-500">{method.description}</p>
            </div>
          </button>
        ))}
      </div>
    </motion.div>
  )
}

export default PaymentMethodSelector
