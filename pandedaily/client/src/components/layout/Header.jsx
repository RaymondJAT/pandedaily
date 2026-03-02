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
      navigate('/login')
    } catch (error) {
      console.error('Logout failed:', error)
      navigate('/login')
    }
  }

  return (
    <header className="bg-[#3F2305] border-b border-[#2A1803] h-16 w-full">
      <div className="flex items-center justify-between px-3 sm:px-4 md:px-6 h-full w-full">
        {/* Left side with menu button */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* Menu Toggle Button - Always visible on mobile, hidden on desktop */}
          <button
            onClick={onToggleSidebar}
            className="p-1.5 sm:p-2 hover:bg-[#523010] rounded-lg transition-colors cursor-pointer lg:hidden"
            aria-label="Toggle sidebar"
          >
            <FiMenu size={20} className="text-[#F5EFE7]" />
          </button>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifications(!showNotifications)
                setShowUserMenu(false)
              }}
              className="relative p-1.5 sm:p-2 hover:bg-[#523010] rounded-lg transition-colors cursor-pointer"
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
                  className="absolute right-0 mt-2 bg-[#3F2305] rounded-lg shadow-xl border border-[#2A1803] z-50 w-[calc(100vw-32px)] sm:w-80 max-w-[320px] sm:max-w-sm sm:right-0"
                  style={{
                    position: 'fixed',
                    top: '60px',
                    right: '16px',
                    maxHeight: 'calc(100vh - 100px)',
                    overflowY: 'auto',
                  }}
                >
                  <div className="p-3 border-b border-[#2A1803]">
                    <h3 className="font-semibold text-[#F5EFE7] text-sm sm:text-base">
                      Notifications
                    </h3>
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
              className="flex items-center space-x-1 sm:space-x-2 p-1.5 sm:p-2 hover:bg-[#523010] rounded-lg transition-colors cursor-pointer"
              aria-label="User menu"
            >
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-linear-to-r from-[#F5EFE7] to-[#D9D2C9] flex items-center justify-center shrink-0">
                <span className="text-[#3F2305] font-bold text-xs">
                  {user?.fullname?.charAt(0) || user?.username?.charAt(0) || 'U'}
                </span>
              </div>

              {/* User info - Hidden on mobile, visible on tablet and up */}
              <div className="hidden sm:block text-left">
                <p className="text-sm font-semibold text-[#F5EFE7] truncate max-w-30">
                  {user?.fullname || user?.username || 'User'}
                </p>
                <p className="text-xs text-[#D9D2C9] truncate max-w-30">
                  {user?.role_name || user?.user_type || 'User'}
                </p>
              </div>

              {/* Username only on mobile - shown when screen is very small */}
              <span className="block sm:hidden text-[#F5EFE7] text-sm font-medium max-w-20 truncate">
                {user?.fullname?.split(' ')[0] || user?.username || 'User'}
              </span>

              <FiChevronDown className="text-[#F5EFE7] shrink-0" size={16} />
            </button>

            <AnimatePresence>
              {showUserMenu && (
                <motion.div
                  ref={userMenuRef}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 mt-2 bg-[#3F2305] rounded-lg shadow-xl border border-[#2A1803] z-50 w-48 sm:w-56 sm:right-0"
                  style={{
                    position: 'fixed',
                    top: '60px',
                    right: '16px',
                  }}
                >
                  <div className="p-3">
                    <p className="font-semibold text-[#F5EFE7] text-sm sm:text-base">
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
