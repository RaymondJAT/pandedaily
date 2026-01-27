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

// Component to handle hash scrolling
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
        <NavigationBar isScrolled={isScrolled} />
        <ScrollToHash />
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
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  )
}

export default App
