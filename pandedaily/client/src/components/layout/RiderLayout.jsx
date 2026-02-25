import { Routes, Route } from 'react-router-dom'
import { useState, useEffect } from 'react'
import NavigationBar from './navigation/NavigationBar'
import RiderFooter from './RiderFooter'
import RiderDeliveries from '../../pages/rider/RiderDeliveries'
import RiderHistory from '../../pages/rider/RiderHistory'
import RiderProfile from '../../pages/rider/RiderProfile'
import ProtectedRiderRoute from '../../routes/ProtectedRiderRoute'

const RiderLayout = () => {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="flex flex-col min-h-screen">
      <NavigationBar isScrolled={isScrolled} />

      <main className="flex-1" style={{ backgroundColor: '#F5EFE7' }}>
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRiderRoute>
                <RiderDeliveries />
              </ProtectedRiderRoute>
            }
          />
          <Route
            path="/deliveries"
            element={
              <ProtectedRiderRoute>
                <RiderDeliveries />
              </ProtectedRiderRoute>
            }
          />
          <Route
            path="/history"
            element={
              <ProtectedRiderRoute>
                <RiderHistory />
              </ProtectedRiderRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRiderRoute>
                <RiderProfile />
              </ProtectedRiderRoute>
            }
          />
        </Routes>
      </main>

      <RiderFooter />
    </div>
  )
}

export default RiderLayout
