import { FiCalendar } from 'react-icons/fi'
import { formatCurrency, formatDateDisplay } from '../../utils/formatters'
import StatusBadge from './StatusBadge'

const OrderList = ({ orders, selectedOrder, onSelectOrder }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg h-150 flex flex-col">
      <div className="p-4 border-b bg-gray-50 rounded-t-xl shrink-0">
        <h3 className="font-medium text-sm" style={{ color: '#2A1803' }}>
          Orders ({orders.length})
        </h3>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
        {orders.map((order) => {
          if (!order?.or_id) return null

          return (
            <div
              key={`order-${order.or_id}`}
              onClick={() => onSelectOrder(order)}
              className={`border rounded-lg p-4 cursor-pointer transition-all hover:border-[#9C4A15] ${
                selectedOrder?.or_id === order.or_id
                  ? 'ring-2 ring-[#9C4A15] border-transparent bg-orange-50'
                  : ''
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-medium" style={{ color: '#2A1803' }}>
                    Order #{order.or_id}
                  </h3>
                  <p className="text-xs text-gray-500 flex items-center mt-1">
                    <FiCalendar className="mr-1" size={10} />
                    {order.or_createddate ? formatDateDisplay(order.or_createddate) : 'N/A'}
                  </p>
                </div>
                <StatusBadge status={order.or_status} />
              </div>

              <div className="flex justify-between items-center text-sm mt-2">
                <span className="text-gray-600">Total Amount</span>
                <span className="font-medium" style={{ color: '#9C4A15' }}>
                  {formatCurrency(order.or_total || 0)}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default OrderList
