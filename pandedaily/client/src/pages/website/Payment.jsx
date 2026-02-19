import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  FiUser,
  FiEdit2,
  FiCreditCard,
  FiArrowLeft,
  FiSmartphone,
  FiCreditCard as FiCard,
  FiShield,
  FiShoppingBag,
} from 'react-icons/fi'
import { useAuth } from '../../context/AuthContext'
import { createOrder, createGuestOrder } from '../../services/api'

const Payment = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()

  const [checkoutDetails, setCheckoutDetails] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('')
  const [selectedPaymentDetails, setSelectedPaymentDetails] = useState(null)
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [apiError, setApiError] = useState('')
  const [customerInfo, setCustomerInfo] = useState(null)
  const [isGuest, setIsGuest] = useState(false)

  // Animation variants - matching Order page
  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.7, ease: 'easeOut' },
  }

  const fadeIn = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.8, ease: 'easeOut' },
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

  const faqItem = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, ease: 'easeOut' },
  }

  // Payment methods configuration
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
      fee: 0.025,
      iconBg: '#E3F2FD',
    },
  ]

  // Helper function to format date for API
  const formatDateForAPI = (dateStr) => {
    const date = new Date(dateStr)
    return date.toISOString().split('T')[0]
  }

  // Helper function to combine date and time
  const combineDateAndTime = (dateStr, timeStr) => {
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

  // Helper function to calculate end time
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

  // Load checkout details from navigation state or localStorage
  useEffect(() => {
    const detailsFromState = location.state?.checkoutDetails

    if (detailsFromState) {
      console.log('Checkout details from state:', detailsFromState)
      setCheckoutDetails(detailsFromState)

      // Extract customer info based on whether it's guest or registered user
      if (detailsFromState.customerInfo) {
        console.log('📦 Customer info from state:', detailsFromState.customerInfo)

        const customerData = {
          fullname:
            detailsFromState.customerInfo.fullname ||
            detailsFromState.customerInfo.c_fullname ||
            detailsFromState.customerInfo.name ||
            'Customer',
          contact:
            detailsFromState.customerInfo.contact ||
            detailsFromState.customerInfo.c_contact ||
            detailsFromState.customerInfo.phone ||
            'Not provided',
          email:
            detailsFromState.customerInfo.email ||
            detailsFromState.customerInfo.c_email ||
            'Not provided',
          address:
            detailsFromState.customerInfo.address ||
            detailsFromState.customerInfo.c_address ||
            'Not provided',
          // Add this
          latitude:
            detailsFromState.customerInfo.latitude || detailsFromState.customerInfo.c_latitude || 0,
          // Add this
          longitude:
            detailsFromState.customerInfo.longitude ||
            detailsFromState.customerInfo.c_longitude ||
            0,
          c_id:
            detailsFromState.customerInfo.c_id ||
            detailsFromState.customerInfo.id ||
            detailsFromState.customerInfo.customer_id ||
            detailsFromState.customerInfo.userId ||
            null,
          isGuest: detailsFromState.isGuest || false,
        }

        console.log('📋 Processed customer data:', customerData)
        setCustomerInfo(customerData)
        setIsGuest(detailsFromState.isGuest || false)
      }

      localStorage.setItem('checkoutDetails', JSON.stringify(detailsFromState))
    } else {
      const savedDetails = localStorage.getItem('checkoutDetails')
      if (savedDetails) {
        const parsedDetails = JSON.parse(savedDetails)
        console.log('Checkout details from localStorage:', parsedDetails)
        setCheckoutDetails(parsedDetails)

        // Extract customer info from saved details
        if (parsedDetails.customerInfo) {
          const customerData = {
            fullname:
              parsedDetails.customerInfo.fullname ||
              parsedDetails.customerInfo.c_fullname ||
              'Customer',
            contact:
              parsedDetails.customerInfo.contact ||
              parsedDetails.customerInfo.c_contact ||
              'Not provided',
            email:
              parsedDetails.customerInfo.email ||
              parsedDetails.customerInfo.c_email ||
              'Not provided',
            address:
              parsedDetails.customerInfo.address ||
              parsedDetails.customerInfo.c_address ||
              'Not provided',
            isGuest: parsedDetails.isGuest || false,
          }
          setCustomerInfo(customerData)
          setIsGuest(parsedDetails.isGuest || false)
        }
      } else {
        navigate('/checkout')
      }
    }
  }, [location.state, navigate])

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

  const handleEditCheckout = () => {
    navigate('/checkout')
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
            latitude: customerInfo.latitude || checkoutDetails.customerInfo?.latitude || 0, // Add this
            longitude: customerInfo.longitude || checkoutDetails.customerInfo?.longitude || 0, // Add this
          },
          payment_type: paymentMethod.toUpperCase(),
          payment_reference: '',
          details: checkoutDetails.instructions || '',
          status: 'PAID',
          delivery_schedules: delivery_schedules,
          items: items,
        }

        console.log('📦 Submitting GUEST order with coordinates:', guestOrderData)
        response = await createGuestOrder(guestOrderData)
      } else {
        // ✅ REGISTERED CUSTOMER: Use createOrder (requires customer_id)
        console.log('🔍 Registered user - customerInfo state:', customerInfo)

        // Use the ID from our processed customerInfo state
        const customer_id = customerInfo?.c_id

        if (!customer_id) {
          console.error('❌ No customer ID found in customerInfo:', customerInfo)
          throw new Error('Customer ID is required for registered users')
        }

        console.log('✅ Found customer ID:', customer_id)

        const orderData = {
          customer_id: customer_id,
          payment_type: paymentMethod.toUpperCase(),
          payment_reference: '',
          details: checkoutDetails.instructions || '',
          status: 'PAID',
          delivery_schedules: delivery_schedules,
          items: items,
        }

        console.log('📦 Submitting REGISTERED order:', orderData)
        response = await createOrder(orderData)
      }

      console.log('✅ Order created successfully:', response)

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

      // Navigate to confirmation page
      navigate('/order/confirmation', {
        state: {
          orderId: response.order_id,
          isGuest: isGuest,
        },
      })
    } catch (error) {
      console.error('❌ Error creating order:', error)
      setApiError(error.message || 'Failed to create order. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleBack = () => {
    navigate(-1)
  }

  if (!checkoutDetails || !customerInfo) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: '#F5EFE7' }}
      >
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#9C4A15] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p style={{ color: '#2A1803' }}>Loading payment details...</p>
        </div>
      </div>
    )
  }

  return (
    <section className="min-h-screen py-8 md:py-12" style={{ backgroundColor: '#F5EFE7' }}>
      <div className="container mx-auto px-4">
        {/* Header Section - matching Order page */}
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
              className="text-2xl md:text-3xl lg:text-4xl font-light font-[titleFont]"
              style={{ color: '#2A1803' }}
            >
              Payment
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10">
            {/* LEFT COLUMN - Payment Methods */}
            <div className="flex flex-col space-y-8">
              {/* Customer Info Summary */}
              <motion.div className="flex flex-col" variants={faqItem}>
                <h2
                  className="text-xl md:text-2xl font-light mb-6 font-[titleFont]"
                  style={{ color: '#2A1803' }}
                >
                  <div className="flex items-center gap-3">
                    <FiUser className="text-[#9C4A15]" />
                    {isGuest ? 'Guest Customer' : 'Customer'}
                  </div>
                </h2>

                <div className="bg-white rounded-xl shadow-lg p-6 md:p-7">
                  <div className="space-y-3">
                    <p className="text-lg font-[titleFont]" style={{ color: '#2A1803' }}>
                      {customerInfo.fullname}
                    </p>
                    <p className="text-sm" style={{ color: '#9C4A15' }}>
                      {customerInfo.email} • {customerInfo.contact}
                    </p>
                    <p className="text-sm" style={{ color: '#2A1803' }}>
                      📍 {customerInfo.address}
                    </p>
                    {isGuest && (
                      <span
                        className="inline-block px-3 py-1 text-xs rounded-full"
                        style={{ backgroundColor: '#F5EFE7', color: '#9C4A15' }}
                      >
                        Guest Checkout
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* Payment Method Selection */}
              <motion.div className="flex flex-col" variants={faqItem} transition={{ delay: 0.1 }}>
                <h2
                  className="text-xl md:text-2xl font-light mb-6 font-[titleFont]"
                  style={{ color: '#2A1803' }}
                >
                  <div className="flex items-center gap-3">
                    <FiCreditCard className="text-[#9C4A15]" />
                    Select Payment Method
                  </div>
                </h2>

                <div className="bg-white rounded-xl shadow-lg p-6 md:p-7">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    {paymentMethods.map((method) => {
                      const Icon = method.icon
                      return (
                        <button
                          key={method.id}
                          onClick={() => handlePaymentMethodSelect(method.id)}
                          className={`p-5 rounded-xl border-2 transition-all duration-200 hover:scale-[1.02] cursor-pointer flex flex-col ${
                            paymentMethod === method.id
                              ? 'border-[#9C4A15] bg-[#F5EFE7]'
                              : 'border-gray-200 hover:border-[#9C4A15]/50'
                          }`}
                          style={{
                            backgroundColor: paymentMethod === method.id ? '#F5EFE7' : 'white',
                          }}
                        >
                          <div className="flex flex-col items-center text-center">
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
                            {method.fee > 0 ? (
                              <span
                                className="text-xs px-3 py-1 rounded-full"
                                style={{ backgroundColor: '#FEF3C7', color: '#92400E' }}
                              >
                                +{method.fee * 100}% fee
                              </span>
                            ) : (
                              <span
                                className="text-xs px-3 py-1 rounded-full"
                                style={{ backgroundColor: '#E8F5E9', color: '#008C41' }}
                              >
                                No fee
                              </span>
                            )}
                          </div>
                        </button>
                      )
                    })}
                  </div>

                  {/* Security Badge */}
                  <div
                    className="flex items-center justify-center gap-3 p-4 rounded-lg"
                    style={{
                      backgroundColor: '#F5EFE7',
                      border: '1px solid rgba(156, 74, 21, 0.2)',
                    }}
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
                </div>
              </motion.div>
            </div>

            {/* RIGHT COLUMN - Order Summary */}
            <div className="flex flex-col">
              <motion.div className="flex flex-col" variants={faqItem} transition={{ delay: 0.2 }}>
                <h2
                  className="text-xl md:text-2xl font-light mb-6 font-[titleFont]"
                  style={{ color: '#2A1803' }}
                >
                  <div className="flex items-center gap-3">
                    <FiShoppingBag className="text-[#9C4A15]" />
                    Order Summary
                  </div>
                </h2>

                <div className="bg-white rounded-xl shadow-lg p-6 md:p-7 flex-1 flex flex-col">
                  <div className="flex justify-between items-center mb-6">
                    <button
                      onClick={handleEditCheckout}
                      className="flex items-center gap-2 text-sm text-[#9C4A15] hover:text-[#8a3f12]"
                    >
                      <FiEdit2 className="w-4 h-4" />
                      Edit Order
                    </button>
                  </div>

                  <div className="space-y-4 flex-1">
                    {/* Products Summary */}
                    <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                      <h3
                        className="font-medium font-[titleFont] text-sm"
                        style={{ color: '#9C4A15' }}
                      >
                        Products
                      </h3>
                      {checkoutDetails.products.map((product) => (
                        <div key={product.id} className="flex justify-between items-center text-sm">
                          <span style={{ color: '#2A1803' }}>
                            {product.name} x {product.quantity}
                          </span>
                          <span style={{ color: '#9C4A15' }}>
                            {formatCurrency(product.quantity * product.price)}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="font-[titleFont] text-base" style={{ color: '#2A1803' }}>
                        Delivery Days
                      </span>
                      <span
                        className="font-bold font-[titleFont] text-lg"
                        style={{ color: '#9C4A15' }}
                      >
                        {checkoutDetails.dates.length}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="font-[titleFont] text-base" style={{ color: '#2A1803' }}>
                        Delivery Time
                      </span>
                      <span
                        className="font-bold font-[titleFont] text-lg"
                        style={{ color: '#9C4A15' }}
                      >
                        {formatTimeForDisplay(checkoutDetails.selectedTime)}
                      </span>
                    </div>

                    {/* Selected Dates Preview */}
                    <div
                      className="p-3 rounded-lg"
                      style={{
                        backgroundColor: '#F5EFE7',
                        border: '1px solid rgba(156, 74, 21, 0.2)',
                      }}
                    >
                      <p className="text-xs font-medium mb-2" style={{ color: '#9C4A15' }}>
                        Delivery Dates ({checkoutDetails.dates.length})
                      </p>
                      <div className="text-xs space-y-1 max-h-20 overflow-y-auto">
                        {checkoutDetails.dates.slice(0, 3).map((dateStr, index) => (
                          <div key={index} className="flex justify-between">
                            <span style={{ color: '#2A1803' }}>{formatDateDisplay(dateStr)}</span>
                            <span style={{ color: '#9C4A15' }}>
                              {formatTimeForDisplay(checkoutDetails.selectedTime)}
                            </span>
                          </div>
                        ))}
                        {checkoutDetails.dates.length > 3 && (
                          <p className="text-center pt-1" style={{ color: '#9C4A15' }}>
                            +{checkoutDetails.dates.length - 3} more
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="h-px" style={{ backgroundColor: '#F5EFE7' }}></div>

                    {/* Pricing */}
                    <div className="flex justify-between items-center">
                      <span
                        className="font-bold font-[titleFont] text-lg"
                        style={{ color: '#2A1803' }}
                      >
                        Per Delivery
                      </span>
                      <span
                        className="font-bold font-[titleFont] text-xl"
                        style={{ color: '#9C4A15' }}
                      >
                        {formatCurrency(checkoutDetails.totalPricePerDelivery)}
                      </span>
                    </div>

                    {selectedPaymentDetails && selectedPaymentDetails.fee > 0 && (
                      <div className="flex justify-between items-center text-sm">
                        <span style={{ color: '#2A1803' }}>Payment Fee</span>
                        <span style={{ color: '#DC2626' }}>
                          +{formatCurrency(selectedPaymentDetails.fee * checkoutDetails.totalPrice)}
                        </span>
                      </div>
                    )}

                    <div className="mt-4 pt-4 border-t" style={{ borderColor: '#F5EFE7' }}>
                      <div className="flex justify-between items-center mb-2">
                        <span
                          className="font-bold font-[titleFont] text-lg"
                          style={{ color: '#2A1803' }}
                        >
                          Total Amount
                        </span>
                        <span
                          className="font-bold font-[titleFont] text-2xl"
                          style={{ color: '#9C4A15' }}
                        >
                          {formatCurrency(calculateTotalWithFee())}
                        </span>
                      </div>
                      <p
                        className="text-sm font-[titleFont] text-right"
                        style={{ color: '#9C4A15' }}
                      >
                        {checkoutDetails.dates.length} day
                        {checkoutDetails.dates.length !== 1 ? 's' : ''} ×{' '}
                        {formatCurrency(checkoutDetails.totalPricePerDelivery)}
                      </p>
                    </div>

                    {checkoutDetails.instructions && (
                      <div
                        className="mt-4 p-3 rounded-lg font-[titleFont] text-sm"
                        style={{ backgroundColor: '#F5EFE7', color: '#2A1803' }}
                      >
                        <span className="font-medium">Note:</span> {checkoutDetails.instructions}
                      </div>
                    )}

                    {/* Terms & Conditions */}
                    <div className="mb-4">
                      <label className="flex items-start">
                        <input
                          type="checkbox"
                          checked={agreedToTerms}
                          onChange={(e) => setAgreedToTerms(e.target.checked)}
                          className="mt-1 mr-3 w-4 h-4 text-[#9C4A15] focus:ring-[#9C4A15] rounded cursor-pointer"
                        />
                        <span className="text-xs" style={{ color: '#2A1803' }}>
                          I agree to the{' '}
                          <a href="/terms" className="text-[#9C4A15] hover:underline">
                            Terms & Conditions
                          </a>
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="mt-6">
                    <motion.button
                      onClick={handlePaymentSubmit}
                      disabled={isProcessing || !paymentMethod || !agreedToTerms}
                      className={`w-full py-4 rounded-full font-bold font-[titleFont] text-base transition-all duration-200 shadow-lg cursor-pointer ${
                        isProcessing ? 'opacity-70 cursor-not-allowed' : ''
                      }`}
                      style={{
                        backgroundColor: paymentMethod && agreedToTerms ? '#9C4A15' : '#9CA3AF',
                        color: '#F5EFE7',
                      }}
                      whileHover={
                        !isProcessing && paymentMethod && agreedToTerms ? { scale: 1.02 } : {}
                      }
                      whileTap={
                        !isProcessing && paymentMethod && agreedToTerms ? { scale: 0.98 } : {}
                      }
                    >
                      {isProcessing ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Processing...
                        </div>
                      ) : !paymentMethod ? (
                        'Select Payment Method'
                      ) : !agreedToTerms ? (
                        'Agree to Terms'
                      ) : (
                        `Pay ${formatCurrency(calculateTotalWithFee())}`
                      )}
                    </motion.button>

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
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Footer Note */}
        <motion.div className="text-center mt-12" variants={faqItem} transition={{ delay: 0.3 }}>
          <div className="h-1 w-32 mx-auto mb-4" style={{ backgroundColor: '#9C4A15' }}></div>
          <p className="text-lg md:text-xl font-[titleFont]" style={{ color: '#2A1803' }}>
            Need more help? Contact us at{' '}
            <a
              href="mailto:customerservice@pandedaily.com"
              className="font-medium hover:underline"
              style={{ color: '#9C4A15' }}
            >
              customerservice@pandedaily.com
            </a>
          </p>
          <p className="text-sm font-[titleFont] mt-2" style={{ color: '#9C4A15' }}>
            Free delivery on all subscriptions • Zero preservatives • Hand-kneaded daily
          </p>
        </motion.div>
      </div>
    </section>
  )
}

export default Payment
