import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const ProtectedRoute = ({ children, allowedTypes = [] }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div
        className="flex items-center justify-center h-screen"
        style={{ backgroundColor: '#F5EFE7' }}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#9C4A15] mx-auto"></div>
          <p className="mt-4 text-[#2A1803]">Loading...</p>
        </div>
      </div>
    )
  }

  // If no user is logged in, redirect to login page
  if (!user) {
    return <Navigate to="/login" replace />
  }

  // If specific user types are required and user doesn't match
  if (allowedTypes.length > 0 && !allowedTypes.includes(user.type)) {
    return <Navigate to="/" replace />
  }

  return children
}

export default ProtectedRoute
