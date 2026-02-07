import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const ProtectedRoute = ({ children, allowedTypes = [] }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!user) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" replace />
  }

  if (allowedTypes.length > 0 && !allowedTypes.includes(user.user_type)) {
    // Redirect to appropriate page based on user type
    if (user.user_type === 'admin') {
      return <Navigate to="/dashboard" replace />
    } else if (user.user_type === 'customer') {
      return <Navigate to="/order" replace />
    }
    // Default redirect
    return <Navigate to="/" replace />
  }

  return children
}

export default ProtectedRoute
