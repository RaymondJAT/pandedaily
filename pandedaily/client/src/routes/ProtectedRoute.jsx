import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const ProtectedRoute = ({ children, allowedTypes = [] }) => {
  const { user, loading } = useAuth()

  if (loading) {
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

  if (!user) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  if (allowedTypes.length > 0) {
    const userType = user.user_type || (user.c_id ? 'customer' : 'guest')

    if (!allowedTypes.includes(userType)) {
      // Redirect based on user type
      if (userType === 'admin') {
        return <Navigate to="/admin/dashboard" replace />
      } else if (userType === 'customer') {
        return <Navigate to="/order" replace />
      }
      // Default redirect
      return <Navigate to="/" replace />
    }
  }

  return children
}

export default ProtectedRoute
