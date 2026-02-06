import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check localStorage on initial load
    const token = localStorage.getItem('token')
    const userId = localStorage.getItem('userId')
    const userFullName = localStorage.getItem('userFullName')
    const userName = localStorage.getItem('userName')
    const userAccessId = localStorage.getItem('userAccessId')

    if (token && userId) {
      const userType = userAccessId === '1' ? 'admin' : 'customer'

      setUser({
        type: userType,
        id: userId,
        name: userName || 'User',
        fullName: userFullName || userName || 'User',
        accessId: userAccessId,
        token: token,
      })
    }
    setLoading(false)
  }, [])

  const login = (userData) => {
    const { type, id, name, fullName, accessId, token } = userData

    // Store in localStorage
    localStorage.setItem('token', token)
    localStorage.setItem('userId', id)
    localStorage.setItem('userName', name || 'User')
    localStorage.setItem('userFullName', fullName || name || 'User')
    localStorage.setItem('userAccessId', accessId)

    setUser(userData)
  }

  const logout = () => {
    // Clear all auth-related localStorage items
    localStorage.removeItem('token')
    localStorage.removeItem('userId')
    localStorage.removeItem('userName')
    localStorage.removeItem('userFullName')
    localStorage.removeItem('userAccessId')
    localStorage.removeItem('userEmail')
    localStorage.removeItem('userPhone')
    localStorage.removeItem('userAddress')

    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>{children}</AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
