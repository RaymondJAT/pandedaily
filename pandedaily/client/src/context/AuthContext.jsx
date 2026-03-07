import { createContext, useContext, useState, useEffect } from 'react'
import { logoutUser as apiLogout } from '../services/api'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
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
    localStorage.setItem('user', JSON.stringify(userData))
    localStorage.setItem('token', userData.token)

    if (userData.access_id) {
      localStorage.setItem('userAccessId', userData.access_id.toString())
    } else {
      localStorage.removeItem('userAccessId')
    }

    setUser(userData)
  }

  const clearAuthData = () => {
    localStorage.removeItem('user')
    localStorage.removeItem('token')
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

  const isAdmin = user?.access_id === 1
  const isDeveloper = user?.access_id === 2
  const isRider = user?.access_id === 3
  const isCustomer = !user?.access_id

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        loading,
        isAuthenticated: !!user,
        isAdmin,
        isDeveloper,
        isRider,
        isCustomer,
        accessId: user?.access_id,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
