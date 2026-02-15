import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  FiUser,
  FiPhone,
  FiMail,
  FiMapPin,
  FiCalendar,
  FiPackage,
  FiClock,
  FiEdit2,
  FiCheckCircle,
  FiCreditCard,
  FiArrowLeft,
  FiSmartphone,
  FiCreditCard as FiCard,
  FiShield,
  FiLock,
  FiShoppingBag,
} from 'react-icons/fi'
import { useAuth } from '../../context/AuthContext'
import { createOrder } from '../../services/api'

const Checkout = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()

  const [orderDetails, setOrderDetails] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('')
  const [selectedPaymentDetails, setSelectedPaymentDetails] = useState(null)
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [customerInfo, setCustomerInfo] = useState(null)
  const [apiError, setApiError] = useState('')

  // Product ID constant (should match your database)
  const PRODUCT_ID = 1 // Pandesal product ID

  useEffect(() => {
    console.log('=== DEBUG: User object from AuthContext ===')
    console.log('User:', user)
    console.log('User type:', typeof user)

    if (user) {
      console.log('User keys:', Object.keys(user))
      console.log('c_fullname exists?:', 'c_fullname' in user)
      console.log('c_contact exists?:', 'c_contact' in user)
      console.log('c_email exists?:', 'c_email' in user)
      console.log('c_address exists?:', 'c_address' in user)
      console.log('Full user structure:', JSON.stringify(user, null, 2))
    }
  }, [user])

  // Animation variants
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, ease: 'easeOut' },
  }

  const staggerContainer = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  // Payment methods configuration (NO COD)
  const paymentMethods = [
    {
      id: 'gcash',
      name: 'GCash',
      icon: FiSmartphone,
      color: '#008C41',
      description: 'Pay instantly via GCash mobile app',
      instructions: 'Scan QR code or send payment to our GCash number',
      fee: 0,
      iconBg: '#E8F5E9',
    },
    {
      id: 'maya',
      name: 'Maya',
      icon: FiSmartphone,
      color: '#6C1D5F',
      description: 'Pay using Maya (formerly PayMaya)',
      instructions: 'Send payment to our Maya account',
      fee: 0,
      iconBg: '#F3E5F5',
    },
    {
      id: 'card',
      name: 'Credit/Debit Card',
      icon: FiCard,
      color: '#1E88E5',
      description: 'Visa, Mastercard, JCB, UnionPay',
      instructions: 'Secure payment via PayMongo',
      fee: 0.025, // 2.5% fee
      iconBg: '#E3F2FD',
    },
  ]

  // Helper function to format date for API (YYYY-MM-DD)
  const formatDateForAPI = (dateStr) => {
    const date = new Date(dateStr)
    return date.toISOString().split('T')[0]
  }

  // Helper function to combine date and time for datetime fields
  const combineDateAndTime = (dateStr, timeStr) => {
    // timeStr is in format 'HH:MM:SS'
    return `${formatDateForAPI(dateStr)} ${timeStr}`
  }

  // Helper function to format time for display
  const formatTimeForDisplay = (time) => {
    if (!time) return ''
    const [hours, minutes] = time.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour > 12 ? hour - 12 : hour
    return `${displayHour}:${minutes} ${ampm}`
  }

  // Helper function to calculate end time based on start time
  const calculateEndTime = (startTime, schedule) => {
    const [startHour, startMinute] = startTime.split(':').map(Number)

    let endHour, endMinute

    if (schedule === 'morning') {
      // Add 2.5 hours for morning deliveries
      endHour = startHour + 2
      endMinute = startMinute + 30
      if (endMinute >= 60) {
        endHour += 1
        endMinute -= 60
      }
    } else {
      // Add 3 hours for evening deliveries
      endHour = startHour + 3
      endMinute = startMinute
      if (endHour >= 24) {
        endHour = 23
        endMinute = 59
      }
    }

    // Format as HH:MM:SS
    return `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}:00`
  }

  // Load order details from navigation state or localStorage
  useEffect(() => {
    // First try to get from navigation state
    const orderFromState = location.state?.orderDetails

    if (orderFromState) {
      console.log('Order details from state:', orderFromState)
      setOrderDetails(orderFromState)
      // Also save to localStorage as backup
      localStorage.setItem('currentOrder', JSON.stringify(orderFromState))
    } else {
      // Fallback to localStorage
      const savedOrder = localStorage.getItem('currentOrder')
      if (savedOrder) {
        console.log('Order details from localStorage:', JSON.parse(savedOrder))
        setOrderDetails(JSON.parse(savedOrder))
      } else {
        // Try pendingOrder as last resort
        const pendingOrder = localStorage.getItem('pendingOrder')
        if (pendingOrder) {
          console.log('Order details from pendingOrder:', JSON.parse(pendingOrder))
          setOrderDetails(JSON.parse(pendingOrder))
        } else {
          navigate('/order')
        }
      }
    }
  }, [location.state, navigate])

  // Extract customer information from user object
  useEffect(() => {
    if (user) {
      console.log('User object in Checkout:', user)

      // Map user data to customer info
      const customerData = {
        c_fullname:
          user.c_fullname || user.fullname || user.name || user.username || 'Not provided',
        c_contact:
          user.c_contact ||
          user.contact ||
          user.phone ||
          user.phoneNumber ||
          user.mobile ||
          'Not provided',
        c_email: user.c_email || user.email || 'Not provided',
        c_address: user.c_address || user.address || user.delivery_address || 'Not provided',
        c_id: user.c_id || user.id || user._id || user.user_id || null,
        rawUser: user,
      }

      console.log('Mapped customer data:', customerData)
      setCustomerInfo(customerData)
    }
  }, [user])

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  const formatDateDisplay = (dateStr) => {
    const date = new Date(dateStr)
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ]
    return `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}`
  }

  const handleEditOrder = () => {
    navigate('/order')
  }

  const handleEditCustomerInfo = () => {
    navigate('/customer/profile')
  }

  const handlePaymentMethodSelect = (methodId) => {
    setPaymentMethod(methodId)
    const method = paymentMethods.find((m) => m.id === methodId)
    setSelectedPaymentDetails(method)
    setApiError('') // Clear any previous errors
  }

  const calculateTotalWithFee = () => {
    if (!orderDetails || !selectedPaymentDetails) return orderDetails?.totalPrice || 0
    const fee = selectedPaymentDetails.fee * orderDetails.totalPrice
    return orderDetails.totalPrice + fee
  }

  const handlePaymentSubmit = async () => {
    // Reset any previous errors
    setApiError('')

    // Validation
    if (!paymentMethod) {
      alert('Please select a payment method')
      return
    }

    if (!agreedToTerms) {
      alert('Please agree to the Terms & Conditions')
      return
    }

    if (!customerInfo || !customerInfo.c_id) {
      alert('Customer information not loaded properly. Please try again.')
      return
    }

    if (!orderDetails) {
      alert('Order details not found. Please start over.')
      return
    }

    if (!orderDetails.selectedTime) {
      alert('Delivery time not selected. Please go back to order page.')
      return
    }

    setIsProcessing(true)

    try {
      // Calculate end time based on selected start time
      const endTime = calculateEndTime(orderDetails.selectedTime, orderDetails.schedule)

      // Format delivery schedules from selected dates
      const delivery_schedules = orderDetails.dates.map((dateStr) => {
        const formattedDate = formatDateForAPI(dateStr)

        // Combine date with time for start_time and end_time
        const startDateTime = combineDateAndTime(dateStr, orderDetails.selectedTime)
        const endDateTime = combineDateAndTime(dateStr, endTime)

        return {
          name: orderDetails.schedule === 'morning' ? 'Morning Delivery' : 'Evening Delivery',
          date: formattedDate,
          start_time: startDateTime, // Now in format: YYYY-MM-DD HH:MM:SS
          end_time: endDateTime, // Now in format: YYYY-MM-DD HH:MM:SS
          cutoff: combineDateAndTime(dateStr, '23:59:59'), // Cutoff at midnight before delivery day
        }
      })

      // Create order items
      const items = [
        {
          product_id: PRODUCT_ID,
          quantity: orderDetails.totalPieces, // Total quantity across all delivery dates
          price: orderDetails.pricePerPiece,
        },
      ]

      // Prepare order data for API
      const orderData = {
        customer_id: customerInfo.c_id,
        payment_type: paymentMethod.toUpperCase(), // e.g., 'GCASH', 'MAYA', 'CARD'
        payment_reference: '', // Will be updated after payment confirmation
        details: orderDetails.instructions || '',
        status: 'PAID', // Initial status is PAID (order placed)
        delivery_schedules: delivery_schedules,
        items: items,
      }

      console.log('Submitting order to API:', JSON.stringify(orderData, null, 2))

      // Call the API to create order
      const response = await createOrder(orderData)

      console.log('Order created successfully:', response)

      // Store confirmed order details
      const confirmedOrder = {
        order_id: response.order_id,
        order_number: `ORD-${response.order_id}`,
        customer_info: customerInfo,
        order_details: {
          ...orderDetails,
          selectedTimeFormatted: formatTimeForDisplay(orderDetails.selectedTime),
          endTimeFormatted: formatTimeForDisplay(endTime),
        },
        payment_details: {
          id: selectedPaymentDetails.id,
          name: selectedPaymentDetails.name,
          color: selectedPaymentDetails.color,
          fee: selectedPaymentDetails.fee,
          // Remove the icon property
        },
        total_amount: calculateTotalWithFee(),
        delivery_schedules: response.delivery_schedules,
        created_at: new Date().toISOString(),
      }

      localStorage.setItem('confirmedOrder', JSON.stringify(confirmedOrder))

      // Clear temporary data
      localStorage.removeItem('currentOrder')
      localStorage.removeItem('pendingOrder')

      // Navigate to confirmation page with only serializable data
      navigate('/order/confirmation', {
        state: {
          orderId: response.order_id,
          // Only pass the order ID, let the confirmation page read from localStorage
        },
      })

      localStorage.setItem('confirmedOrder', JSON.stringify(confirmedOrder))

      // Clear temporary data
      localStorage.removeItem('currentOrder')
      localStorage.removeItem('pendingOrder')

      // Navigate to confirmation page
      navigate('/order/confirmation', {
        state: {
          orderId: response.order_id,
          orderDetails: confirmedOrder,
        },
      })
    } catch (error) {
      console.error('Error creating order:', error)
      setApiError(error.message || 'Failed to create order. Please try again.')
      alert(`Error: ${error.message || 'Failed to create order. Please try again.'}`)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleBack = () => {
    navigate(-1)
  }

  // Show loading only when essential data is missing
  if (!orderDetails || !user) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: '#F5EFE7' }}
      >
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#9C4A15] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p style={{ color: '#2A1803' }}>
            {!orderDetails ? 'Loading order details...' : 'Loading customer information...'}
          </p>
        </div>
      </div>
    )
  }

  // If customerInfo hasn't been extracted yet, show a loading state
  if (!customerInfo) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: '#F5EFE7' }}
      >
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#9C4A15] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p style={{ color: '#2A1803' }}>Preparing customer information...</p>
        </div>
      </div>
    )
  }

  return (
    <section className="min-h-screen py-8 md:py-12" style={{ backgroundColor: '#F5EFE7' }}>
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          className="text-center mb-8 md:mb-12"
          initial="initial"
          animate="animate"
          variants={fadeInUp}
        >
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-[#9C4A15] hover:text-[#8a3f12] transition-colors"
            >
              <FiArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back</span>
            </button>
            <h1
              className="text-2xl md:text-3xl font-light font-[titleFont]"
              style={{ color: '#2A1803' }}
            >
              Checkout
            </h1>
            <div className="w-20"></div>
          </div>
          <div className="h-1 w-32 mx-auto" style={{ backgroundColor: '#9C4A15' }}></div>
        </motion.div>

        {/* Error message display */}
        {apiError && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {apiError}
          </div>
        )}

        <motion.div
          className="mx-auto"
          initial="initial"
          animate="animate"
          variants={staggerContainer}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Customer Information & Payment Methods */}
            <div className="flex flex-col space-y-8">
              {/* Customer Information Card */}
              <motion.div
                className="bg-white rounded-xl shadow-lg p-6 md:p-7 flex-1"
                variants={fadeInUp}
              >
                <div className="flex justify-between items-center mb-6">
                  <h2
                    className="text-xl md:text-2xl font-light font-[titleFont]"
                    style={{ color: '#2A1803' }}
                  >
                    <div className="flex items-center gap-3">
                      <FiUser className="text-[#9C4A15]" />
                      Customer Information
                    </div>
                  </h2>
                  <button
                    onClick={handleEditCustomerInfo}
                    className="flex items-center gap-2 text-sm text-[#9C4A15] hover:text-[#8a3f12] transition-colors"
                  >
                    <FiEdit2 className="w-4 h-4" />
                    Edit
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[calc(100%-4rem)]">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <FiUser className="w-5 h-5 text-[#9C4A15] mt-1 shrink-0" />
                      <div>
                        <p className="text-sm font-medium" style={{ color: '#9C4A15' }}>
                          Full Name
                        </p>
                        <p className="text-lg font-[titleFont]" style={{ color: '#2A1803' }}>
                          {customerInfo.c_fullname}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <FiPhone className="w-5 h-5 text-[#9C4A15] mt-1 shrink-0" />
                      <div>
                        <p className="text-sm font-medium" style={{ color: '#9C4A15' }}>
                          Contact Number
                        </p>
                        <p className="text-lg font-[titleFont]" style={{ color: '#2A1803' }}>
                          {customerInfo.c_contact}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <FiMail className="w-5 h-5 text-[#9C4A15] mt-1 shrink-0" />
                      <div>
                        <p className="text-sm font-medium" style={{ color: '#9C4A15' }}>
                          Email Address
                        </p>
                        <p className="text-lg font-[titleFont]" style={{ color: '#2A1803' }}>
                          {customerInfo.c_email}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <FiMapPin className="w-5 h-5 text-[#9C4A15] mt-1 shrink-0" />
                      <div>
                        <p className="text-sm font-medium" style={{ color: '#9C4A15' }}>
                          Delivery Address
                        </p>
                        <p className="text-lg font-[titleFont]" style={{ color: '#2A1803' }}>
                          {customerInfo.c_address}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Payment Method Selection Card */}
              <motion.div
                className="bg-white rounded-xl shadow-lg p-6 md:p-7 flex-1"
                variants={fadeInUp}
                transition={{ delay: 0.1 }}
              >
                <h2
                  className="text-xl md:text-2xl font-light font-[titleFont] mb-6"
                  style={{ color: '#2A1803' }}
                >
                  <div className="flex items-center gap-3">
                    <FiCreditCard className="text-[#9C4A15]" />
                    Select Payment Method
                  </div>
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 h-[calc(100%-7rem)]">
                  {paymentMethods.map((method) => {
                    const Icon = method.icon
                    return (
                      <button
                        key={method.id}
                        onClick={() => handlePaymentMethodSelect(method.id)}
                        className={`p-5 rounded-xl border-2 transition-all duration-200 text-left hover:scale-[1.02] cursor-pointer flex flex-col ${
                          paymentMethod === method.id
                            ? 'border-[#9C4A15] shadow-lg'
                            : 'border-gray-200 hover:border-[#9C4A15]/50'
                        }`}
                        style={{
                          backgroundColor: paymentMethod === method.id ? '#F5EFE7' : 'white',
                        }}
                      >
                        <div className="flex flex-col items-center text-center h-full">
                          <div
                            className="w-16 h-16 rounded-xl flex items-center justify-center mb-4"
                            style={{ backgroundColor: method.iconBg }}
                          >
                            <Icon className="w-8 h-8" style={{ color: method.color }} />
                          </div>
                          <h3
                            className="font-bold font-[titleFont] text-lg mb-2"
                            style={{ color: '#2A1803' }}
                          >
                            {method.name}
                          </h3>
                          <p className="text-sm mb-3 grow" style={{ color: '#9C4A15' }}>
                            {method.description}
                          </p>
                          {method.fee > 0 ? (
                            <div className="mt-auto">
                              <span
                                className="text-xs px-3 py-1 rounded-full"
                                style={{ backgroundColor: '#FEF3C7', color: '#92400E' }}
                              >
                                +{method.fee * 100}% processing fee
                              </span>
                            </div>
                          ) : (
                            <div className="mt-auto">
                              <span
                                className="text-xs px-3 py-1 rounded-full"
                                style={{ backgroundColor: '#E8F5E9', color: '#008C41' }}
                              >
                                No additional fees
                              </span>
                            </div>
                          )}
                        </div>
                      </button>
                    )
                  })}
                </div>

                {/* Security Badge */}
                <div
                  className="flex items-center justify-center gap-3 p-4 rounded-lg"
                  style={{ backgroundColor: '#F5EFE7', border: '1px solid rgba(156, 74, 21, 0.2)' }}
                >
                  <FiShield className="w-5 h-5" style={{ color: '#9C4A15' }} />
                  <div className="text-center">
                    <p className="font-medium text-sm" style={{ color: '#2A1803' }}>
                      Secure Payment Processing
                    </p>
                    <p className="text-xs" style={{ color: '#9C4A15' }}>
                      All transactions are encrypted and protected
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Right Column - Order Summary */}
            <div className="flex flex-col">
              <motion.div className="flex flex-col" variants={fadeInUp} transition={{ delay: 0.2 }}>
                <div className="bg-white rounded-xl shadow-lg p-6 md:p-7 flex-1 flex flex-col">
                  <div className="flex justify-between items-center mb-6">
                    <h2
                      className="text-xl md:text-2xl font-light font-[titleFont]"
                      style={{ color: '#2A1803' }}
                    >
                      <div className="flex items-center gap-3">
                        <FiShoppingBag className="text-[#9C4A15]" />
                        Order Summary
                      </div>
                    </h2>
                    <button
                      onClick={handleEditOrder}
                      className="flex items-center gap-2 text-sm text-[#9C4A15] hover:text-[#8a3f12]"
                    >
                      <FiEdit2 className="w-4 h-4" />
                      Edit
                    </button>
                  </div>

                  {/* Order Details */}
                  <div className="space-y-4 mb-6 flex-1">
                    <div className="grid grid-cols-2 gap-4">
                      <div
                        className="p-3 rounded-lg"
                        style={{
                          backgroundColor: '#F5EFE7',
                          border: '1px solid rgba(156, 74, 21, 0.1)',
                        }}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <FiCalendar className="w-4 h-4" style={{ color: '#9C4A15' }} />
                          <span className="text-xs font-medium" style={{ color: '#9C4A15' }}>
                            Delivery Days
                          </span>
                        </div>
                        <p
                          className="text-lg font-bold font-[titleFont]"
                          style={{ color: '#2A1803' }}
                        >
                          {orderDetails.dates.length}
                        </p>
                      </div>

                      <div
                        className="p-3 rounded-lg"
                        style={{
                          backgroundColor: '#F5EFE7',
                          border: '1px solid rgba(156, 74, 21, 0.1)',
                        }}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <FiPackage className="w-4 h-4" style={{ color: '#9C4A15' }} />
                          <span className="text-xs font-medium" style={{ color: '#9C4A15' }}>
                            Per Delivery
                          </span>
                        </div>
                        <p
                          className="text-lg font-bold font-[titleFont]"
                          style={{ color: '#2A1803' }}
                        >
                          {orderDetails.quantity} pcs
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div
                        className="p-3 rounded-lg"
                        style={{
                          backgroundColor: '#F5EFE7',
                          border: '1px solid rgba(156, 74, 21, 0.1)',
                        }}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <FiClock className="w-4 h-4" style={{ color: '#9C4A15' }} />
                          <span className="text-xs font-medium" style={{ color: '#9C4A15' }}>
                            Delivery Time
                          </span>
                        </div>
                        <p className="text-sm font-[titleFont]" style={{ color: '#2A1803' }}>
                          {orderDetails.selectedTime
                            ? formatTimeForDisplay(orderDetails.selectedTime)
                            : 'Not selected'}
                        </p>
                      </div>

                      <div
                        className="p-3 rounded-lg"
                        style={{
                          backgroundColor: '#F5EFE7',
                          border: '1px solid rgba(156, 74, 21, 0.1)',
                        }}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <FiCheckCircle className="w-4 h-4" style={{ color: '#9C4A15' }} />
                          <span className="text-xs font-medium" style={{ color: '#9C4A15' }}>
                            Price
                          </span>
                        </div>
                        <p className="text-sm font-[titleFont]" style={{ color: '#2A1803' }}>
                          {formatCurrency(orderDetails.pricePerPiece)}/pc
                        </p>
                      </div>
                    </div>

                    {orderDetails.instructions && (
                      <div
                        className="p-3 rounded-lg"
                        style={{
                          backgroundColor: '#F5EFE7',
                          border: '1px solid rgba(156, 74, 21, 0.2)',
                        }}
                      >
                        <p className="text-xs font-medium mb-1" style={{ color: '#9C4A15' }}>
                          Special Instructions
                        </p>
                        <p className="text-sm font-[titleFont]" style={{ color: '#2A1803' }}>
                          {orderDetails.instructions.length > 60
                            ? `${orderDetails.instructions.substring(0, 60)}...`
                            : orderDetails.instructions}
                        </p>
                      </div>
                    )}

                    {/* Selected Dates */}
                    <div
                      className="p-3 rounded-lg"
                      style={{
                        backgroundColor: '#F5EFE7',
                        border: '1px solid rgba(156, 74, 21, 0.2)',
                      }}
                    >
                      <p className="text-xs font-medium mb-2" style={{ color: '#9C4A15' }}>
                        {orderDetails.dates.length} Delivery Date
                        {orderDetails.dates.length !== 1 ? 's' : ''}
                      </p>
                      <div className="text-xs space-y-1 max-h-20 overflow-y-auto">
                        {orderDetails.dates.slice(0, 3).map((dateStr, index) => (
                          <div key={index} className="flex justify-between">
                            <span style={{ color: '#2A1803' }}>{formatDateDisplay(dateStr)}</span>
                            <span style={{ color: '#9C4A15' }}>
                              {orderDetails.selectedTime
                                ? formatTimeForDisplay(orderDetails.selectedTime)
                                : 'Time TBD'}
                            </span>
                          </div>
                        ))}
                        {orderDetails.dates.length > 3 && (
                          <p className="text-center pt-1" style={{ color: '#9C4A15' }}>
                            +{orderDetails.dates.length - 3} more
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Pricing */}
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between items-center">
                      <span className="font-[titleFont]" style={{ color: '#2A1803' }}>
                        Subtotal
                      </span>
                      <span className="font-bold font-[titleFont]" style={{ color: '#9C4A15' }}>
                        {formatCurrency(orderDetails.totalPrice)}
                      </span>
                    </div>

                    {selectedPaymentDetails && selectedPaymentDetails.fee > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="font-[titleFont] text-sm" style={{ color: '#2A1803' }}>
                          Payment Fee
                        </span>
                        <span className="font-[titleFont] text-sm" style={{ color: '#DC2626' }}>
                          +{formatCurrency(selectedPaymentDetails.fee * orderDetails.totalPrice)}
                        </span>
                      </div>
                    )}

                    <div className="h-px" style={{ backgroundColor: '#F5EFE7' }}></div>

                    <div className="flex justify-between items-center pt-2">
                      <span
                        className="font-bold font-[titleFont] text-lg"
                        style={{ color: '#2A1803' }}
                      >
                        Total Amount
                      </span>
                      <span
                        className="font-bold font-[titleFont] text-xl"
                        style={{ color: '#9C4A15' }}
                      >
                        {formatCurrency(calculateTotalWithFee())}
                      </span>
                    </div>
                  </div>

                  {/* Selected Payment Preview */}
                  {selectedPaymentDetails && (
                    <div
                      className="mb-4 p-3 rounded-lg"
                      style={{
                        backgroundColor: '#F5EFE7',
                        border: '1px solid rgba(156, 74, 21, 0.3)',
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: selectedPaymentDetails.iconBg }}
                        >
                          <selectedPaymentDetails.icon
                            className="w-4 h-4"
                            style={{ color: selectedPaymentDetails.color }}
                          />
                        </div>
                        <div>
                          <p
                            className="font-bold font-[titleFont] text-sm"
                            style={{ color: '#2A1803' }}
                          >
                            {selectedPaymentDetails.name}
                          </p>
                          <div className="flex items-center gap-1 text-xs">
                            <FiLock className="w-3 h-3" style={{ color: '#9C4A15' }} />
                            <span style={{ color: '#2A1803' }}>Secure payment</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Terms & Conditions */}
                  <div className="mb-4">
                    <label className="flex items-start">
                      <input
                        type="checkbox"
                        checked={agreedToTerms}
                        onChange={(e) => setAgreedToTerms(e.target.checked)}
                        className="mt-1 mr-3 w-4 h-4 text-[#9C4A15] focus:ring-[#9C4A15] rounded"
                      />
                      <span className="text-xs" style={{ color: '#2A1803' }}>
                        I agree to the{' '}
                        <a href="/terms" className="text-[#9C4A15] hover:underline">
                          Terms & Conditions
                        </a>
                      </span>
                    </label>
                  </div>

                  {/* Submit Button */}
                  <button
                    onClick={handlePaymentSubmit}
                    disabled={isProcessing || !paymentMethod || !agreedToTerms}
                    className="w-full py-4 rounded-full font-bold font-[titleFont] text-lg transition-all duration-200 shadow-xl hover:shadow-2xl hover:scale-105 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      backgroundColor: paymentMethod && agreedToTerms ? '#9C4A15' : '#9CA3AF',
                      color: '#F5EFE7',
                    }}
                  >
                    {isProcessing ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Processing...
                      </div>
                    ) : (
                      `Pay ${formatCurrency(calculateTotalWithFee())}`
                    )}
                  </button>

                  {/* Validation Messages */}
                  {!paymentMethod && (
                    <p className="text-center mt-2 text-xs" style={{ color: '#DC2626' }}>
                      Select payment method
                    </p>
                  )}
                  {!agreedToTerms && paymentMethod && (
                    <p className="text-center mt-2 text-xs" style={{ color: '#DC2626' }}>
                      Agree to terms
                    </p>
                  )}

                  <div
                    className="flex items-center justify-center gap-2 mt-3 text-xs"
                    style={{ color: '#9C4A15' }}
                  >
                    <FiShield className="w-3 h-3" />
                    <span>Secure • Free Delivery • Fresh Daily</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default Checkout
