import { Routes, Route } from 'react-router-dom'
import { useState, useEffect } from 'react'
import NavigationBar from './navigation/NavigationBar'
import Hero from '../../pages/website/home/Hero'
import Why from '../../pages/website/home/Why'
import Story from '../../pages/website/home/Story'
import CallToAction from '../../pages/website/home/CallToAction'
import Contact from '../../pages/website/home/Contact'
import Footer from './Footer'
import About from '../../pages/website/About'
import Faq from '../../pages/website/Faq'
import Order from '../../pages/website/Order'
import Login from '../../pages/website/Login'
import Signup from '../../pages/website/Signup'
import ScrollToHash from '../../components/ScrollToHash'
import AuthChoiceModal from '../website modal/AuthChoiceModal'
import GuestInformation from '../../pages/website/GuestInformation'
import Checkout from '../../pages/website/Checkout'
import OrderConfirmation from '../../pages/website/OrderConfirmation'
import Payment from '../../pages/website/Payment'
import ProtectedRoute from '../../routes/ProtectedRoute'

const WebsiteLayout = () => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleGuestContinue = () => {
    setShowAuthModal(false)
    window.location.href = '/guest-info'
  }

  const handleLogin = () => {
    setShowAuthModal(false)
    window.location.href = '/login'
  }

  const handleRegister = () => {
    setShowAuthModal(false)
    window.location.href = '/signup'
  }

  return (
    <div className="flex flex-col min-h-screen">
      <NavigationBar isScrolled={isScrolled} onAuthClick={() => setShowAuthModal(true)} />
      <ScrollToHash />

      <AuthChoiceModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onGuestContinue={handleGuestContinue}
        onLogin={handleLogin}
        onRegister={handleRegister}
      />

      <main className="flex-1">
        <Routes>
          {/* Public Routes */}
          <Route
            path="/"
            element={
              <>
                <Hero />
                <Why />
                <Story />
                <CallToAction />
                <Contact id="contact" />
              </>
            }
          />
          <Route path="/about" element={<About />} />
          <Route path="/faq" element={<Faq />} />
          <Route path="/order" element={<Order />} />
          <Route path="/guest-info" element={<GuestInformation />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Checkout Routes */}
          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <Checkout />
              </ProtectedRoute>
            }
          />

          <Route
            path="/order/confirmation"
            element={
              <ProtectedRoute>
                <OrderConfirmation />
              </ProtectedRoute>
            }
          />

          <Route
            path="/order/payment"
            element={
              <ProtectedRoute>
                <Payment />
              </ProtectedRoute>
            }
          />

          {/* Protected Routes */}
          {/* <Route
            path="/account"
            element={
              <ProtectedRoute requireAuth allowedTypes={['customer']}>
                <div>Account Settings (Placeholder)</div>
              </ProtectedRoute>
            }
          />

          <Route
            path="/order-history"
            element={
              <ProtectedRoute requireAuth allowedTypes={['customer']}>
                <div>Order History (Placeholder)</div>
              </ProtectedRoute>
            }
          /> */}

          {/* 404 Page */}
          <Route
            path="*"
            element={
              <div
                className="min-h-screen flex items-center justify-center"
                style={{ backgroundColor: '#F5EFE7' }}
              >
                <div className="text-center">
                  <h1 className="text-4xl font-bold mb-4" style={{ color: '#2A1803' }}>
                    404
                  </h1>
                  <p className="text-lg mb-6" style={{ color: '#9C4A15' }}>
                    Page not found
                  </p>
                  <a href="/" className="text-[#9C4A15] hover:underline font-medium">
                    Return to Home
                  </a>
                </div>
              </div>
            }
          />
        </Routes>
      </main>

      <Footer />
    </div>
  )
}

export default WebsiteLayout
