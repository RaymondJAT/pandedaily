import { FiBell, FiChevronDown, FiMenu } from 'react-icons/fi'
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'

const Header = ({ sidebarOpen, onToggleSidebar }) => {
  const [showNotifications, setShowNotifications] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const notificationsRef = useRef(null)
  const userMenuRef = useRef(null)
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(event.target) &&
        !event.target.closest('button[aria-label="Notifications"]')
      ) {
        setShowNotifications(false)
      }
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target) &&
        !event.target.closest('button[aria-label="User menu"]')
      ) {
        setShowUserMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    setShowUserMenu(false)
    try {
      await logout()
      // Redirect to login page
      navigate('/login')
    } catch (error) {
      console.error('Logout failed:', error)
      // Still navigate to login even if there's an error
      navigate('/login')
    }
  }

  return (
    <header className="bg-[#3F2305] border-b border-[#2A1803] h-16">
      <div className="flex items-center justify-between px-6 h-full">
        {/* Left side with menu button and title */}
        <div className="flex items-center space-x-4">
          {/* Menu Toggle Button */}
          {/* <button
            onClick={onToggleSidebar}
            className="p-2 hover:bg-[#523010] rounded-lg transition-colors cursor-pointer"
            aria-label="Toggle sidebar"
          >
            <FiMenu size={20} className="text-[#F5EFE7]" />
          </button> */}

          {/* Breadcrumb or Title */}
        </div>

        <div className="flex items-center space-x-3">
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifications(!showNotifications)
                setShowUserMenu(false)
              }}
              className="relative p-2 hover:bg-[#523010] rounded-lg transition-colors cursor-pointer"
              aria-label="Notifications"
            >
              <FiBell size={18} className="text-[#F5EFE7]" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#9C4A15] text-[#F5EFE7] text-[10px] rounded-full flex items-center justify-center font-semibold">
                3
              </span>
            </button>

            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  ref={notificationsRef}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 mt-2 w-80 bg-[#3F2305] rounded-lg shadow-xl border border-[#2A1803] z-50"
                  style={{
                    position: 'fixed',
                    top: '60px',
                    right: '20px',
                    maxHeight: 'calc(100vh - 100px)',
                    overflowY: 'auto',
                  }}
                >
                  <div className="p-3 border-b border-[#2A1803]">
                    <h3 className="font-semibold text-[#F5EFE7]">Notifications</h3>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    <div className="p-3 border-b border-[#2A1803] hover:bg-[#523010] cursor-pointer transition-colors">
                      <p className="text-sm text-[#F5EFE7]">New order received</p>
                      <p className="text-xs text-[#D9D2C9] mt-1">2 minutes ago</p>
                    </div>
                    <div className="p-3 border-b border-[#2A1803] hover:bg-[#523010] cursor-pointer transition-colors">
                      <p className="text-sm text-[#F5EFE7]">Low stock alert</p>
                      <p className="text-xs text-[#D9D2C9] mt-1">1 hour ago</p>
                    </div>
                    <div className="p-3 hover:bg-[#523010] cursor-pointer transition-colors">
                      <p className="text-sm text-[#F5EFE7]">New customer registered</p>
                      <p className="text-xs text-[#D9D2C9] mt-1">3 hours ago</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* User Profile */}
          <div className="relative">
            <button
              onClick={() => {
                setShowUserMenu(!showUserMenu)
                setShowNotifications(false)
              }}
              className="flex items-center space-x-2 p-2 hover:bg-[#523010] rounded-lg transition-colors cursor-pointer"
              aria-label="User menu"
            >
              <div className="w-8 h-8 rounded-full bg-linear-to-r from-[#F5EFE7] to-[#D9D2C9] flex items-center justify-center">
                <span className="text-[#3F2305] font-bold text-xs">
                  {user?.fullname?.charAt(0) || user?.username?.charAt(0) || 'U'}
                </span>
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-[#F5EFE7]">
                  {user?.fullname || user?.username || 'User'}
                </p>
                <p className="text-xs text-[#D9D2C9]">
                  {user?.role_name || user?.user_type || 'User'}
                </p>
              </div>
              <FiChevronDown className="text-[#F5EFE7]" size={16} />
            </button>

            <AnimatePresence>
              {showUserMenu && (
                <motion.div
                  ref={userMenuRef}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 mt-2 w-48 bg-[#3F2305] rounded-lg shadow-xl border border-[#2A1803] z-50"
                  style={{
                    position: 'fixed',
                    top: '60px',
                    right: '20px',
                  }}
                >
                  <div className="p-3">
                    <p className="font-semibold text-[#F5EFE7]">
                      {user?.fullname || user?.username || 'User'}
                    </p>
                    <p className="text-xs text-[#D9D2C9]">
                      {user?.role_name || user?.user_type || 'User'}
                    </p>
                  </div>
                  <div className="p-2">
                    <div className="border-t border-[#2A1803] my-1"></div>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-3 py-2 text-sm text-[#F5EFE7] hover:bg-[#523010] rounded transition-colors cursor-pointer"
                    >
                      Logout
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
