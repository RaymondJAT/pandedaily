import { motion } from 'framer-motion'
import { FiShoppingBag } from 'react-icons/fi'

const SelectedProductsSummary = ({
  products,
  totalItems,
  totalPricePerDelivery,
  formatCurrency,
  formatPrice,
  faqItem,
}) => {
  return (
    <motion.div className="flex flex-col" variants={faqItem} transition={{ delay: 0.2 }}>
      <h2
        className="text-xl md:text-2xl font-light mb-6 font-[titleFont]"
        style={{ color: '#2A1803' }}
      >
        <div className="flex items-center gap-3">
          <FiShoppingBag className="text-[#9C4A15]" />
          Selected Products
        </div>
      </h2>

      <div className="bg-white rounded-xl shadow-lg p-6 md:p-7 flex flex-col h-100">
        {/* Products List */}
        {products.length > 0 && (
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            <div className="space-y-4">
              {products.map((product) => {
                const price =
                  typeof product.price === 'string' ? parseFloat(product.price) : product.price
                return (
                  <div
                    key={product.id}
                    className="flex justify-between items-center pb-4 border-b last:border-0"
                    style={{ borderColor: '#F5EFE7' }}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold shrink-0"
                        style={{ backgroundColor: '#F5EFE7', color: '#9C4A15' }}
                      >
                        {product.quantity}x
                      </div>
                      <div>
                        <h4
                          className="font-medium font-[titleFont] text-sm"
                          style={{ color: '#2A1803' }}
                        >
                          {product.name}
                        </h4>
                        <p className="text-xs font-[titleFont] mt-1" style={{ color: '#9C4A15' }}>
                          ₱{formatPrice(price)} per piece
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span
                        className="font-bold font-[titleFont] text-sm"
                        style={{ color: '#9C4A15' }}
                      >
                        {formatCurrency(product.quantity * price)}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Subtotal */}
        <div className="mt-4 pt-4 border-t shrink-0" style={{ borderColor: '#F5EFE7' }}>
          <div className="flex justify-between items-center">
            <span className="font-bold font-[titleFont] text-base" style={{ color: '#2A1803' }}>
              Subtotal per delivery
            </span>
            <span className="font-bold font-[titleFont] text-lg" style={{ color: '#9C4A15' }}>
              {formatCurrency(totalPricePerDelivery)}
            </span>
          </div>
          <p className="text-xs font-[titleFont] mt-1 text-right" style={{ color: '#9C4A15' }}>
            Total items: {totalItems}
          </p>
        </div>
      </div>
    </motion.div>
  )
}

export default SelectedProductsSummary
