import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

export const useCheckoutData = (user) => {
  const navigate = useNavigate()
  const [orderDetails, setOrderDetails] = useState(null)
  const [customerInfo, setCustomerInfo] = useState(null)
  const [isGuest, setIsGuest] = useState(false)
  const [loading, setLoading] = useState(true)

  // Track if user is logged in
  const [prevUser, setPrevUser] = useState(user)

  // Auto-clear function
  const autoClearProducts = useCallback(() => {
    console.log('🧹 Auto-clearing selected products')
    localStorage.removeItem('selectedProducts')
    localStorage.removeItem('pendingOrder')
    localStorage.removeItem('currentOrder')
    localStorage.removeItem('guestInfo')
  }, [])

  // Detect user logout
  useEffect(() => {
    if (prevUser && !user) {
      console.log('🚪 User logged out - clearing products')
      autoClearProducts()

      // Also reset state
      setOrderDetails(null)
      setCustomerInfo(null)
      setIsGuest(false)
    }

    setPrevUser(user)
  }, [user, prevUser, autoClearProducts])

  // Handle page refresh/close
  useEffect(() => {
    const handleBeforeUnload = () => {
      const isNavigatingToPayment = sessionStorage.getItem('navigatingToPayment')
      const orderCompleted = sessionStorage.getItem('orderCompleted')

      if (!isNavigatingToPayment && !orderCompleted) {
        console.log('Page refresh/close detected - clearing products')
        localStorage.removeItem('selectedProducts')
        localStorage.removeItem('pendingOrder')
        localStorage.removeItem('currentOrder')
        localStorage.removeItem('guestInfo')
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [])

  // Handle component unmount
  useEffect(() => {
    return () => {
      const isNavigatingToPayment = sessionStorage.getItem('navigatingToPayment')
      const orderCompleted = sessionStorage.getItem('orderCompleted')
      const isGoingToPayment = document.referrer?.includes('/order/payment')

      if (!isNavigatingToPayment && !orderCompleted && !isGoingToPayment) {
        console.log('Navigation away from checkout - clearing products')
        localStorage.removeItem('selectedProducts')
        localStorage.removeItem('pendingOrder')
        localStorage.removeItem('currentOrder')
        localStorage.removeItem('guestInfo')
      }

      // Clean up session flags
      sessionStorage.removeItem('navigatingToPayment')
      sessionStorage.removeItem('orderCompleted')
    }
  }, [])

  // Handle visibility change (tab switch)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Tab is hidden, set a flag
        sessionStorage.setItem('tabHidden', 'true')
      } else {
        // Tab is visible again, check if we need to clear
        const wasHidden = sessionStorage.getItem('tabHidden')
        const orderCompleted = sessionStorage.getItem('orderCompleted')

        if (wasHidden === 'true' && !orderCompleted) {
          console.log('Tab became visible again - checking session')
        }

        sessionStorage.removeItem('tabHidden')
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  const clearOrderData = useCallback(() => {
    localStorage.removeItem('selectedProducts')
    localStorage.removeItem('pendingOrder')
    localStorage.removeItem('currentOrder')
    localStorage.removeItem('checkoutDetails')
    localStorage.removeItem('guestInfo')
    console.log('🧹 Cleared all order data from localStorage')
  }, [])

  const loadOrderData = useCallback(
    (locationState) => {
      setLoading(true)

      // Try to get data from navigation state first
      const orderFromState = locationState?.orderDetails
      const guestFromState = locationState?.guestInfo

      // Set order details
      if (orderFromState) {
        console.log('Order details from state:', orderFromState)
        setOrderDetails(orderFromState)
        localStorage.setItem('currentOrder', JSON.stringify(orderFromState))

        // Mark that we have an active order
        sessionStorage.setItem('hasActiveOrder', 'true')
      } else {
        const savedOrder = localStorage.getItem('pendingOrder')
        if (savedOrder) {
          console.log('Order details from localStorage:', JSON.parse(savedOrder))
          setOrderDetails(JSON.parse(savedOrder))
          sessionStorage.setItem('hasActiveOrder', 'true')
        } else {
          navigate('/order')
          setLoading(false)
          return false
        }
      }

      // Set customer info
      if (guestFromState) {
        console.log('Guest info from state:', guestFromState)
        setCustomerInfo({
          fullname: guestFromState.fullname,
          contact: guestFromState.contact,
          email: guestFromState.email,
          address: guestFromState.address,
          latitude: guestFromState.latitude,
          longitude: guestFromState.longitude,
          isGuest: true,
        })
        setIsGuest(true)
        localStorage.setItem('guestInfo', JSON.stringify(guestFromState))
      } else if (user) {
        console.log('User from auth:', user)
        const customerId =
          user.c_id || user.id || user.customer_id || user.userId || user._id || null

        setCustomerInfo({
          fullname:
            user.fullname || user.c_fullname || user.name || user.username || 'Not provided',
          contact:
            user.contact || user.c_contact || user.phone || user.phoneNumber || 'Not provided',
          email: user.email || user.c_email || 'Not provided',
          address: user.address || user.c_address || user.delivery_address || 'Not provided',
          c_id: customerId,
          id: customerId,
          isGuest: false,
        })
        setIsGuest(false)
      } else {
        const savedGuest = localStorage.getItem('guestInfo')
        if (savedGuest) {
          const guestData = JSON.parse(savedGuest)
          setCustomerInfo({
            fullname: guestData.fullname,
            contact: guestData.contact,
            email: guestData.email,
            address: guestData.address,
            latitude: guestData.latitude,
            longitude: guestData.longitude,
            isGuest: true,
          })
          setIsGuest(true)
        }
      }

      setLoading(false)
      return true
    },
    [navigate, user],
  )

  // Call this when order is successfully completed
  const markOrderAsCompleted = useCallback(() => {
    sessionStorage.setItem('orderCompleted', 'true')
    sessionStorage.removeItem('hasActiveOrder')
    clearOrderData()
  }, [clearOrderData])

  return {
    orderDetails,
    customerInfo,
    isGuest,
    loading,
    clearOrderData,
    loadOrderData,
    markOrderAsCompleted,
  }
}
