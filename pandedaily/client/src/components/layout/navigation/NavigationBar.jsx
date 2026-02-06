import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { FiUser } from 'react-icons/fi'
import logoImage from '../../../assets/hero-images/middle-logo.png'
import { WebsiteRoutes } from '../../../routes/websiteRoutes'
import { useAuth } from '../../../context/AuthContext'

const NavigationBar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  const { user, logout } = useAuth()

  const handleContactClick = () => {
    // Close mobile menu if open
    if (isMenuOpen) {
      setIsMenuOpen(false)
    }

    if (location.pathname === WebsiteRoutes.home) {
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
      }, 100)
    } else {
      navigate(WebsiteRoutes.contact)
    }
  }

  // Logo click handler
  const handleLogoClick = () => {
    if (isMenuOpen) setIsMenuOpen(false)
    navigate(WebsiteRoutes.home)
  }

  // Scroll to contact
  useEffect(() => {
    if (location.pathname === WebsiteRoutes.home && location.hash === '#contact') {
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
      }, 500)
    }
  }, [location])

  return (
    <nav className="sticky top-0 z-50" style={{ backgroundColor: '#2A1803' }}>
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-24">
          {/* Left Side: Navigation Links */}
          <div className="hidden md:flex items-center space-x-10 flex-1 justify-start">
            {WebsiteRoutes.navItems.map((item) =>
              item.type === 'external' ? (
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

          {/* Logo - Always Center */}
          <div className="absolute left-1/2 transform -translate-x-1/2 md:absolute md:left-1/2 md:transform md:-translate-x-1/2">
            <button onClick={handleLogoClick} className="focus:outline-none cursor-pointer">
              <img
                src={logoImage}
                alt="Company Logo"
                className="h-20 md:h-24 w-auto transition-transform duration-200 hover:scale-105"
              />
            </button>
          </div>

          {/* Right Side: Login + Order Now */}
          <div className="hidden md:flex items-center space-x-6 flex-1 justify-end">
            {/* Always show Login button (users will be redirected to dashboard if admin) */}
            <Link
              to="/login"
              className="font-medium transition-colors duration-200 hover:opacity-80 text-sm font-[titleFont]"
              style={{ color: '#F5EFE7' }}
            >
              <div className="flex items-center space-x-2">
                <FiUser className="text-[#F5EFE7]" size={18} />
                <span>Login</span>
              </div>
            </Link>

            {/* Order Now Button */}
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

          {/* Mobile menu button - On the right side */}
          <div className="md:hidden flex items-center absolute right-4">
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
              {WebsiteRoutes.navItems.map((item) =>
                item.type === 'external' ? (
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

              {/* Mobile Login Button */}
              <Link
                to="/login"
                className="font-medium py-4 text-center hover:opacity-80 text-xl"
                style={{ color: '#F5EFE7' }}
                onClick={() => setIsMenuOpen(false)}
              >
                <div className="flex items-center justify-center space-x-2">
                  <FiUser className="text-[#F5EFE7]" />
                  <span>Login</span>
                </div>
              </Link>

              {/* Mobile Order Now Button */}
              <Link
                to={WebsiteRoutes.order}
                className="font-medium py-4 px-8 rounded-full transition-all duration-200 mt-4 hover:scale-105 text-xl text-center"
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
