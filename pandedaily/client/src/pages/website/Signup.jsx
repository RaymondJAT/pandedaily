import { motion } from 'framer-motion'
import { useState } from 'react'
import {
  FaUserCircle,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaHome,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaArrowLeft,
} from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const Signup = () => {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    phone: '',
    address: '',
    password: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form validation
  const validateForm = () => {
    const newErrors = {}

    if (!formData.fullName) {
      newErrors.fullName = 'Full name is required'
    } else if (formData.fullName.length < 2) {
      newErrors.fullName = 'Full name must be at least 2 characters'
    }

    if (!formData.username) {
      newErrors.username = 'Username is required'
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters'
    }

    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid'
    }

    if (!formData.phone) {
      newErrors.phone = 'Phone number is required'
    } else if (!/^\d{10,11}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Phone number is invalid (10-11 digits)'
    }

    if (!formData.address) {
      newErrors.address = 'Address is required'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target

    // Format phone number as user types
    let formattedValue = value
    if (name === 'phone') {
      // Remove all non-digits and limit to 11 digits
      const digits = value.replace(/\D/g, '').slice(0, 11)
      // Format as XXX-XXX-XXXX
      if (digits.length > 6) {
        formattedValue = `${digits.slice(0, 4)}-${digits.slice(4, 7)}-${digits.slice(7)}`
      } else if (digits.length > 3) {
        formattedValue = `${digits.slice(0, 4)}-${digits.slice(4)}`
      } else {
        formattedValue = digits
      }
    }

    setFormData((prev) => ({
      ...prev,
      [name]: formattedValue,
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
    setIsSubmitting(true)

    if (validateForm()) {
      setTimeout(() => {
        // Customer signup
        login({
          type: 'customer',
          name: formData.username,
          fullName: formData.fullName,
        })

        // Store additional user info
        localStorage.setItem('userEmail', formData.email)
        localStorage.setItem('userPhone', formData.phone)
        localStorage.setItem('userAddress', formData.address)

        alert('Account created successfully! You are now logged in.')
        navigate('/order')
        setIsSubmitting(false)
      }, 1500)
    } else {
      setIsSubmitting(false)
    }
  }

  // Go to login page
  const goToLogin = () => {
    navigate('/login')
  }

  // Animation variants
  const pageVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.3 },
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

  return (
    <motion.div
      className="min-h-screen flex flex-col items-center justify-center p-4 md:p-6"
      style={{ backgroundColor: '#F5EFE7' }}
      variants={pageVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="absolute top-4 left-4 md:top-6 md:left-6 flex items-center gap-2 p-2 md:p-3 rounded-lg hover:bg-white/50 transition-colors focus:outline-none focus:ring-2 focus:ring-[#9C4A15]"
        style={{ color: '#2A1803' }}
      >
        <FaArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
        <span className="text-sm md:text-base font-[titleFont]">Back</span>
      </button>

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
              Create Account
            </h1>
            <p className="text-sm md:text-base font-[titleFont]" style={{ color: '#9C4A15' }}>
              Register as a new customer
            </p>
          </div>

          {/* Form */}
          <div className="p-6 md:p-8">
            <form onSubmit={handleSubmit}>
              {/* Full Name */}
              <div className="mb-4">
                <label
                  className="block text-sm font-medium mb-2 font-[titleFont]"
                  style={{ color: '#2A1803' }}
                >
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    <FaUserCircle className="w-4 h-4 md:w-5 md:h-5" style={{ color: '#9C4A15' }} />
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
              </div>

              {/* Username */}
              <div className="mb-4">
                <label
                  className="block text-sm font-medium mb-2 font-[titleFont]"
                  style={{ color: '#2A1803' }}
                >
                  Username
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    <FaUser className="w-4 h-4 md:w-5 md:h-5" style={{ color: '#9C4A15' }} />
                  </div>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-[#9C4A15] transition-all font-[titleFont] ${
                      errors.username ? 'border-red-500' : 'border-[#9C4A15]'
                    }`}
                    placeholder="Choose a username"
                  />
                </div>
                {errors.username && (
                  <motion.p
                    className="text-red-500 text-xs mt-1 font-[titleFont]"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {errors.username}
                  </motion.p>
                )}
              </div>

              {/* Email */}
              <div className="mb-4">
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

              {/* Phone */}
              <div className="mb-4">
                <label
                  className="block text-sm font-medium mb-2 font-[titleFont]"
                  style={{ color: '#2A1803' }}
                >
                  Phone Number
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
                    placeholder="09XX-XXX-XXXX"
                    maxLength="13"
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
              </div>

              {/* Address */}
              <div className="mb-4">
                <label
                  className="block text-sm font-medium mb-2 font-[titleFont]"
                  style={{ color: '#2A1803' }}
                >
                  Delivery Address
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    <FaHome className="w-4 h-4 md:w-5 md:h-5" style={{ color: '#9C4A15' }} />
                  </div>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-[#9C4A15] transition-all font-[titleFont] ${
                      errors.address ? 'border-red-500' : 'border-[#9C4A15]'
                    }`}
                    placeholder="Enter your complete delivery address"
                  />
                </div>
                {errors.address && (
                  <motion.p
                    className="text-red-500 text-xs mt-1 font-[titleFont]"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {errors.address}
                  </motion.p>
                )}
              </div>

              {/* Password */}
              <div className="mb-4">
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
                    placeholder="Create a password (min. 6 characters)"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 focus:outline-none focus:ring-2 focus:ring-[#9C4A15] rounded-full p-1 cursor-pointer"
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

              {/* Confirm Password */}
              <div className="mb-6">
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
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 focus:outline-none focus:ring-2 focus:ring-[#9C4A15] rounded-full p-1 cursor-pointer"
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
              </div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-3 md:py-4 rounded-lg font-medium font-[titleFont] transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#9C4A15] cursor-pointer ${
                  isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                }`}
                style={{
                  backgroundColor: '#9C4A15',
                  color: '#F5EFE7',
                }}
                whileHover={!isSubmitting ? { scale: 1.02 } : {}}
                whileTap={!isSubmitting ? { scale: 0.98 } : {}}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Creating Account...
                  </span>
                ) : (
                  'Create Account'
                )}
              </motion.button>
            </form>
          </div>

          {/* Footer */}
          <div
            className="px-6 py-4 text-center border-t"
            style={{ borderColor: '#9C4A15', backgroundColor: '#F5EFE7' }}
          >
            <p className="text-xs font-[titleFont]" style={{ color: '#9C4A15' }}>
              Already have an account?{' '}
              <button
                onClick={goToLogin}
                className="font-medium underline hover:text-[#2A1803] transition-colors focus:outline-none focus:ring-2 focus:ring-[#9C4A15] rounded px-1 cursor-pointer"
              >
                Login
              </button>
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default Signup
