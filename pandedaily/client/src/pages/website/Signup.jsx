// Signup.jsx
import { motion } from 'framer-motion'
import { useState } from 'react'
import {
  FaUserCircle,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaArrowLeft,
  FaCrosshairs,
} from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { signupUser } from '../../services/api'
import LocationMap from './LocationMap'
import AddressAutocomplete from './AddressAutocomplete'
import { reverseGeocode } from '../../services/api'

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
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [apiError, setApiError] = useState('')
  const [locationValid, setLocationValid] = useState(false)
  const [isGettingLocation, setIsGettingLocation] = useState(false)

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
    } else {
      const digits = formData.phone.replace(/\D/g, '')
      if (!/^(09|\+639)\d{9}$/.test(digits) && !/^\d{10,11}$/.test(digits)) {
        newErrors.phone = 'Phone number must be 10-11 digits (e.g., 09123456789)'
      }
    }

    // Location validation - must have coordinates from map click
    if (!selectedLocation || !selectedLocation.lat || !selectedLocation.lng) {
      newErrors.location = 'Please click on the map to select your delivery location'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 3) {
      newErrors.password = 'Password must be at least 3 characters'
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

    // Format phone number
    let formattedValue = value
    if (name === 'phone') {
      const digits = value.replace(/\D/g, '').slice(0, 11)
      if (digits.length > 7) {
        formattedValue = `${digits.slice(0, 4)}-${digits.slice(4, 7)}-${digits.slice(7)}`
      } else if (digits.length > 4) {
        formattedValue = `${digits.slice(0, 4)}-${digits.slice(4)}`
      } else {
        formattedValue = digits
      }
    }

    setFormData((prev) => ({
      ...prev,
      [name]: formattedValue,
    }))

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
    if (apiError) {
      setApiError('')
    }
  }

  // Handle location selection from map click
  const handleLocationSelect = (location) => {
    // Ensure coordinates are valid numbers
    const lat = parseFloat(location.lat)
    const lng = parseFloat(location.lng)

    if (isNaN(lat) || isNaN(lng)) {
      console.error('Invalid coordinates received:', location)
      return
    }

    console.log('Location selected:', { lat, lng, address: location.address })

    setSelectedLocation({
      lat: lat,
      lng: lng,
      address: location.address || formData.address,
    })

    // Update address field if we got address from reverse geocoding
    if (location.address) {
      setFormData((prev) => ({
        ...prev,
        address: location.address,
      }))
    }

    setLocationValid(true)

    // Clear location error if exists
    if (errors.location) {
      setErrors((prev) => ({ ...prev, location: '' }))
    }
  }

  // Get user's current location
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser')
      return
    }

    setIsGettingLocation(true)

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords

        console.log('Got current position:', { latitude, longitude })

        try {
          const result = await reverseGeocode(latitude, longitude)

          handleLocationSelect({
            lat: latitude,
            lng: longitude,
            address: result.address,
          })
        } catch (error) {
          console.error('Error getting address for current location:', error)
          // Fallback with coordinates only
          handleLocationSelect({
            lat: latitude,
            lng: longitude,
            address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
          })
        } finally {
          setIsGettingLocation(false)
        }
      },
      (error) => {
        console.error('Error getting location:', error)
        alert('Unable to get your location. Please click on the map instead.')
        setIsGettingLocation(false)
      },
    )
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setApiError('')

    if (validateForm()) {
      try {
        const cleanedPhone = formData.phone.replace(/\D/g, '')

        // Add a safety check here
        if (!selectedLocation) {
          setApiError('Please select a location on the map')
          setIsSubmitting(false)
          return
        }

        const userData = {
          fullname: formData.fullName,
          username: formData.username,
          email: formData.email,
          contact: cleanedPhone,
          address: selectedLocation.address || formData.address,
          latitude: selectedLocation.lat,
          longitude: selectedLocation.lng,
          password: formData.password,
        }

        console.log('Sending data:', userData)

        const response = await signupUser(userData)

        if (response.success && response.customer) {
          alert('Account created successfully! Please login.')
          navigate('/login', {
            state: {
              message: 'Registration successful! Please login with your credentials.',
              email: formData.email,
            },
          })
        } else {
          throw new Error('Registration failed: Unexpected response from server')
        }
      } catch (error) {
        console.error('Registration error:', error)

        if (error.message.includes('409')) {
          if (error.message.toLowerCase().includes('username')) {
            setErrors((prev) => ({ ...prev, username: 'Username is already taken' }))
          } else if (error.message.toLowerCase().includes('email')) {
            setErrors((prev) => ({ ...prev, email: 'Email is already registered' }))
          } else if (error.message.toLowerCase().includes('contact')) {
            setErrors((prev) => ({ ...prev, phone: 'Phone number is already registered' }))
          } else {
            setApiError('This account already exists. Please try logging in.')
          }
        } else if (error.message.includes('400')) {
          setApiError('Please check your information and try again.')
        } else {
          setApiError(error.message || 'Registration failed. Please try again later.')
        }
      }
    }
    setIsSubmitting(false)
  }

  // Go to login page
  const goToLogin = () => {
    navigate('/login')
  }

  // Animation variants
  const pageVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3 } },
  }

  const formVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: 'easeOut' } },
  }

  const mapVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: 'easeOut', delay: 0.1 } },
  }

  return (
    <motion.div
      className="min-h-screen flex flex-col md:flex-row font-[titleFont]"
      style={{ backgroundColor: '#F5EFE7' }}
      variants={pageVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Back Button - Mobile Only */}
      <button
        onClick={() => navigate(-1)}
        className="absolute top-4 left-4 md:hidden z-10 flex items-center gap-2 p-2 rounded-lg hover:bg-white/50 transition-colors"
        style={{ color: '#2A1803' }}
      >
        <FaArrowLeft className="w-4 h-4" />
        <span className="text-sm font-[titleFont]">Back</span>
      </button>

      {/* Left Column - Form */}
      <motion.div
        className="w-full md:w-1/2 flex items-center justify-center p-6 md:p-8 lg:p-12 overflow-y-auto"
        style={{ maxHeight: '100vh' }}
        variants={formVariants}
      >
        <div className="w-full max-w-lg">
          {/* Header */}
          <div className="text-center mb-8">
            <h1
              className="text-3xl md:text-4xl font-light mb-2 font-[titleFont]"
              style={{ color: '#2A1803' }}
            >
              Create Account
            </h1>
            <p className="text-base md:text-lg font-[titleFont]" style={{ color: '#9C4A15' }}>
              Register as a new customer
            </p>
          </div>

          {/* Form */}
          <div className="bg-white rounded-xl shadow-xl p-8">
            {/* API Error Message */}
            {apiError && (
              <motion.div
                className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {apiError}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Row 1: Full Name (full width) */}
              <div>
                <label
                  className="block text-sm font-medium mb-2 font-[titleFont]"
                  style={{ color: '#2A1803' }}
                >
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    <FaUserCircle className="w-5 h-5" style={{ color: '#9C4A15' }} />
                  </div>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className={`w-full pl-12 pr-4 py-4 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-[#9C4A15] transition-all font-[titleFont] text-base ${
                      errors.fullName ? 'border-red-500' : 'border-[#9C4A15]'
                    }`}
                    placeholder="Enter your full name"
                    disabled={isSubmitting}
                  />
                </div>
                {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
              </div>

              {/* Row 2: Username and Email (2 columns) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Username */}
                <div>
                  <label
                    className="block text-sm font-medium mb-2 font-[titleFont]"
                    style={{ color: '#2A1803' }}
                  >
                    Username
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                      <FaUser className="w-5 h-5" style={{ color: '#9C4A15' }} />
                    </div>
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      className={`w-full pl-12 pr-4 py-4 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-[#9C4A15] transition-all font-[titleFont] text-base ${
                        errors.username ? 'border-red-500' : 'border-[#9C4A15]'
                      }`}
                      placeholder="Username"
                      disabled={isSubmitting}
                    />
                  </div>
                  {errors.username && (
                    <p className="text-red-500 text-xs mt-1">{errors.username}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label
                    className="block text-sm font-medium mb-2 font-[titleFont]"
                    style={{ color: '#2A1803' }}
                  >
                    Email
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                      <FaEnvelope className="w-5 h-5" style={{ color: '#9C4A15' }} />
                    </div>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full pl-12 pr-4 py-4 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-[#9C4A15] transition-all font-[titleFont] text-base ${
                        errors.email ? 'border-red-500' : 'border-[#9C4A15]'
                      }`}
                      placeholder="Email address"
                      disabled={isSubmitting}
                    />
                  </div>
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>
              </div>

              {/* Row 3: Phone (full width) */}
              <div>
                <label
                  className="block text-sm font-medium mb-2 font-[titleFont]"
                  style={{ color: '#2A1803' }}
                >
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    <FaPhone className="w-5 h-5" style={{ color: '#9C4A15' }} />
                  </div>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={`w-full pl-12 pr-4 py-4 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-[#9C4A15] transition-all font-[titleFont] text-base ${
                      errors.phone ? 'border-red-500' : 'border-[#9C4A15]'
                    }`}
                    placeholder="09XX-XXX-XXXX"
                    maxLength="13"
                    disabled={isSubmitting}
                  />
                </div>
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
              </div>

              {/* Row 4: Address (full width - solo) */}
              <div>
                <label
                  className="block text-sm font-medium mb-2 font-[titleFont]"
                  style={{ color: '#2A1803' }}
                >
                  Delivery Address
                </label>

                <AddressAutocomplete
                  value={formData.address}
                  onChange={handleInputChange}
                  onLocationSelect={handleLocationSelect}
                  disabled={isSubmitting}
                />

                {/* Coordinates display - expanded */}
                {selectedLocation?.lat && selectedLocation?.lng && (
                  <div className="mt-3 p-3 bg-[#F5EFE7] rounded-lg">
                    <div className="flex flex-wrap gap-4">
                      <p className="text-sm font-mono" style={{ color: '#2A1803' }}>
                        <span className="font-medium">Latitude:</span>{' '}
                        <span className="font-bold" style={{ color: '#9C4A15' }}>
                          {selectedLocation.lat.toFixed(6)}
                        </span>
                      </p>
                      <p className="text-sm font-mono" style={{ color: '#2A1803' }}>
                        <span className="font-medium">Longitude:</span>{' '}
                        <span className="font-bold" style={{ color: '#9C4A15' }}>
                          {selectedLocation.lng.toFixed(6)}
                        </span>
                      </p>
                    </div>
                  </div>
                )}

                {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location}</p>}
              </div>

              {/* Row 5: Password and Confirm Password (2 columns) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Password */}
                <div>
                  <label
                    className="block text-sm font-medium mb-2 font-[titleFont]"
                    style={{ color: '#2A1803' }}
                  >
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                      <FaLock className="w-5 h-5" style={{ color: '#9C4A15' }} />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className={`w-full pl-12 pr-12 py-4 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-[#9C4A15] transition-all font-[titleFont] text-base ${
                        errors.password ? 'border-red-500' : 'border-[#9C4A15]'
                      }`}
                      placeholder="Min. 3 characters"
                      disabled={isSubmitting}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 focus:outline-none rounded-full p-1"
                      style={{ color: '#9C4A15' }}
                      disabled={isSubmitting}
                    >
                      {showPassword ? (
                        <FaEyeSlash className="w-5 h-5" />
                      ) : (
                        <FaEye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label
                    className="block text-sm font-medium mb-2 font-[titleFont]"
                    style={{ color: '#2A1803' }}
                  >
                    Confirm Password
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                      <FaLock className="w-5 h-5" style={{ color: '#9C4A15' }} />
                    </div>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className={`w-full pl-12 pr-12 py-4 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-[#9C4A15] transition-all font-[titleFont] text-base ${
                        errors.confirmPassword ? 'border-red-500' : 'border-[#9C4A15]'
                      }`}
                      placeholder="Confirm password"
                      disabled={isSubmitting}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 focus:outline-none rounded-full p-1"
                      style={{ color: '#9C4A15' }}
                      disabled={isSubmitting}
                    >
                      {showConfirmPassword ? (
                        <FaEyeSlash className="w-5 h-5" />
                      ) : (
                        <FaEye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={isSubmitting || !selectedLocation?.lat || !selectedLocation?.lng}
                className={`w-full py-4 rounded-lg font-medium font-[titleFont] text-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#9C4A15] ${
                  isSubmitting || !selectedLocation?.lat || !selectedLocation?.lng
                    ? 'opacity-50 cursor-not-allowed'
                    : 'cursor-pointer hover:opacity-90'
                }`}
                style={{
                  backgroundColor: '#9C4A15',
                  color: '#F5EFE7',
                }}
                whileHover={
                  !isSubmitting && selectedLocation?.lat && selectedLocation?.lng
                    ? { scale: 1.02 }
                    : {}
                }
                whileTap={
                  !isSubmitting && selectedLocation?.lat && selectedLocation?.lng
                    ? { scale: 0.98 }
                    : {}
                }
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin h-6 w-6 mr-3 text-white" viewBox="0 0 24 24">
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

            {/* Login Link */}
            <p className="text-sm text-center mt-6" style={{ color: '#9C4A15' }}>
              Already have an account?{' '}
              <button
                onClick={goToLogin}
                className="font-medium underline hover:text-[#2A1803] transition-colors"
                disabled={isSubmitting}
              >
                Login
              </button>
            </p>
          </div>
        </div>
      </motion.div>

      {/* Right Column - Clickable Map */}
      <motion.div className="hidden md:block md:w-1/2 h-screen sticky top-0" variants={mapVariants}>
        <div className="h-full relative">
          {/* Current Location Button */}
          <button
            onClick={getCurrentLocation}
            disabled={isGettingLocation}
            className="absolute top-6 right-6 z-10 bg-white p-4 rounded-full shadow-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            style={{ color: '#9C4A15' }}
            title="Use my current location"
          >
            <FaCrosshairs className={`w-6 h-6 ${isGettingLocation ? 'animate-spin' : ''}`} />
          </button>

          <LocationMap
            onLocationSelect={handleLocationSelect}
            selectedLocation={selectedLocation}
          />
        </div>
      </motion.div>

      {/* Mobile Map Preview */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-72 z-10">
        <div className="h-full relative">
          <button
            onClick={getCurrentLocation}
            disabled={isGettingLocation}
            className="absolute top-4 right-4 z-20 bg-white p-3 rounded-full shadow-lg"
            style={{ color: '#9C4A15' }}
          >
            <FaCrosshairs className={`w-5 h-5 ${isGettingLocation ? 'animate-spin' : ''}`} />
          </button>
          <LocationMap
            onLocationSelect={handleLocationSelect}
            selectedLocation={selectedLocation}
          />
        </div>
      </div>
    </motion.div>
  )
}

export default Signup
