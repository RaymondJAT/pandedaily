// pages/dashboard/DashboardLayout.jsx
import { useState } from 'react'
import { motion } from 'framer-motion'
import Sidebar from './navigation/Sidebar'
import Header from './Header'
import { Outlet } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const DashboardLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const { user, logout } = useAuth()

  return (
    <div className="h-screen overflow-hidden bg-[#F5EFE7] font-mono">
      {/* Sidebar */}
      <Sidebar open={isSidebarOpen} setOpen={setIsSidebarOpen} />

      {/* Main content area */}
      <motion.div
        className="h-screen flex flex-col"
        animate={{
          marginLeft: isSidebarOpen ? 225 : 56,
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
