import { useState, useEffect } from 'react'
import Sidebar from './navigation/Sidebar'
import Header from './Header'
import { Outlet } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const DashboardLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const { user, logout } = useAuth()

  // Check if mobile on mount and when window resizes
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024
      setIsMobile(mobile)

      // Set initial state immediately
      if (mobile) {
        setIsSidebarOpen(false)
      } else {
        setIsSidebarOpen(true)
      }
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Get sidebar width based on state
  const getSidebarWidth = () => {
    if (isMobile) {
      return 56
    }
    return isSidebarOpen ? 225 : 56
  }

  const getMarginLeft = () => {
    if (isMobile) {
      return isSidebarOpen ? 56 : 0
    }
    return isSidebarOpen ? 225 : 56
  }

  return (
    <div className="h-screen overflow-hidden bg-[#F5EFE7] font-mono">
      {/* Sidebar Container */}
      <div
        className="fixed left-0 top-0 z-40"
        style={{
          ...(!isMobile
            ? {
                width: getSidebarWidth(),
                transition: 'width 0.3s ease-in-out',
              }
            : {
                width: 56,
                left: isSidebarOpen ? 0 : -56,
                transition: 'left 0.3s ease-in-out',
              }),
        }}
      >
        <Sidebar open={isSidebarOpen} setOpen={setIsSidebarOpen} isMobile={isMobile} />
      </div>

      {/* Header */}
      <div
        className="fixed top-0 z-30 h-16"
        style={{
          ...(!isMobile
            ? {
                left: getSidebarWidth(),
                right: 0,
                transition: 'left 0.3s ease-in-out',
              }
            : {
                left: isSidebarOpen ? 56 : 0,
                right: 0,
                transition: 'left 0.3s ease-in-out',
              }),
        }}
      >
        <Header
          sidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          user={user}
          onLogout={logout}
        />
      </div>

      {/* Main Content Area */}
      <div
        className="h-screen overflow-auto"
        style={{
          marginLeft: getMarginLeft(),
          transition: 'margin-left 0.3s ease-in-out',
          paddingTop: '64px',
        }}
      >
        <Outlet />
      </div>
    </div>
  )
}

export default DashboardLayout
