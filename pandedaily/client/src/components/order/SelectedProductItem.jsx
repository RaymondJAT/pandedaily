import { FiTrash2 } from 'react-icons/fi'
import { formatCurrency } from '../../utils/formatters'

const SelectedProductItem = ({ product, isDesal, onRemove }) => {
  const isValidQuantity = !isDesal || product.quantity >= 1

  return (
    <div
      className={`flex justify-between items-center text-sm py-3 px-3 rounded-lg border border-gray-200 hover:border-[#9C4A15] transition-colors ${
        !isValidQuantity ? 'bg-red-50' : 'bg-white'
      }`}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium truncate" style={{ color: '#2A1803' }}>
            {product.name}
          </span>
          <span
            className={`text-xs whitespace-nowrap ${
              !isValidQuantity ? 'text-red-600 font-bold' : ''
            }`}
            style={isValidQuantity ? { color: '#9C4A15' } : {}}
          >
            x{product.quantity}
            {!isValidQuantity && <span className="ml-1 text-red-600">(Min 20)</span>}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4 shrink-0">
        <span className="font-medium text-sm" style={{ color: '#9C4A15' }}>
          {formatCurrency(product.quantity * product.price)}
        </span>

        <button
          onClick={(e) => {
            e.stopPropagation()
            onRemove(product.id)
          }}
          className="p-2 rounded-full hover:bg-red-100 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          title="Remove item"
          aria-label="Remove item"
        >
          <FiTrash2 className="w-4 h-4 text-red-500" />
        </button>
      </div>
    </div>
  )
}

export default SelectedProductItem
