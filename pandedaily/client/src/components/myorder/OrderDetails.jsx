import { FiPackage } from 'react-icons/fi'
import { formatCurrency, formatDateDisplay } from '../../utils/formatters'
import StatusBadge from './StatusBadge'
import OrderItems from './OrderItems'
import OrderPaymentInfo from './OrderPaymentInfo'

const OrderDetails = ({ selectedOrder, selectedOrderDetails, loading }) => {
  if (!selectedOrder) {
    return (
      <div className="bg-white rounded-xl shadow-lg h-150 flex justify-center items-center">
        <div className="text-center">
          <FiPackage className="mx-auto text-4xl text-gray-300 mb-2" />
          <p className="text-gray-500">Select an order to view details</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg h-150 flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#9C4A15]"></div>
      </div>
    )
  }

  if (!selectedOrderDetails) {
    return (
      <div className="bg-white rounded-xl shadow-lg h-150 flex justify-center items-center">
        <div className="text-center">
          <FiPackage className="mx-auto text-4xl text-gray-300 mb-2" />
          <p className="text-gray-500">No details available for this order</p>
        </div>
      </div>
    )
  }

  const order = selectedOrderDetails.order || {}
  const items = selectedOrderDetails.items?.data || []

  return (
    <div className="bg-white rounded-xl shadow-lg h-150 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b bg-gray-50 rounded-t-xl shrink-0">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold" style={{ color: '#2A1803' }}>
              Order #{order.or_id || selectedOrder.or_id}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {order.or_createddate
                ? formatDateDisplay(order.or_createddate)
                : selectedOrder.or_createddate
                  ? formatDateDisplay(selectedOrder.or_createddate)
                  : 'N/A'}
            </p>
          </div>
          <StatusBadge status={order.or_status || selectedOrder.or_status} />
        </div>
      </div>

      {/* Scrollable Items */}
      <OrderItems items={items} />

      {/* Sticky Total and Payment */}
      <OrderPaymentInfo
        total={order.or_total || selectedOrder.or_total}
        paymentType={order.or_payment_type}
        paymentReference={order.or_payment_reference}
      />
    </div>
  )
}

export default OrderDetails
