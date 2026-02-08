import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import {
  FiUser,
  FiLogOut,
  FiShoppingBag,
  FiChevronDown,
  FiUser as FiUserIcon,
} from 'react-icons/fi'
import logoImage from '../../../assets/hero-images/middle-logo.png'
import { WebsiteRoutes } from '../../../routes/websiteRoutes'
import { useAuth } from '../../../context/AuthContext'

const NavigationBar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const dropdownRef = useRef(null)

  const { user, logout } = useAuth()

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

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

  // Handle logout
  const handleLogout = () => {
    logout()
    setIsMenuOpen(false)
    setIsDropdownOpen(false)
    navigate(WebsiteRoutes.home)
  }

  // Handle customer dashboard
  const handleDashboard = () => {
    navigate('/customer/dashboard')
    setIsMenuOpen(false)
    setIsDropdownOpen(false)
  }

  // Handle orders
  const handleOrders = () => {
    navigate('/customer/orders')
    setIsMenuOpen(false)
    setIsDropdownOpen(false)
  }

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user?.c_fullname) return 'U'
    return user.c_fullname
      .split(' ')
      .map((name) => name[0])
      .join('')
      .toUpperCase()
      .substring(0, 2)
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

          {/* Right Side: User Actions */}
          <div className="hidden md:flex items-center space-x-6 flex-1 justify-end">
            {/* Order Now Button - ALWAYS VISIBLE */}
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

            {user ? (
              // Logged in customer view
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-2 py-2 px-4 rounded-full transition-all duration-200 hover:bg-[#3F2305] focus:outline-none cursor-pointer"
                  style={{ color: '#F5EFE7' }}
                >
                  {/* User Avatar */}
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center font-medium"
                    style={{ backgroundColor: '#9C4A15', color: '#F5EFE7' }}
                  >
                    {getUserInitials()}
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium truncate max-w-30">
                      {user.c_fullname?.split(' ')[0] || 'Customer'}
                    </p>
                    <p className="text-xs opacity-80">My Account</p>
                  </div>
                  <FiChevronDown
                    className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl py-2 z-50">
                    {/* User Info */}
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="font-medium text-[#2A1803] truncate">{user.c_fullname}</p>
                      <p className="text-sm text-[#9C4A15] truncate">{user.c_email}</p>
                    </div>

                    {/* Menu Items */}

                    <button
                      onClick={handleOrders}
                      className="flex items-center w-full px-4 py-3 text-left hover:bg-[#F5EFE7] transition-colors cursor-pointer"
                    >
                      <FiShoppingBag className="mr-3 text-[#9C4A15]" />
                      <span className="text-[#2A1803]">My Orders</span>
                    </button>

                    {/* Divider */}
                    <div className="border-t border-gray-100 my-1"></div>

                    {/* Logout */}
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-3 text-left hover:bg-[#F5EFE7] transition-colors cursor-pointer"
                    >
                      <FiLogOut className="mr-3 text-[#9C4A15]" />
                      <span className="text-[#2A1803]">Logout</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              // Not logged in view - Only Login button
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
            )}
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

              {/* Mobile Order Now Button - ALWAYS VISIBLE */}
              <Link
                to={WebsiteRoutes.order}
                className="font-medium py-4 px-8 rounded-full transition-all duration-200 hover:scale-105 text-xl text-center"
                style={{
                  backgroundColor: '#F5EFE7',
                  color: '#3F2305',
                }}
                onClick={() => setIsMenuOpen(false)}
              >
                Order Now
              </Link>

              {/* Mobile User Section */}
              {user ? (
                <>
                  {/* User Info */}
                  <div className="flex items-center justify-center space-x-3 py-4 border-t border-[#3F2305] pt-8">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center font-medium"
                      style={{ backgroundColor: '#9C4A15', color: '#F5EFE7' }}
                    >
                      {getUserInitials()}
                    </div>
                    <div className="text-left">
                      <p className="text-lg font-medium" style={{ color: '#F5EFE7' }}>
                        {user.c_fullname?.split(' ')[0] || 'Customer'}
                      </p>
                      <p className="text-sm opacity-80" style={{ color: '#F5EFE7' }}>
                        {user.c_email}
                      </p>
                    </div>
                  </div>

                  {/* Mobile Menu Items */}
                  <button
                    onClick={handleDashboard}
                    className="flex items-center justify-center space-x-2 py-4 hover:opacity-80 text-xl focus:outline-none cursor-pointer"
                    style={{ color: '#F5EFE7' }}
                  >
                    <FiUserIcon />
                    <span>Dashboard</span>
                  </button>

                  <button
                    onClick={handleOrders}
                    className="flex items-center justify-center space-x-2 py-4 hover:opacity-80 text-xl focus:outline-none cursor-pointer"
                    style={{ color: '#F5EFE7' }}
                  >
                    <FiShoppingBag />
                    <span>My Orders</span>
                  </button>

                  {/* Logout Button */}
                  <button
                    onClick={handleLogout}
                    className="flex items-center justify-center space-x-2 py-4 hover:opacity-80 text-xl focus:outline-none cursor-pointer"
                    style={{ color: '#F5EFE7' }}
                  >
                    <FiLogOut />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                // Mobile Login Button
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
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default NavigationBar
