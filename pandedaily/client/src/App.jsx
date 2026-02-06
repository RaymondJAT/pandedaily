import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import NavigationBar from './components/layout/navigation/NavigationBar'
import Hero from './pages/website/home/Hero'
import Why from './pages/website/home/Why'
import Story from './pages/website/home/Story'
import CallToAction from './pages/website/home/CallToAction'
import Contact from './pages/website/home/Contact'
import Footer from './components/layout/Footer'
import About from './pages/website/About'
import Faq from './pages/website/Faq'
import Order from './pages/website/Order'
import AuthChoiceModal from './components/modal/AuthChoiceModal'
import Login from './pages/website/Login'
import Signup from './pages/website/Signup'

import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './routes/ProtectedRoute'
import DashboardLayout from './pages/dashboard/DashboardLayout'

const ScrollToHash = () => {
  const location = useLocation()

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '')
      setTimeout(() => {
        const element = document.getElementById(id)
        if (element) {
          const offset = 80
          const elementPosition = element.getBoundingClientRect().top
          const offsetPosition = elementPosition + window.pageYOffset - offset

          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth',
          })
        }
      }, 500)
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [location])

  return null
}

function App() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  // Function to trigger auth modal from any component
  const handleOpenAuthModal = () => {
    setShowAuthModal(true)
  }

  // Function to close auth modal
  const handleCloseAuthModal = () => {
    setShowAuthModal(false)
  }

  // Handle guest checkout
  const handleGuestContinue = () => {
    setShowAuthModal(false)
    console.log('Guest checkout initiated')
  }

  // Handle login/register click
  const handleLoginRegister = () => {
    setShowAuthModal(false)
    window.location.href = '/login'
  }

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <Router>
      <AuthProvider>
        <div className="flex flex-col min-h-screen">
          <Routes>
            <Route
              path="/dashboard/*"
              element={
                <ProtectedRoute allowedTypes={['admin']}>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            />
            <Route
              path="*"
              element={
                <>
                  <NavigationBar isScrolled={isScrolled} onAuthClick={handleOpenAuthModal} />
                  <ScrollToHash />
                  <AuthChoiceModal
                    isOpen={showAuthModal}
                    onClose={handleCloseAuthModal}
                    onGuestContinue={handleGuestContinue}
                    onLoginRegister={handleLoginRegister}
                  />
                  <main className="flex-1">
                    <Routes>
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
                      <Route path="/login" element={<Login />} />
                      <Route path="/signup" element={<Signup />} />
                    </Routes>
                  </main>
                  <Footer />
                </>
              }
            />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  )
}

export default App
