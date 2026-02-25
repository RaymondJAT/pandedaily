import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import { useDeliveryCalendar } from '../../hooks/useDeliveryCalendar'
import { useDeliveryTime } from '../../hooks/useDeliveryTime'
import { useCheckoutData } from '../../hooks/useCheckoutData'
import { formatCurrency } from '../../utils/formatters'
import { fadeInUp, staggerContainer, faqItem } from '../../utils/animations'
import PageHeader from '../../components/order/PageHeader'
import PageFooter from '../../components/order/PageFooter'
import DeliveryCalendar from '../../components/checkout/DeliveryCalendar'
import DeliveryConfiguration from '../../components/checkout/DeliveryConfiguration'
import SelectedProductsSummary from '../../components/checkout/SelectedProductsSummary'
import CheckoutActions from '../../components/checkout/CheckoutActions'
import { createPaymongoCheckoutSession } from '../../services/api'

const Checkout = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()

  const calendar = useDeliveryCalendar(10)
  const time = useDeliveryTime()
  const checkoutData = useCheckoutData(user)

  const [specialInstructions, setSpecialInstructions] = useState('')
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState('')

  // Load order data on mount
  useEffect(() => {
    const success = checkoutData.loadOrderData(location.state)
    if (!success) return
  }, [location.state, checkoutData.loadOrderData])

  const handleProceedToPayment = async () => {
    if (calendar.selectedDates.length === 0) {
      alert('Please select at least one delivery date')
      return
    }

    if (!time.selectedTime) {
      alert('Please select a delivery time')
      return
    }

    setProcessing(true)
    setError('')

    try {
      // Prepare line items for PayMongo
      const lineItems = checkoutData.orderDetails.products.map((product) => ({
        name: product.name,
        amount: product.price,
        quantity: product.quantity,
        description: `${product.quantity} x ${product.name}`,
      }))

      // Add delivery fee as a line item
      const deliveryFee = 1
      lineItems.push({
        name: 'Delivery Fee',
        amount: deliveryFee,
        quantity: calendar.selectedDates.length,
        description: `Delivery fee for ${calendar.selectedDates.length} day(s)`,
      })

      // Create order reference
      const orderReference = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`

      // Prepare metadata
      const metadata = {
        order_reference: orderReference,
        customer_id: user?.id || 'guest',
        customer_name: checkoutData.customerInfo?.fullname || user?.fullname || 'Customer',
        customer_email: checkoutData.customerInfo?.email || user?.email || '',
        customer_contact: checkoutData.customerInfo?.contact || user?.contact || '',
        total_items: getTotalItems().toString(),
        total_amount: getTotalPrice().toString(),
        delivery_dates: calendar.selectedDates.join(', '),
        delivery_time: time.selectedTime,
        delivery_schedule: time.deliverySchedule,
        special_instructions: specialInstructions || '',
        is_guest: checkoutData.isGuest ? 'true' : 'false',
      }

      // Create success and cancel URLs
      const baseUrl = window.location.origin
      const successUrl = `${baseUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`
      const cancelUrl = `${baseUrl}/payment/cancel`

      // Create checkout session using the API function
      const response = await createPaymongoCheckoutSession(
        lineItems,
        successUrl,
        cancelUrl,
        metadata,
      )

      console.log('Checkout session created:', response)

      if (!response) {
        throw new Error('No response from server')
      }

      const checkoutSession = response

      // Store checkout data for later use
      const checkoutDetails = {
        reference: orderReference,
        customer_id: user?.id,
        customer_info: checkoutData.customerInfo,
        products: checkoutData.orderDetails.products,
        delivery_schedules: calendar.selectedDates.map((date) => ({
          date,
          time: time.selectedTime,
          schedule: time.deliverySchedule,
        })),
        total_amount: getTotalPrice(),
        special_instructions: specialInstructions,
        paymongo_session_id: checkoutSession.id,
        paymongo_client_key: checkoutSession.attributes?.client_key,
        payment_intent_id: checkoutSession.attributes?.payment_intent?.id,
        status: 'PENDING_PAYMENT',
      }

      localStorage.setItem('checkoutDetails', JSON.stringify(checkoutDetails))

      // Redirect to PayMongo checkout page
      if (checkoutSession.attributes?.checkout_url) {
        window.location.href = checkoutSession.attributes.checkout_url
      } else {
        throw new Error('No checkout URL received from PayMongo')
      }
    } catch (err) {
      console.error('Checkout error:', err)
      setError(err.message || 'Failed to process checkout')
    } finally {
      setProcessing(false)
    }
  }
  const handleBack = () => {
    sessionStorage.removeItem('navigatingToPayment')
    checkoutData.clearOrderData()
    navigate('/order')
  }

  // Helper functions
  const getTotalItems = () => {
    if (!checkoutData.orderDetails?.products) return 0
    return checkoutData.orderDetails.products.reduce((sum, product) => sum + product.quantity, 0)
  }

  const getTotalPricePerDelivery = () => {
    if (!checkoutData.orderDetails?.products) return 0
    return checkoutData.orderDetails.products.reduce((sum, product) => {
      const price = typeof product.price === 'string' ? parseFloat(product.price) : product.price
      return sum + product.quantity * price
    }, 0)
  }

  const getTotalPrice = () => {
    return getTotalPricePerDelivery() * calendar.selectedDates.length
  }

  const formatPrice = (price) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price
    return numPrice.toFixed(2)
  }

  if (checkoutData.loading || !checkoutData.orderDetails) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: '#F5EFE7' }}
      >
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#9C4A15] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p style={{ color: '#2A1803' }}>Loading checkout...</p>
        </div>
      </div>
    )
  }

  return (
    <section
      className="min-h-screen py-8 md:py-12 font-[titleFont]"
      style={{ backgroundColor: '#F5EFE7' }}
    >
      <div className="container mx-auto px-4">
        <PageHeader
          title="Checkout"
          showBackButton={true}
          onBack={handleBack}
          fadeInUp={fadeInUp}
          alignment="center"
          accentColor="#9C4A15"
        />

        {/* Display error message if any */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <motion.div
          className="mx-auto"
          initial="initial"
          animate="animate"
          variants={staggerContainer}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10">
            {/* Calendar Section */}
            <DeliveryCalendar
              {...calendar}
              selectedTime={time.selectedTime}
              formatTimeForDisplay={time.formatTimeForDisplay}
              faqItem={faqItem}
            />

            {/* Delivery Configuration and Selected Products */}
            <div className="flex flex-col space-y-8">
              <DeliveryConfiguration
                deliverySchedule={time.deliverySchedule}
                selectedTime={time.selectedTime}
                currentTimeOptions={time.currentTimeOptions}
                onScheduleChange={time.handleScheduleChange}
                onTimeSelect={time.handleTimeSelect}
                formatTimeForDisplay={time.formatTimeForDisplay}
                specialInstructions={specialInstructions}
                onInstructionsChange={setSpecialInstructions}
                faqItem={faqItem}
              />

              <SelectedProductsSummary
                products={checkoutData.orderDetails.products}
                totalItems={getTotalItems()}
                totalPricePerDelivery={getTotalPricePerDelivery()}
                formatCurrency={formatCurrency}
                formatPrice={formatPrice}
                faqItem={faqItem}
              />
            </div>
          </div>
        </motion.div>

        <CheckoutActions
          selectedDates={calendar.selectedDates}
          selectedTime={time.selectedTime}
          onProceedToPayment={handleProceedToPayment}
          processing={processing}
          faqItem={faqItem}
        />

        <PageFooter fadeInUp={faqItem} delay={0.3} accentColor="#9C4A15" textColor="#2A1803" />
      </div>
    </section>
  )
}

export default Checkout
