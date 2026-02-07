import { createContext, useContext, useState, useEffect } from 'react'
import { logoutUser as apiLogout } from '../services/api'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check localStorage on initial load
    const storedUser = localStorage.getItem('user')

    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser)
        setUser(parsedUser)
      } catch (error) {
        console.error('Error parsing stored user:', error)
        clearAuthData()
      }
    }
    setLoading(false)
  }, [])

  const login = (userData) => {
    // Store user in localStorage
    localStorage.setItem('user', JSON.stringify(userData))
    localStorage.setItem('token', userData.token)

    setUser(userData)
  }

  const clearAuthData = () => {
    // Clear all auth-related localStorage items
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    // Clear any other auth-related items
    localStorage.removeItem('userId')
    localStorage.removeItem('userName')
    localStorage.removeItem('userFullName')
    localStorage.removeItem('userAccessId')
    localStorage.removeItem('userEmail')

    setUser(null)
  }

  const logout = async () => {
    try {
      await apiLogout()
    } catch (error) {
      console.error('Logout API error:', error)
    } finally {
      clearAuthData()
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        loading,
        isAuthenticated: !!user,
        isAdmin: user?.user_type === 'admin',
        isCustomer: user?.user_type === 'customer',
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
