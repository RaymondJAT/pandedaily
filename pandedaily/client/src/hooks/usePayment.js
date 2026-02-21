import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createOrder, createGuestOrder } from '../services/api'

export const usePayment = (checkoutDetails, customerInfo, isGuest) => {
  const navigate = useNavigate()
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('')
  const [selectedPaymentDetails, setSelectedPaymentDetails] = useState(null)
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [apiError, setApiError] = useState('')

  // Payment methods configuration
  const paymentMethods = [
    {
      id: 'gcash',
      name: 'GCash',
      icon: 'FiSmartphone',
      color: '#008C41',
      description: 'Pay instantly via GCash mobile app',
      instructions: 'Scan QR code or send payment to our GCash number',
      fee: 0,
      iconBg: '#E8F5E9',
    },
    {
      id: 'maya',
      name: 'Maya',
      icon: 'FiSmartphone',
      color: '#6C1D5F',
      description: 'Pay using Maya (formerly PayMaya)',
      instructions: 'Send payment to our Maya account',
      fee: 0,
      iconBg: '#F3E5F5',
    },
    {
      id: 'card',
      name: 'Credit/Debit Card',
      icon: 'FiCard',
      color: '#1E88E5',
      description: 'Visa, Mastercard, JCB, UnionPay',
      instructions: 'Secure payment via PayMongo',
      fee: 0.025,
      iconBg: '#E3F2FD',
    },
  ]

  // Helper functions
  const formatDateForAPI = (dateStr) => {
    const date = new Date(dateStr)
    return date.toISOString().split('T')[0]
  }

  const combineDateAndTime = (dateStr, timeStr) => {
    return `${formatDateForAPI(dateStr)} ${timeStr}`
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

  const handlePaymentMethodSelect = (methodId) => {
    setPaymentMethod(methodId)
    const method = paymentMethods.find((m) => m.id === methodId)
    setSelectedPaymentDetails(method)
    setApiError('')
  }

  const calculateTotalWithFee = () => {
    if (!checkoutDetails || !selectedPaymentDetails) return checkoutDetails?.totalPrice || 0
    const fee = selectedPaymentDetails.fee * checkoutDetails.totalPrice
    return checkoutDetails.totalPrice + fee
  }

  const handlePaymentSubmit = async () => {
    setApiError('')

    if (!paymentMethod) {
      alert('Please select a payment method')
      return
    }

    if (!agreedToTerms) {
      alert('Please agree to the Terms & Conditions')
      return
    }

    if (!checkoutDetails) {
      alert('Checkout details not found. Please start over.')
      return
    }

    setIsProcessing(true)

    try {
      const endTime = calculateEndTime(checkoutDetails.selectedTime, checkoutDetails.schedule)

      // Format delivery schedules from selected dates
      const delivery_schedules = checkoutDetails.dates.map((dateStr) => {
        const formattedDate = formatDateForAPI(dateStr)
        const startDateTime = combineDateAndTime(dateStr, checkoutDetails.selectedTime)
        const endDateTime = combineDateAndTime(dateStr, endTime)

        return {
          name: checkoutDetails.schedule === 'morning' ? 'Morning Delivery' : 'Evening Delivery',
          date: formattedDate,
          start_time: startDateTime,
          end_time: endDateTime,
          cutoff: combineDateAndTime(dateStr, '23:59:59'),
        }
      })

      // Create order items from products
      const items = checkoutDetails.products.map((product) => ({
        product_id: product.id,
        quantity: product.quantity,
        price: product.price,
      }))

      let response

      if (isGuest) {
        const guestOrderData = {
          customer_id: null,
          customer_info: {
            fullname: customerInfo.fullname,
            email: customerInfo.email,
            contact: customerInfo.contact,
            address: customerInfo.address,
            latitude: customerInfo.latitude || checkoutDetails.customerInfo?.latitude || 0,
            longitude: customerInfo.longitude || checkoutDetails.customerInfo?.longitude || 0,
          },
          payment_type: paymentMethod.toUpperCase(),
          payment_reference: '',
          details: checkoutDetails.instructions || '',
          status: 'PAID',
          delivery_schedules: delivery_schedules,
          items: items,
        }

        console.log('Submitting GUEST order with coordinates:', guestOrderData)
        response = await createGuestOrder(guestOrderData)
      } else {
        const customer_id = customerInfo?.c_id

        if (!customer_id) {
          console.error('No customer ID found in customerInfo:', customerInfo)
          throw new Error('Customer ID is required for registered users')
        }

        const orderData = {
          customer_id: customer_id,
          payment_type: paymentMethod.toUpperCase(),
          payment_reference: '',
          details: checkoutDetails.instructions || '',
          status: 'PAID',
          delivery_schedules: delivery_schedules,
          items: items,
        }

        console.log('Submitting REGISTERED order:', orderData)
        response = await createOrder(orderData)
      }

      console.log('Order created successfully:', response)

      // Save confirmation to localStorage
      const confirmedOrder = {
        order_id: response.order_id,
        order_number: `ORD-${response.order_id}`,
        customer_info: customerInfo,
        order_details: {
          products: checkoutDetails.products,
          dates: checkoutDetails.dates,
          schedule: checkoutDetails.schedule,
          selectedTime: checkoutDetails.selectedTime,
          instructions: checkoutDetails.instructions,
          totalPieces: checkoutDetails.totalPieces,
        },
        payment_details: {
          id: selectedPaymentDetails.id,
          name: selectedPaymentDetails.name,
          color: selectedPaymentDetails.color,
          fee: selectedPaymentDetails.fee,
        },
        total_amount: calculateTotalWithFee(),
        delivery_schedules: response.delivery_schedules || delivery_schedules,
        created_at: new Date().toISOString(),
        isGuest: isGuest,
      }

      localStorage.setItem('confirmedOrder', JSON.stringify(confirmedOrder))

      // Cleanup localStorage
      localStorage.removeItem('checkoutDetails')
      localStorage.removeItem('pendingOrder')
      localStorage.removeItem('currentOrder')
      if (isGuest) {
        localStorage.removeItem('guestInfo')
      }

      return { success: true, orderId: response.order_id }
    } catch (error) {
      console.error('Error creating order:', error)
      setApiError(error.message || 'Failed to create order. Please try again.')
      return { success: false, error: error.message }
    } finally {
      setIsProcessing(false)
    }
  }

  return {
    paymentMethods,
    paymentMethod,
    selectedPaymentDetails,
    agreedToTerms,
    isProcessing,
    apiError,
    handlePaymentMethodSelect,
    setAgreedToTerms,
    handlePaymentSubmit,
    calculateTotalWithFee,
  }
}
