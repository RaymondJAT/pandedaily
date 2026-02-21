import { formatCurrency } from '../../utils/formatters'

const OrderPaymentInfo = ({ total, paymentType, paymentReference }) => {
  return (
    <div className="p-6 border-t bg-gray-50 rounded-b-xl shrink-0">
      <div className="flex justify-between font-medium py-2 mb-3">
        <span>Total</span>
        <span style={{ color: '#9C4A15' }}>{formatCurrency(total || 0)}</span>
      </div>

      <div className="text-sm space-y-2">
        <div className="flex items-center">
          <span className="text-gray-500 w-24">Payment:</span>
          <span style={{ color: '#2A1803' }}>{paymentType || 'N/A'}</span>
        </div>
        {paymentReference && (
          <div className="flex items-center">
            <span className="text-gray-500 w-24">Reference:</span>
            <span style={{ color: '#2A1803' }}>{paymentReference}</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default OrderPaymentInfo
