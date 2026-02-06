import { FiBell, FiChevronDown } from 'react-icons/fi'
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const Header = () => {
  const [showNotifications, setShowNotifications] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const notificationsRef = useRef(null)
  const userMenuRef = useRef(null)

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

  return (
    <header className="sticky top-0 z-30 bg-[#3F2305] border-b border-[#2A1803] h-18">
      {' '}
      {/* Reduced height */}
      <div className="flex items-center justify-between px-6 h-full">
        {' '}
        {/* Added h-full */}
        {/* Breadcrumb or Title */}
        <div className="flex-1">
          <h1 className="text-lg font-semibold text-[#F5EFE7]">Dashboard</h1>{' '}
          {/* Reduced text size */}
        </div>
        <div className="flex items-center space-x-3">
          {' '}
          {/* Reduced space between items */}
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifications(!showNotifications)
                setShowUserMenu(false)
              }}
              className="relative p-1.5 hover:bg-[#523010] rounded-lg transition-colors cursor-pointer" // Reduced padding
              aria-label="Notifications"
            >
              <FiBell size={18} className="text-[#F5EFE7]" /> {/* Reduced icon size */}
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#9C4A15] text-[#F5EFE7] text-[10px] rounded-full flex items-center justify-center font-semibold">
                {' '}
                {/* Reduced badge size */}3
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
                    top: '60px', // Adjusted for smaller header
                    right: '20px',
                    maxHeight: 'calc(100vh - 100px)',
                    overflowY: 'auto',
                  }}
                >
                  <div className="p-3 border-b border-[#2A1803]">
                    {' '}
                    {/* Reduced padding */}
                    <h3 className="font-semibold text-[#F5EFE7]">Notifications</h3>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {' '}
                    {/* Reduced max height */}
                    {/* Add your notification items here */}
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
              className="flex items-center space-x-2 p-1.5 hover:bg-[#523010] rounded-lg transition-colors cursor-pointer" // Reduced padding and spacing
              aria-label="User menu"
            >
              <div className="w-7 h-7 rounded-full bg-gradient-to-r from-[#F5EFE7] to-[#D9D2C9] flex items-center justify-center">
                <span className="text-[#3F2305] font-bold text-xs">JD</span>{' '}
                {/* Reduced text size */}
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-[#F5EFE7]">John Doe</p>
                <p className="text-xs text-[#D9D2C9]">Admin</p>
              </div>
              <FiChevronDown className="text-[#F5EFE7]" size={16} /> {/* Reduced icon size */}
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
                    top: '60px', // Adjusted for smaller header
                    right: '20px',
                  }}
                >
                  <div className="p-3 border-b border-[#2A1803]">
                    {' '}
                    {/* Reduced padding */}
                    <p className="font-semibold text-[#F5EFE7]">John Doe</p>
                    <p className="text-xs text-[#D9D2C9]">Admin</p>
                  </div>
                  <div className="p-2">
                    <button className="w-full text-left px-3 py-2 text-sm text-[#F5EFE7] hover:bg-[#523010] rounded transition-colors cursor-pointer">
                      Profile Settings
                    </button>
                    <button className="w-full text-left px-3 py-2 text-sm text-[#F5EFE7] hover:bg-[#523010] rounded transition-colors cursor-pointer">
                      Account Settings
                    </button>
                    <div className="border-t border-[#2A1803] my-1"></div>
                    <button className="w-full text-left px-3 py-2 text-sm text-[#F5EFE7] hover:bg-[#523010] rounded transition-colors cursor-pointer">
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
