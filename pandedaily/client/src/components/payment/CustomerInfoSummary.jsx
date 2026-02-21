import { motion } from 'framer-motion'
import { FiUser } from 'react-icons/fi'

const CustomerInfoSummary = ({ customerInfo, isGuest, faqItem }) => {
  return (
    <motion.div className="flex flex-col" variants={faqItem}>
      <h2
        className="text-xl md:text-2xl font-light mb-6 font-[titleFont]"
        style={{ color: '#2A1803' }}
      >
        <div className="flex items-center gap-3">
          <FiUser className="text-[#9C4A15]" />
          {isGuest ? 'Guest Customer' : 'Customer'}
        </div>
      </h2>

      <div className="bg-white rounded-xl shadow-lg p-6 md:p-7">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-xs font-medium" style={{ color: '#9C4A15' }}>
                Full Name
              </p>
              <p className="text-base font-[titleFont]" style={{ color: '#2A1803' }}>
                {customerInfo.fullname}
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-xs font-medium" style={{ color: '#9C4A15' }}>
                Contact Number
              </p>
              <p className="text-base font-[titleFont]" style={{ color: '#2A1803' }}>
                {customerInfo.contact}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-xs font-medium" style={{ color: '#9C4A15' }}>
                Email Address
              </p>
              <p className="text-sm font-[titleFont] break-all" style={{ color: '#2A1803' }}>
                {customerInfo.email}
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-xs font-medium" style={{ color: '#9C4A15' }}>
                Delivery Address
              </p>
              <p className="text-sm font-[titleFont]" style={{ color: '#2A1803' }}>
                {customerInfo.address}
              </p>
            </div>
          </div>
        </div>

        {isGuest && (
          <div className="mt-4 pt-4 border-t" style={{ borderColor: '#F5EFE7' }}>
            <span
              className="inline-block px-3 py-1 text-xs rounded-full"
              style={{ backgroundColor: '#F5EFE7', color: '#9C4A15' }}
            >
              Guest Checkout
            </span>
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default CustomerInfoSummary
