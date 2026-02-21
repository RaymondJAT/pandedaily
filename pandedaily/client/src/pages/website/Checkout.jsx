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

const Checkout = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()

  // Custom hooks
  const calendar = useDeliveryCalendar(10)
  const time = useDeliveryTime()
  const checkoutData = useCheckoutData(user)

  const [specialInstructions, setSpecialInstructions] = useState('')

  // Load order data on mount
  useEffect(() => {
    const success = checkoutData.loadOrderData(location.state)
    if (!success) return
  }, [location.state, checkoutData.loadOrderData])

  const handleProceedToPayment = () => {
    if (calendar.selectedDates.length === 0) {
      alert('Please select at least one delivery date')
      return
    }

    if (!time.selectedTime) {
      alert('Please select a delivery time')
      return
    }

    // Set flag that we're navigating to payment
    sessionStorage.setItem('navigatingToPayment', 'true')

    const checkoutDetails = {
      products: checkoutData.orderDetails?.products,
      dates: calendar.selectedDates,
      schedule: time.deliverySchedule,
      selectedTime: time.selectedTime,
      instructions: specialInstructions,
      totalPieces: getTotalItems(),
      totalPricePerDelivery: getTotalPricePerDelivery(),
      totalPrice: getTotalPrice(),
      customerInfo: checkoutData.customerInfo,
      isGuest: checkoutData.isGuest,
      ...(checkoutData.isGuest &&
        checkoutData.customerInfo?.latitude &&
        checkoutData.customerInfo?.longitude && {
          guestLocation: {
            latitude: checkoutData.customerInfo.latitude,
            longitude: checkoutData.customerInfo.longitude,
            address: checkoutData.customerInfo.address,
          },
        }),
    }

    localStorage.setItem('checkoutDetails', JSON.stringify(checkoutDetails))

    navigate('/order/payment', {
      state: { checkoutDetails },
    })
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
          faqItem={faqItem}
        />

        <PageFooter fadeInUp={faqItem} delay={0.3} accentColor="#9C4A15" textColor="#2A1803" />
      </div>
    </section>
  )
}

export default Checkout
