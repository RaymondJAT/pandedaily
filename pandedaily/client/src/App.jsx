import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import NavigationBar from './components/layout/navigation/NavigationBar'
import Hero from './pages/home/Hero'
import Why from './pages/home/Why'
import Story from './pages/home/Story'
import CallToAction from './pages/home/CallToAction'
import Contact from './pages/home/Contact'
import Footer from './components/layout/Footer'
import About from './pages/About'
import Faq from './pages/Faq'
import Order from './pages/Order'
import AuthChoiceModal from './components/modal/AuthChoiceModal'
import Login from './pages/Login'

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
      // Scroll to top if no hash
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [location])

  return null
}

function App() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)

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
    // You can navigate to guest checkout page or handle guest flow
    console.log('Guest checkout initiated')
    // Optional: navigate to guest checkout page
    // window.location.href = '/guest-checkout'
  }

  // Handle login/register click
  const handleLoginRegister = () => {
    setShowAuthModal(false)
    // Navigation will be handled by the AuthChoiceModal component
    // or you can navigate here:
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
      <div className="flex flex-col min-h-screen">
        {/* Pass handleOpenAuthModal to NavigationBar if needed for auth buttons */}
        <NavigationBar isScrolled={isScrolled} onAuthClick={handleOpenAuthModal} />
        <ScrollToHash />

        {/* Auth Choice Modal */}
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
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  )
}

export default App
