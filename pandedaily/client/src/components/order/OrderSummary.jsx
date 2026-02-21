import { motion } from 'framer-motion'
import { FiPackage } from 'react-icons/fi'
import { formatCurrency } from '../../utils/formatters'
import SelectedProductItem from './SelectedProductItem'

const OrderSummary = ({
  selectedProducts,
  validationError,
  totals,
  user,
  isAuthenticated,
  onClearAll,
  onRemoveProduct,
  onProceedToCheckout,
  isDesalProduct,
}) => {
  if (selectedProducts.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <FiPackage className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No products selected yet</p>
          <p className="text-sm text-gray-400 mt-2">Click on products to add them to your order</p>
        </div>
      </div>
    )
  }

  return (
    <>
      {validationError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm font-medium">{validationError}</p>
        </div>
      )}

      <div className="flex-1 overflow-hidden flex flex-col min-h-0">
        <div className="flex justify-between items-center mb-3 shrink-0">
          <h3 className="font-medium text-sm" style={{ color: '#9C4A15' }}>
            Selected Items ({selectedProducts.length})
          </h3>
          <button onClick={onClearAll} className="text-xs text-[#9C4A15] hover:underline">
            Clear all
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 space-y-2 custom-scrollbar">
          {selectedProducts.map((product) => (
            <SelectedProductItem
              key={product.id}
              product={product}
              isDesal={isDesalProduct(product)}
              onRemove={onRemoveProduct}
            />
          ))}
        </div>
      </div>

      <div className="shrink-0 mt-4">
        <div className="space-y-3 pt-4 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <span className="text-sm" style={{ color: '#2A1803' }}>
              Total Items
            </span>
            <span className="font-bold" style={{ color: '#9C4A15' }}>
              {totals.totalItems} pcs
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-base font-bold" style={{ color: '#2A1803' }}>
              Per Delivery
            </span>
            <span className="text-lg font-bold" style={{ color: '#9C4A15' }}>
              {formatCurrency(totals.totalPrice)}
            </span>
          </div>
        </div>

        <div className="mt-6">
          <motion.button
            onClick={onProceedToCheckout}
            disabled={selectedProducts.length === 0}
            className={`w-full py-4 rounded-full font-bold font-[titleFont] text-base transition-all duration-200 shadow-lg cursor-pointer ${
              selectedProducts.length === 0 ? 'opacity-70 cursor-not-allowed' : ''
            }`}
            style={{ backgroundColor: '#9C4A15', color: '#F5EFE7' }}
            whileHover={selectedProducts.length > 0 ? { scale: 1.02 } : {}}
            whileTap={selectedProducts.length > 0 ? { scale: 0.98 } : {}}
          >
            Proceed to Checkout
          </motion.button>

          {isAuthenticated && user && (
            <p className="text-center mt-3 font-[titleFont] text-sm" style={{ color: '#2A1803' }}>
              Ordering as:{' '}
              <span className="font-bold text-[#9C4A15]">{user.fullname || user.c_fullname}</span>
            </p>
          )}
        </div>

        <p className="text-center text-xs mt-4" style={{ color: '#9C4A15' }}>
          You'll select delivery dates and times in checkout
        </p>
      </div>
    </>
  )
}

export default OrderSummary
