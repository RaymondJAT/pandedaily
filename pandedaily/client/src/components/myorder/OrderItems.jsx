import { formatCurrency } from '../../utils/formatters'

const OrderItems = ({ items }) => {
  return (
    <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
      <h3 className="font-medium mb-3" style={{ color: '#2A1803' }}>
        Items
      </h3>
      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={`item-${item.id}`}
            className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0"
          >
            <div>
              <span className="text-sm font-medium text-gray-500 mr-2">
                {parseFloat(item.quantity).toFixed(0)}x
              </span>
              <span style={{ color: '#2A1803' }}>{item.product_name}</span>
              {item.category_name && (
                <span className="text-gray-400 text-xs ml-2">({item.category_name})</span>
              )}
            </div>
            <span className="font-medium" style={{ color: '#9C4A15' }}>
              {formatCurrency(parseFloat(item.price) * parseFloat(item.quantity))}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default OrderItems
