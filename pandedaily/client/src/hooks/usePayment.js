// hooks/usePayment.js
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

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
      instructions: 'You will be redirected to PayMongo to complete your payment',
      fee: 0,
      iconBg: '#E8F5E9',
    },
    {
      id: 'paymaya',
      name: 'Maya',
      icon: 'FiSmartphone',
      color: '#6C1D5F',
      description: 'Pay using Maya (formerly PayMaya)',
      instructions: 'You will be redirected to PayMongo to complete your payment',
      fee: 0,
      iconBg: '#F3E5F5',
    },
    {
      id: 'card',
      name: 'Credit/Debit Card',
      icon: 'FiCard',
      color: '#1E88E5',
      description: 'Visa, Mastercard, JCB, UnionPay',
      instructions: 'You will be redirected to PayMongo to complete your payment',
      fee: 0.025,
      iconBg: '#E3F2FD',
    },
  ]

  const handlePaymentMethodSelect = (methodId) => {
    setPaymentMethod(methodId)
    const method = paymentMethods.find((m) => m.id === methodId)
    setSelectedPaymentDetails(method)
    setApiError('')
  }

  const calculateTotalWithFee = () => {
    if (!checkoutDetails || !selectedPaymentDetails) return checkoutDetails?.total_amount || 0
    const fee = selectedPaymentDetails.fee * checkoutDetails.total_amount
    return checkoutDetails.total_amount + fee
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
      // Update checkout details with selected payment method
      const updatedDetails = {
        ...checkoutDetails,
        selectedPaymentMethod: paymentMethod,
        selectedPaymentDetails: selectedPaymentDetails,
      }
      localStorage.setItem('checkoutDetails', JSON.stringify(updatedDetails))

      // Get the PayMongo checkout URL from the stored details
      // The checkout URL is already in the checkoutDetails from the Checkout page
      if (checkoutDetails.paymongo_session_id) {
        // Since we're already redirected from Checkout, we just need to go to the next step
        // In this case, we can just simulate a successful payment for demo
        // In production, PayMongo handles this automatically

        // For now, let's redirect to success page with the session ID
        navigate(`/payment/success?session_id=${checkoutDetails.paymongo_session_id}`)
      } else {
        // If no checkout URL, redirect back to checkout
        navigate('/checkout')
      }

      return { success: true }
    } catch (error) {
      console.error('Error processing payment:', error)
      setApiError(error.message || 'Failed to process payment. Please try again.')
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
