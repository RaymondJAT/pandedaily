import { motion } from 'framer-motion'
import { FiEdit2, FiShoppingBag } from 'react-icons/fi'

const PaymentOrderSummary = ({
  checkoutDetails,
  selectedPaymentDetails,
  onEdit,
  formatCurrency,
  formatTimeForDisplay,
  formatDateDisplay,
  calculateTotalWithFee,
  agreedToTerms,
  onTermsChange,
  children,
  faqItem,
}) => {
  const productsNeedScroll = checkoutDetails.products.length >= 5
  const datesNeedScroll = checkoutDetails.dates.length > 8

  return (
    <motion.div className="flex flex-col" variants={faqItem} transition={{ delay: 0.2 }}>
      <h2
        className="text-xl md:text-2xl font-light mb-6 font-[titleFont]"
        style={{ color: '#2A1803' }}
      >
        <div className="flex items-center gap-3">
          <FiShoppingBag className="text-[#9C4A15]" />
          Order Summary
        </div>
      </h2>

      <div className="bg-white rounded-xl shadow-lg p-6 md:p-7 flex-1 flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={onEdit}
            className="flex items-center gap-2 text-sm text-[#9C4A15] hover:text-[#8a3f12]"
          >
            <FiEdit2 className="w-4 h-4" />
            Edit Order
          </button>
        </div>

        <div className="space-y-4 flex-1">
          {/* Products Summary  */}
          <div>
            <h3 className="font-medium font-[titleFont] text-sm mb-2" style={{ color: '#9C4A15' }}>
              Products
            </h3>
            <div
              className={`space-y-2 ${
                productsNeedScroll ? 'max-h-35 overflow-y-auto pr-2 custom-scrollbar' : ''
              }`}
            >
              {checkoutDetails.products.map((product) => (
                <div key={product.id} className="flex justify-between items-center text-sm">
                  <span style={{ color: '#2A1803' }}>
                    {product.name} x {product.quantity}
                  </span>
                  <span style={{ color: '#9C4A15' }}>
                    {formatCurrency(product.quantity * product.price)}
                  </span>
                </div>
              ))}
            </div>
            {/* Show item count when not scrollable */}
            {!productsNeedScroll && (
              <p className="text-xs mt-1" style={{ color: '#9C4A15' }}>
                {checkoutDetails.products.length} item
                {checkoutDetails.products.length !== 1 ? 's' : ''}
              </p>
            )}
          </div>

          {/* Delivery Dates */}
          <div
            className="p-4 rounded-lg"
            style={{
              backgroundColor: '#F5EFE7',
              border: '1px solid rgba(156, 74, 21, 0.2)',
            }}
          >
            <div className="flex justify-between items-center mb-3">
              <p className="text-xs font-medium" style={{ color: '#9C4A15' }}>
                Delivery Dates
              </p>
              <span
                className="text-xs font-bold px-2 py-1 rounded-full bg-white"
                style={{ color: '#9C4A15' }}
              >
                {checkoutDetails.dates.length} days
              </span>
            </div>

            {/* dates grid with conditional scroll */}
            <div
              className={`grid grid-cols-2 gap-2 ${
                datesNeedScroll ? 'max-h-34 overflow-y-auto pr-1 custom-scrollbar' : ''
              }`}
            >
              {checkoutDetails.dates.map((dateStr, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-white rounded-lg text-xs"
                >
                  <span className="font-medium" style={{ color: '#2A1803' }}>
                    {formatDateDisplay(dateStr)}
                  </span>
                  <span
                    className="text-[10px] px-2 py-1 rounded-full whitespace-nowrap ml-1"
                    style={{
                      backgroundColor: '#F5EFE7',
                      color: '#9C4A15',
                    }}
                  >
                    {formatTimeForDisplay(checkoutDetails.selectedTime)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="h-px" style={{ backgroundColor: '#F5EFE7' }}></div>

          {/* Pricing */}
          <div className="flex justify-between items-center">
            <span className="font-bold font-[titleFont] text-lg" style={{ color: '#2A1803' }}>
              Per Delivery
            </span>
            <span className="font-bold font-[titleFont] text-xl" style={{ color: '#9C4A15' }}>
              {formatCurrency(checkoutDetails.totalPricePerDelivery)}
            </span>
          </div>

          {selectedPaymentDetails && selectedPaymentDetails.fee > 0 && (
            <div className="flex justify-between items-center text-sm">
              <span style={{ color: '#2A1803' }}>Payment Fee</span>
              <span style={{ color: '#DC2626' }}>
                +{formatCurrency(selectedPaymentDetails.fee * checkoutDetails.totalPrice)}
              </span>
            </div>
          )}

          <div className="mt-4 pt-4 border-t" style={{ borderColor: '#F5EFE7' }}>
            <div className="flex justify-between items-center mb-2">
              <span className="font-bold font-[titleFont] text-lg" style={{ color: '#2A1803' }}>
                Total Amount
              </span>
              <span className="font-bold font-[titleFont] text-2xl" style={{ color: '#9C4A15' }}>
                {formatCurrency(calculateTotalWithFee())}
              </span>
            </div>
          </div>

          {checkoutDetails.instructions && (
            <div
              className="mt-4 p-3 rounded-lg font-[titleFont] text-sm"
              style={{ backgroundColor: '#F5EFE7', color: '#2A1803' }}
            >
              <span className="font-medium">Note:</span> {checkoutDetails.instructions}
            </div>
          )}

          {/* Terms & Conditions */}
          <div className="mb-4">
            <label className="flex items-start">
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => onTermsChange(e.target.checked)}
                className="mt-1 mr-3 w-4 h-4 text-[#9C4A15] focus:ring-[#9C4A15] rounded cursor-pointer"
              />
              <span className="text-xs" style={{ color: '#2A1803' }}>
                I agree to the{' '}
                <a href="/terms" className="text-[#9C4A15] hover:underline">
                  Terms & Conditions
                </a>
              </span>
            </label>
          </div>

          {children}
        </div>
      </div>
    </motion.div>
  )
}

export default PaymentOrderSummary
