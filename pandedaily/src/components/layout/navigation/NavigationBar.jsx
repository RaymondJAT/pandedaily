import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import logoImage from '../../../assets/hero-images/middle-logo.png'

const NavigationBar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  // Define navigation items
  const navItems = [
    { id: 1, label: 'About', href: '/about', external: true },
    { id: 2, label: 'FAQ', href: '/faq', external: true },
    { id: 3, label: 'Contact', href: '/#contact', external: false },
  ]

  const handleContactClick = () => {
    // Close mobile menu if open
    if (isMenuOpen) {
      setIsMenuOpen(false)
    }

    if (location.pathname === '/') {
      // We're already on homepage, scroll to contact
      setTimeout(() => {
        const element = document.getElementById('contact')
        if (element) {
          const offset = 80
          const elementPosition = element.getBoundingClientRect().top
          const offsetPosition = elementPosition + window.pageYOffset - offset

          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth',
          })
        }
      }, 100) // Small delay to ensure DOM is ready
    } else {
      // Navigate to homepage with hash
      navigate('/#contact')
    }
  }

  // Logo click handler - navigate to home
  const handleLogoClick = () => {
    if (isMenuOpen) setIsMenuOpen(false)
    navigate('/')
  }

  // Scroll to contact if URL has hash on mount
  useEffect(() => {
    if (location.pathname === '/' && location.hash === '#contact') {
      setTimeout(() => {
        const element = document.getElementById('contact')
        if (element) {
          const offset = 80
          const elementPosition = element.getBoundingClientRect().top
          const offsetPosition = elementPosition + window.pageYOffset - offset

          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth',
          })
        }
      }, 500) // Delay to ensure page is loaded
    }
  }, [location])

  return (
    <nav className="sticky top-0 z-50" style={{ backgroundColor: '#2A1803' }}>
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-24">
          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-10">
            {navItems.map((item) =>
              item.external ? (
                <Link
                  key={item.id}
                  to={item.href}
                  className="font-medium transition-colors duration-200 hover:opacity-80 text-sm font-[titleFont]"
                  style={{ color: '#F5EFE7' }}
                >
                  {item.label}
                </Link>
              ) : (
                <button
                  key={item.id}
                  onClick={handleContactClick}
                  className="font-medium transition-colors duration-300 hover:opacity-80 text-sm font-[titleFont] focus:outline-none cursor-pointer"
                  style={{ color: '#F5EFE7' }}
                >
                  {item.label}
                </button>
              ),
            )}
          </div>

          {/* Logo */}
          <div className="absolute left-1/2 transform -translate-x-1/2 md:relative md:left-0 md:transform-none">
            <button onClick={handleLogoClick} className="focus:outline-none cursor-pointer">
              <img
                src={logoImage}
                alt="Company Logo"
                className="h-20 md:h-24 w-auto transition-transform duration-200 hover:scale-105"
              />
            </button>
          </div>

          {/* Order Now Button */}
          <div className="hidden md:block">
            <Link
              to="/order"
              className="font-medium py-2 px-7 rounded-full transition-all duration-200 shadow-xl hover:shadow-2xl hover:scale-105 cursor-pointer text-sm font-[titleFont] inline-block"
              style={{
                backgroundColor: '#F5EFE7',
                color: '#3F2305',
              }}
            >
              Order Now
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="focus:outline-none"
              aria-label="Toggle menu"
            >
              <div className="space-y-1">
                <span
                  className={`block h-1 w-8 transition-transform ${
                    isMenuOpen ? 'rotate-45 translate-y-2' : ''
                  }`}
                  style={{ backgroundColor: '#F5EFE7' }}
                ></span>
                <span
                  className={`block h-1 w-8 ${isMenuOpen ? 'opacity-0' : ''}`}
                  style={{ backgroundColor: '#F5EFE7' }}
                ></span>
                <span
                  className={`block h-1 w-8 transition-transform ${
                    isMenuOpen ? '-rotate-45 -translate-y-2' : ''
                  }`}
                  style={{ backgroundColor: '#F5EFE7' }}
                ></span>
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-6" style={{ backgroundColor: '#2A1803' }}>
            <div className="flex flex-col space-y-8 px-6">
              {navItems.map((item) =>
                item.external ? (
                  // External link (About, FAQ)
                  <Link
                    key={item.id}
                    to={item.href}
                    className="font-medium py-4 text-center hover:opacity-80 text-xl"
                    style={{ color: '#F5EFE7' }}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                ) : (
                  // Internal scroll (Contact)
                  <button
                    key={item.id}
                    onClick={handleContactClick}
                    className="font-medium py-4 text-center hover:opacity-80 text-xl focus:outline-none cursor-pointer"
                    style={{ color: '#F5EFE7' }}
                  >
                    {item.label}
                  </button>
                ),
              )}
              <Link
                to="/order"
                className="font-medium py-4 px-8 rounded-full transition-all duration-200 mt-8 hover:scale-105 text-xl text-center"
                style={{
                  backgroundColor: '#F5EFE7',
                  color: '#3F2305',
                }}
                onClick={() => setIsMenuOpen(false)}
              >
                Order Now
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default NavigationBar
