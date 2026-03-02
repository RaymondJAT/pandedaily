import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Sidebar from './navigation/Sidebar'
import Header from './Header'
import { Outlet } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const DashboardLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const { user, logout } = useAuth()

  // Check if mobile on mount and when window resizes
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024) // lg breakpoint
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // On mobile, sidebar should be closed by default
  useEffect(() => {
    if (isMobile) {
      setIsSidebarOpen(false)
    } else {
      setIsSidebarOpen(true)
    }
  }, [isMobile])

  // Calculate margin based on screen size and sidebar state
  const getMarginLeft = () => {
    if (isMobile) {
      return isSidebarOpen ? 56 : 0 // On mobile, margin for icons or no margin
    }
    return isSidebarOpen ? 225 : 56 // Desktop behavior
  }

  return (
    <div className="h-screen overflow-hidden bg-[#F5EFE7] font-mono">
      {/* Sidebar - Conditionally render on mobile */}
      <AnimatePresence mode="wait">
        {(isMobile ? isSidebarOpen : true) && (
          <Sidebar open={isSidebarOpen} setOpen={setIsSidebarOpen} isMobile={isMobile} />
        )}
      </AnimatePresence>

      {/* Main content area */}
      <motion.div
        className="h-screen flex flex-col"
        animate={{
          marginLeft: getMarginLeft(),
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        {/* Header */}
        <div className="h-16 shrink-0">
          <Header
            sidebarOpen={isSidebarOpen}
            onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
            user={user}
            onLogout={logout}
          />
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <Outlet />
        </div>
      </motion.div>
    </div>
  )
}

export default DashboardLayout
