import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import { usePayment } from '../../hooks/usePayment'
import { formatCurrency, formatTimeForDisplay, formatDateDisplay } from '../../utils/formatters'
import { fadeInUp, staggerContainer, faqItem } from '../../utils/animations'
import PageHeader from '../../components/order/PageHeader'
import PageFooter from '../../components/order/PageFooter'
import CustomerInfoSummary from '../../components/payment/CustomerInfoSummary'
import PaymentMethods from '../../components/payment/PaymentMethods'
import PaymentOrderSummary from '../../components/payment/PaymentOrderSummary'
import PaymentButton from '../../components/payment/PaymentButton'

const Payment = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()

  const [checkoutDetails, setCheckoutDetails] = useState(null)
  const [customerInfo, setCustomerInfo] = useState(null)
  const [isGuest, setIsGuest] = useState(false)

  const {
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
  } = usePayment(checkoutDetails, customerInfo, isGuest)

  // Load checkout details
  useEffect(() => {
    // Try to get from location state first
    const detailsFromState = location.state?.checkoutDetails

    if (detailsFromState) {
      setCheckoutDetails(detailsFromState)

      if (detailsFromState.customerInfo) {
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
          isGuest: detailsFromState.isGuest || false,
        }

        setCustomerInfo(customerData)
        setIsGuest(detailsFromState.isGuest || false)
      }

      localStorage.setItem('checkoutDetails', JSON.stringify(detailsFromState))
    } else {
      // Try to get from localStorage
      const savedDetails = localStorage.getItem('checkoutDetails')
      if (savedDetails) {
        const parsedDetails = JSON.parse(savedDetails)
        setCheckoutDetails(parsedDetails)

        if (parsedDetails.customerInfo) {
          setCustomerInfo({
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
          })
          setIsGuest(parsedDetails.isGuest || false)
        }
      } else {
        // No checkout details found, redirect to checkout
        navigate('/checkout')
      }
    }
  }, [location.state, navigate])

  const handleBack = () => {
    navigate(-1)
  }

  const handleEditCheckout = () => {
    navigate('/checkout')
  }

  const handleSubmit = async () => {
    const result = await handlePaymentSubmit()
    // The actual redirect happens in usePayment hook
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
    <section
      className="min-h-screen py-8 md:py-12 font-[titleFont]"
      style={{ backgroundColor: '#F5EFE7' }}
    >
      <div className="container mx-auto px-4">
        <PageHeader
          title="Payment"
          showBackButton={true}
          onBack={handleBack}
          fadeInUp={fadeInUp}
          alignment="center"
          accentColor="#9C4A15"
        />

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
            {/* LEFT COLUMN */}
            <div className="flex flex-col space-y-8">
              <CustomerInfoSummary
                customerInfo={customerInfo}
                isGuest={isGuest}
                faqItem={faqItem}
              />

              <PaymentMethods
                paymentMethods={paymentMethods}
                paymentMethod={paymentMethod}
                onMethodSelect={handlePaymentMethodSelect}
                faqItem={faqItem}
              />
            </div>

            {/* RIGHT COLUMN */}
            <div className="flex flex-col">
              <PaymentOrderSummary
                checkoutDetails={checkoutDetails}
                selectedPaymentDetails={selectedPaymentDetails}
                onEdit={handleEditCheckout}
                formatCurrency={formatCurrency}
                formatTimeForDisplay={formatTimeForDisplay}
                formatDateDisplay={formatDateDisplay}
                calculateTotalWithFee={calculateTotalWithFee}
                agreedToTerms={agreedToTerms}
                onTermsChange={setAgreedToTerms}
                faqItem={faqItem}
              >
                <PaymentButton
                  isProcessing={isProcessing}
                  paymentMethod={paymentMethod}
                  agreedToTerms={agreedToTerms}
                  onSubmit={handleSubmit}
                  formatCurrency={formatCurrency}
                  calculateTotalWithFee={calculateTotalWithFee}
                />
              </PaymentOrderSummary>
            </div>
          </div>
        </motion.div>

        <PageFooter fadeInUp={faqItem} delay={0.3} accentColor="#9C4A15" textColor="#2A1803" />
      </div>
    </section>
  )
}

export default Payment
