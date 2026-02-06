import { useState } from 'react'
import { motion } from 'framer-motion'
import Sidebar from '../../components/layout/navigation/Sidebar'
import Header from '../../components/layout/Header'
import { Outlet } from 'react-router-dom'

const DashboardLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  return (
    <div className="h-screen overflow-hidden bg-amber-50">
      <Sidebar open={isSidebarOpen} setOpen={setIsSidebarOpen} />
      <motion.div
        className="h-screen overflow-auto"
        animate={{
          marginLeft: isSidebarOpen ? 225 : 56,
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        <div className="min-h-full max-w-full">
          <Header />
          <Outlet />
        </div>
      </motion.div>
    </div>
  )
}

export default DashboardLayout
