import { useEffect, useState, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiCheckCircle, FiXCircle } from 'react-icons/fi'
import { createOrder, createGuestOrder } from '../../services/api'

const PaymentSuccess = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [status, setStatus] = useState('processing')
  const [error, setError] = useState('')
  const [orderDetails, setOrderDetails] = useState(null)

  const processedRef = useRef(false)

  useEffect(() => {
    // Prevent double execution
    if (processedRef.current) {
      console.log('Already processing, skipping...')
      return
    }

    const handlePaymentSuccess = async () => {
      // Mark as processing immediately
      processedRef.current = true

      try {
        const urlSessionId = searchParams.get('session_id')

        // Get stored checkout details
        const checkoutDetails = JSON.parse(localStorage.getItem('checkoutDetails') || '{}')

        // Use URL session ID if it's not the placeholder, otherwise use stored session ID
        const sessionId =
          urlSessionId !== '{CHECKOUT_SESSION_ID}'
            ? urlSessionId
            : checkoutDetails.paymongo_session_id

        if (!sessionId) {
          throw new Error('No session ID found')
        }

        console.log('Processing payment for session:', sessionId)
        console.log('URL session ID:', urlSessionId)
        console.log('Stored session ID:', checkoutDetails.paymongo_session_id)

        // Check if this order was already processed
        const processedKey = `order_created_${sessionId}`
        if (sessionStorage.getItem(processedKey)) {
          console.log('Order already created for this session, showing success')
          setStatus('success')
          return
        }

        const isGuest = checkoutDetails.customer_info?.isGuest || false

        const formatDateForMySQL = (dateStr) => {
          const date = new Date(dateStr)
          const year = date.getFullYear()
          const month = String(date.getMonth() + 1).padStart(2, '0')
          const day = String(date.getDate()).padStart(2, '0')
          return `${year}-${month}-${day}`
        }

        const combineDateAndTime = (dateStr, timeStr) => {
          const formattedDate = formatDateForMySQL(dateStr)
          return `${formattedDate} ${timeStr}`
        }

        const calculateEndTime = (startTime, schedule) => {
          const [startHour, startMinute] = startTime.split(':').map(Number)
          let endHour, endMinute

          if (schedule === 'morning') {
            endHour = startHour + 2
            endMinute = startMinute + 30
            if (endMinute >= 60) {
              endHour += 1
              endMinute -= 60
            }
          } else {
            endHour = startHour + 3
            endMinute = startMinute
            if (endHour >= 24) {
              endHour = 23
              endMinute = 59
            }
          }
          return `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}:00`
        }

        // Format delivery schedules with proper MySQL datetime format
        const delivery_schedules =
          checkoutDetails.delivery_schedules?.map((schedule) => {
            const formattedDate = formatDateForMySQL(schedule.date)
            const endTime = calculateEndTime(schedule.time, schedule.schedule)

            return {
              name: schedule.schedule === 'morning' ? 'Morning Delivery' : 'Evening Delivery',
              date: formattedDate,
              start_time: combineDateAndTime(schedule.date, schedule.time),
              end_time: combineDateAndTime(schedule.date, endTime),
              cutoff: combineDateAndTime(schedule.date, '23:59:59'),
            }
          }) || []

        // Create order items
        const items =
          checkoutDetails.products?.map((product) => ({
            product_id: product.id,
            quantity: product.quantity,
            price: product.price,
          })) || []

        let response

        if (isGuest) {
          const guestOrderData = {
            customer_id: null,
            customer_info: checkoutDetails.customer_info,
            payment_type: checkoutDetails.selectedPaymentMethod?.toUpperCase() || 'CARD',
            payment_reference: sessionId,
            details: checkoutDetails.special_instructions || '',
            status: 'PAID',
            delivery_schedules: delivery_schedules,
            items: items,
          }

          console.log('Creating GUEST order with payment ref:', sessionId)
          response = await createGuestOrder(guestOrderData)
        } else {
          const orderData = {
            customer_id: checkoutDetails.customer_id,
            payment_type: checkoutDetails.selectedPaymentMethod?.toUpperCase() || 'CARD',
            payment_reference: sessionId,
            details: checkoutDetails.special_instructions || '',
            status: 'PAID',
            delivery_schedules: delivery_schedules,
            items: items,
          }

          console.log('Creating REGISTERED order with payment ref:', sessionId)
          response = await createOrder(orderData)
        }

        console.log('Order created successfully:', response)

        // Mark as created in sessionStorage
        sessionStorage.setItem(processedKey, 'true')
        sessionStorage.setItem(`order_id_${sessionId}`, response.order_id)

        setOrderDetails({
          id: response.order_id,
          reference: checkoutDetails.reference,
        })

        // Clear stored data
        localStorage.removeItem('checkoutDetails')
        localStorage.removeItem('paymongoCheckoutUrl')
        localStorage.removeItem('paymongoSessionId')
        localStorage.removeItem('pendingOrder')

        setStatus('success')
      } catch (err) {
        console.error('Payment success handling error:', err)
        setStatus('error')
        setError(err.message || 'Failed to process payment')

        // Reset the processed flag on error so user can retry
        processedRef.current = false
      }
    }

    handlePaymentSuccess()
  }, [searchParams])

  if (status === 'processing') {
    return (
      <div className="min-h-screen bg-[#F5EFE7] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#9C4A15] border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-600">Processing your payment...</p>
        </div>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-[#F5EFE7] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center"
        >
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiXCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-bold mb-2" style={{ color: '#2A1803' }}>
            Payment Failed
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/checkout')}
            className="px-6 py-3 bg-[#9C4A15] text-white rounded-lg hover:opacity-90 transition-opacity"
          >
            Try Again
          </button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F5EFE7] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
          className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
        >
          <FiCheckCircle className="w-8 h-8 text-green-600" />
        </motion.div>

        <h2 className="text-xl font-bold mb-2" style={{ color: '#2A1803' }}>
          Payment Successful!
        </h2>

        <p className="text-gray-600 mb-2">Your order has been placed successfully.</p>

        {orderDetails && (
          <p className="text-sm text-gray-500 mb-1">
            Order Reference: #{orderDetails.reference || orderDetails.id}
          </p>
        )}

        <p className="text-sm text-gray-500 mb-6">The admin will process your order shortly.</p>

        <button
          onClick={() => navigate('/my-order')}
          className="px-6 py-3 bg-[#9C4A15] text-white rounded-lg hover:opacity-90 transition-colors"
        >
          View My Orders
        </button>
      </motion.div>
    </div>
  )
}

export default PaymentSuccess
