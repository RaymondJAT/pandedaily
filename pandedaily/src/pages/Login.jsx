import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { FaUser, FaLock, FaEnvelope, FaPhone, FaArrowLeft, FaEye, FaEyeSlash } from 'react-icons/fa'
import { Link, useNavigate } from 'react-router-dom'

const Login = () => {
  const navigate = useNavigate()
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phone: '',
  })
  const [rememberMe, setRememberMe] = useState(false)
  const [errors, setErrors] = useState({})

  // Form validation
  const validateForm = () => {
    const newErrors = {}

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid'
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }

    // Registration specific validations
    if (!isLogin) {
      if (!formData.fullName) {
        newErrors.fullName = 'Full name is required'
      }

      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password'
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match'
      }

      if (formData.phone && !/^[\+]?[1-9][\d]{0,15}$/.test(formData.phone.replace(/[^\d+]/g, ''))) {
        newErrors.phone = 'Phone number is invalid'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }))
    }
  }

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault()

    if (validateForm()) {
      // Handle successful form submission
      console.log('Form submitted:', formData)

      // In a real app, you would make an API call here
      // For demo purposes, we'll simulate a successful login/registration
      if (isLogin) {
        // Login logic
        alert('Login successful!')
        navigate('/') // Navigate to home page
      } else {
        // Registration logic
        alert('Registration successful! Please login.')
        setIsLogin(true) // Switch to login form
        // Clear password fields
        setFormData((prev) => ({
          ...prev,
          password: '',
          confirmPassword: '',
        }))
      }
    }
  }

  // Animation variants
  const pageVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.3 },
    },
    exit: {
      opacity: 0,
      transition: { duration: 0.2 },
    },
  }

  const formVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: 'easeOut' },
    },
  }

  const inputVariants = {
    focus: { scale: 1.02, transition: { duration: 0.2 } },
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        className="min-h-screen flex flex-col items-center justify-center p-4 md:p-6"
        style={{ backgroundColor: '#F5EFE7' }}
        variants={pageVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        {/* Main Container */}
        <motion.div className="w-full max-w-md mx-auto" variants={formVariants}>
          {/* Card */}
          <div
            className="rounded-xl md:rounded-2xl shadow-xl md:shadow-2xl overflow-hidden"
            style={{ backgroundColor: 'white' }}
          >
            {/* Header */}
            <div
              className="p-6 md:p-8 text-center border-b"
              style={{ borderColor: '#9C4A15', backgroundColor: '#F5EFE7' }}
            >
              <h1
                className="text-2xl md:text-3xl font-light mb-2 font-[titleFont]"
                style={{ color: '#2A1803' }}
              >
                {isLogin ? 'Welcome Back' : 'Create Account'}
              </h1>
              <p className="text-sm md:text-base font-[titleFont]" style={{ color: '#9C4A15' }}>
                {isLogin ? 'Sign in to your account' : 'Join us today'}
              </p>
            </div>

            {/* Form */}
            <div className="p-6 md:p-8">
              <form onSubmit={handleSubmit}>
                {/* Full Name (Registration only) */}
                <AnimatePresence>
                  {!isLogin && (
                    <motion.div
                      className="mb-4 md:mb-6"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <label
                        className="block text-sm font-medium mb-2 font-[titleFont]"
                        style={{ color: '#2A1803' }}
                      >
                        Full Name
                      </label>
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                          <FaUser className="w-4 h-4 md:w-5 md:h-5" style={{ color: '#9C4A15' }} />
                        </div>
                        <input
                          type="text"
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleInputChange}
                          className={`w-full pl-10 pr-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-[#9C4A15] transition-all font-[titleFont] ${
                            errors.fullName ? 'border-red-500' : 'border-[#9C4A15]'
                          }`}
                          placeholder="Enter your full name"
                        />
                      </div>
                      {errors.fullName && (
                        <motion.p
                          className="text-red-500 text-xs mt-1 font-[titleFont]"
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                        >
                          {errors.fullName}
                        </motion.p>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Email */}
                <div className="mb-4 md:mb-6">
                  <label
                    className="block text-sm font-medium mb-2 font-[titleFont]"
                    style={{ color: '#2A1803' }}
                  >
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                      <FaEnvelope className="w-4 h-4 md:w-5 md:h-5" style={{ color: '#9C4A15' }} />
                    </div>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-[#9C4A15] transition-all font-[titleFont] ${
                        errors.email ? 'border-red-500' : 'border-[#9C4A15]'
                      }`}
                      placeholder="Enter your email"
                    />
                  </div>
                  {errors.email && (
                    <motion.p
                      className="text-red-500 text-xs mt-1 font-[titleFont]"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      {errors.email}
                    </motion.p>
                  )}
                </div>

                {/* Phone (Registration only) */}
                <AnimatePresence>
                  {!isLogin && (
                    <motion.div
                      className="mb-4 md:mb-6"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <label
                        className="block text-sm font-medium mb-2 font-[titleFont]"
                        style={{ color: '#2A1803' }}
                      >
                        Phone Number (Optional)
                      </label>
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                          <FaPhone className="w-4 h-4 md:w-5 md:h-5" style={{ color: '#9C4A15' }} />
                        </div>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className={`w-full pl-10 pr-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-[#9C4A15] transition-all font-[titleFont] ${
                            errors.phone ? 'border-red-500' : 'border-[#9C4A15]'
                          }`}
                          placeholder="Enter your phone number"
                        />
                      </div>
                      {errors.phone && (
                        <motion.p
                          className="text-red-500 text-xs mt-1 font-[titleFont]"
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                        >
                          {errors.phone}
                        </motion.p>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Password */}
                <div className="mb-4 md:mb-6">
                  <label
                    className="block text-sm font-medium mb-2 font-[titleFont]"
                    style={{ color: '#2A1803' }}
                  >
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                      <FaLock className="w-4 h-4 md:w-5 md:h-5" style={{ color: '#9C4A15' }} />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-12 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-[#9C4A15] transition-all font-[titleFont] ${
                        errors.password ? 'border-red-500' : 'border-[#9C4A15]'
                      }`}
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 focus:outline-none focus:ring-2 focus:ring-[#9C4A15] rounded-full p-1"
                      style={{ color: '#9C4A15' }}
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  {errors.password && (
                    <motion.p
                      className="text-red-500 text-xs mt-1 font-[titleFont]"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      {errors.password}
                    </motion.p>
                  )}
                </div>

                {/* Confirm Password (Registration only) */}
                <AnimatePresence>
                  {!isLogin && (
                    <motion.div
                      className="mb-6"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <label
                        className="block text-sm font-medium mb-2 font-[titleFont]"
                        style={{ color: '#2A1803' }}
                      >
                        Confirm Password
                      </label>
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                          <FaLock className="w-4 h-4 md:w-5 md:h-5" style={{ color: '#9C4A15' }} />
                        </div>
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          className={`w-full pl-10 pr-12 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-[#9C4A15] transition-all font-[titleFont] ${
                            errors.confirmPassword ? 'border-red-500' : 'border-[#9C4A15]'
                          }`}
                          placeholder="Confirm your password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 focus:outline-none focus:ring-2 focus:ring-[#9C4A15] rounded-full p-1"
                          style={{ color: '#9C4A15' }}
                        >
                          {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>
                      {errors.confirmPassword && (
                        <motion.p
                          className="text-red-500 text-xs mt-1 font-[titleFont]"
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                        >
                          {errors.confirmPassword}
                        </motion.p>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  className="w-full py-3 md:py-4 rounded-lg font-medium font-[titleFont] transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#9C4A15] mb-6"
                  style={{
                    backgroundColor: '#9C4A15',
                    color: '#F5EFE7',
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isLogin ? 'Sign In' : 'Create Account'}
                </motion.button>

                {/* Divider */}
                <div className="relative mb-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t" style={{ borderColor: '#9C4A15' }}></div>
                  </div>
                </div>

                {/* Toggle between Login/Register */}
                <div className="text-center">
                  <p className="text-sm font-[titleFont]" style={{ color: '#2A1803' }}>
                    {isLogin ? "Don't have an account?" : 'Already have an account?'}
                    <button
                      type="button"
                      onClick={() => {
                        setIsLogin(!isLogin)
                        setErrors({})
                        // Clear confirm password when switching to login
                        if (isLogin) {
                          setFormData((prev) => ({
                            ...prev,
                            confirmPassword: '',
                          }))
                        }
                      }}
                      className="ml-1 font-medium hover:underline focus:outline-none focus:ring-2 focus:ring-[#9C4A15] rounded px-1"
                      style={{ color: '#9C4A15' }}
                    >
                      {isLogin ? 'Sign up' : 'Sign in'}
                    </button>
                  </p>
                </div>
              </form>
            </div>

            {/* Footer */}
            <div
              className="px-6 py-4 text-center border-t"
              style={{ borderColor: '#9C4A15', backgroundColor: '#F5EFE7' }}
            >
              <p className="text-xs font-[titleFont]" style={{ color: '#9C4A15' }}>
                By continuing, you agree to our{' '}
                <Link to="/terms" className="underline hover:text-[#2A1803] transition-colors">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link to="/privacy" className="underline hover:text-[#2A1803] transition-colors">
                  Privacy Policy
                </Link>
              </p>
            </div>
          </div>

          {/* Guest Option */}
          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/guest-checkout')}
              className="text-sm font-[titleFont] hover:underline focus:outline-none focus:ring-2 focus:ring-[#9C4A15] rounded px-1"
              style={{ color: '#9C4A15' }}
            >
              Continue as guest without creating an account
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default Login
