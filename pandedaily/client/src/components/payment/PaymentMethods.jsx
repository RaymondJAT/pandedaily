import { motion } from 'framer-motion'
import { FiCreditCard, FiShield, FiSmartphone, FiCreditCard as FiCard } from 'react-icons/fi'

const iconMap = {
  FiSmartphone,
  FiCard,
}

const PaymentMethods = ({ paymentMethods, paymentMethod, onMethodSelect, faqItem }) => {
  return (
    <motion.div className="flex flex-col" variants={faqItem} transition={{ delay: 0.1 }}>
      <h2
        className="text-xl md:text-2xl font-light mb-6 font-[titleFont]"
        style={{ color: '#2A1803' }}
      >
        <div className="flex items-center gap-3">
          <FiCreditCard className="text-[#9C4A15]" />
          Select Payment Method
        </div>
      </h2>

      <div className="bg-white rounded-xl shadow-lg p-6 md:p-7">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {paymentMethods.map((method) => {
            const Icon = iconMap[method.icon] || FiSmartphone
            return (
              <button
                key={method.id}
                onClick={() => onMethodSelect(method.id)}
                className={`p-5 rounded-xl border-2 transition-all duration-200 hover:scale-[1.02] cursor-pointer flex flex-col ${
                  paymentMethod === method.id
                    ? 'border-[#9C4A15] bg-[#F5EFE7]'
                    : 'border-gray-200 hover:border-[#9C4A15]/50'
                }`}
                style={{
                  backgroundColor: paymentMethod === method.id ? '#F5EFE7' : 'white',
                }}
              >
                <div className="flex flex-col items-center text-center">
                  <div
                    className="w-16 h-16 rounded-xl flex items-center justify-center mb-4"
                    style={{ backgroundColor: method.iconBg }}
                  >
                    <Icon className="w-8 h-8" style={{ color: method.color }} />
                  </div>
                  <h3
                    className="font-bold font-[titleFont] text-lg mb-2"
                    style={{ color: '#2A1803' }}
                  >
                    {method.name}
                  </h3>
                  {method.fee > 0 ? (
                    <span
                      className="text-xs px-3 py-1 rounded-full"
                      style={{ backgroundColor: '#FEF3C7', color: '#92400E' }}
                    >
                      +{method.fee * 100}% fee
                    </span>
                  ) : (
                    <span
                      className="text-xs px-3 py-1 rounded-full"
                      style={{ backgroundColor: '#E8F5E9', color: '#008C41' }}
                    >
                      No fee
                    </span>
                  )}
                </div>
              </button>
            )
          })}
        </div>

        <div
          className="flex items-center justify-center gap-3 p-4 rounded-lg"
          style={{
            backgroundColor: '#F5EFE7',
            border: '1px solid rgba(156, 74, 21, 0.2)',
          }}
        >
          <FiShield className="w-5 h-5" style={{ color: '#9C4A15' }} />
          <div className="text-center">
            <p className="font-medium text-sm" style={{ color: '#2A1803' }}>
              Secure Payment Processing
            </p>
            <p className="text-xs" style={{ color: '#9C4A15' }}>
              All transactions are encrypted and protected
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default PaymentMethods
