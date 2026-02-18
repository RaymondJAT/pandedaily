import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useEffect, useState } from 'react'

const ProtectedRoute = ({ children, allowedTypes = [], requireAuth = false }) => {
  const { user, loading } = useAuth()
  const location = useLocation()
  const [hasGuestInfo, setHasGuestInfo] = useState(false)
  const [checkingGuest, setCheckingGuest] = useState(true)

  useEffect(() => {
    // Check for guest info in localStorage
    const guestInfo = localStorage.getItem('guestInfo')
    setHasGuestInfo(!!guestInfo)
    setCheckingGuest(false)
  }, [])

  // Show loading state while checking auth or guest info
  if (loading || checkingGuest) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: '#F5EFE7' }}
      >
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#9C4A15] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p style={{ color: '#2A1803' }}>Loading...</p>
        </div>
      </div>
    )
  }

  // Determine user type and access rights
  const isAuthenticated = !!user
  const userType = user?.user_type || (user?.c_id ? 'customer' : null)

  // Case 1: Route requires authentication (like account settings)
  if (requireAuth) {
    if (!isAuthenticated) {
      return (
        <Navigate
          to="/login"
          replace
          state={{ from: location, message: 'Please login to access this page' }}
        />
      )
    }

    if (allowedTypes.length > 0 && !allowedTypes.includes(userType)) {
      // Redirect based on user type
      if (userType === 'admin') {
        return <Navigate to="/admin/dashboard" replace />
      } else {
        return <Navigate to="/order" replace />
      }
    }

    return children
  }

  // Case 2: Route accessible by both guests and registered users (like checkout)
  if (hasGuestInfo || isAuthenticated) {
    // If user is authenticated but not in allowed types, still allow for checkout pages
    if (allowedTypes.length > 0 && isAuthenticated && !allowedTypes.includes(userType)) {
      // Check if this is a checkout-related route that should be accessible
      const checkoutRoutes = ['/checkout', '/order/confirmation', '/order/payment']
      const isCheckoutRoute = checkoutRoutes.some((route) => location.pathname.includes(route))

      if (isCheckoutRoute) {
        // Allow authenticated users to access checkout even if not in allowedTypes
        return children
      }

      // Redirect non-customer authenticated users
      if (userType === 'admin') {
        return <Navigate to="/admin/dashboard" replace />
      }
      return <Navigate to="/order" replace />
    }

    return children
  }

  // Case 3: No access - redirect based on route
  const isCheckoutRoute = ['/checkout', '/order/confirmation', '/order/payment'].some((route) =>
    location.pathname.includes(route),
  )

  if (isCheckoutRoute) {
    // For checkout routes, redirect to guest info first
    return (
      <Navigate to="/guest-info" replace state={{ from: location, returnTo: location.pathname }} />
    )
  }

  // Default redirect to login
  return <Navigate to="/login" replace state={{ from: location }} />
}

export default ProtectedRoute
