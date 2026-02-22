import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  FaUser,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaArrowLeft,
  FaCheck,
  FaCrosshairs,
} from 'react-icons/fa'
import LocationMap from './LocationMap'
import AddressAutocomplete from './AddressAutocomplete'
import { reverseGeocode } from '../../services/api'

const GuestInformation = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    fullname: '',
    contactNumber: '',
    email: '',
    address: '',
  })
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [locationValid, setLocationValid] = useState(false)
  const [isGettingLocation, setIsGettingLocation] = useState(false)

  // Check if there's an existing order when component mounts
  useEffect(() => {
    const savedOrder = localStorage.getItem('pendingOrder')
    if (!savedOrder) {
      const selectedProducts = localStorage.getItem('selectedProducts')
      if (!selectedProducts) {
        // No products selected, redirect to order page
        navigate('/order')
      }
    }
  }, [navigate])

  // Validation
  const validateForm = () => {
    const newErrors = {}

    if (!formData.fullname.trim()) {
      newErrors.fullname = 'Full name is required'
    } else if (formData.fullname.length < 2) {
      newErrors.fullname = 'Full name must be at least 2 characters'
    } else if (formData.fullname.length > 100) {
      newErrors.fullname = 'Full name is too long'
    }

    if (!formData.contactNumber.trim()) {
      newErrors.contactNumber = 'Contact number is required'
    } else {
      const digits = formData.contactNumber.replace(/\D/g, '')
      if (!/^(09|\+639)\d{9}$/.test(digits)) {
        newErrors.contactNumber =
          'Please enter a valid Philippine mobile number (e.g., 09123456789)'
      }
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    // Location validation - must have coordinates from map
    if (!selectedLocation || !selectedLocation.lat || !selectedLocation.lng) {
      newErrors.location = 'Please select your delivery location on the map'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target

    // Format phone number
    let formattedValue = value
    if (name === 'contactNumber') {
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

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  // Handle location selection from map
  const handleLocationSelect = (location) => {
    // Ensure coordinates are valid numbers
    const lat = Number(location.lat)
    const lng = Number(location.lng)

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
          console.error('Error getting address:', error)
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
        let errorMessage = 'Unable to get your location. '
        if (error.code === 1) {
          errorMessage += 'Please enable location access in your browser.'
        } else if (error.code === 2) {
          errorMessage += 'Location unavailable. Please try again.'
        } else if (error.code === 3) {
          errorMessage += 'Location request timed out. Please try again.'
        }
        alert(errorMessage)
        setIsGettingLocation(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    )
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSubmitting(true)

    try {
      const cleanedContact = formData.contactNumber.replace(/\D/g, '')

      // Get saved order from localStorage
      const savedOrder = localStorage.getItem('pendingOrder')
      let orderDetails = savedOrder ? JSON.parse(savedOrder) : null

      if (!orderDetails) {
        const selectedProducts = localStorage.getItem('selectedProducts')
        if (selectedProducts) {
          const products = JSON.parse(selectedProducts)
          const totalItems = products.reduce((sum, p) => sum + (p.quantity || 1), 0)
          const totalPrice = products.reduce(
            (sum, p) => sum + (p.quantity || 1) * (p.price || 0),
            0,
          )

          orderDetails = {
            products,
            totalPieces: totalItems,
            totalPricePerDelivery: totalPrice,
          }

          // Save as pending order
          localStorage.setItem('pendingOrder', JSON.stringify(orderDetails))
        } else {
          // No products found, redirect to order page
          navigate('/order')
          return
        }
      }

      // Prepare guest customer data with coordinates
      const guestData = {
        fullname: formData.fullname.trim(),
        contact: cleanedContact,
        email: formData.email.trim().toLowerCase(),
        address: selectedLocation.address || formData.address.trim(),
        latitude: Number(selectedLocation.lat),
        longitude: Number(selectedLocation.lng),
        isGuest: true,
        timestamp: new Date().toISOString(),
      }

      console.log('Guest data being saved:', guestData)
      console.log('Order details being saved:', orderDetails)

      // Save guest info
      localStorage.setItem('guestInfo', JSON.stringify(guestData))

      // Clear selected products as they're now in pendingOrder
      localStorage.removeItem('selectedProducts')

      // Navigate to checkout with both orderDetails AND guestInfo
      navigate('/checkout', {
        state: {
          orderDetails: orderDetails,
          guestInfo: guestData, // Make sure this is included
        },
      })
    } catch (error) {
      console.error('Error saving guest information:', error)
      setErrors({ submit: 'Failed to save information. Please try again.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleBack = () => {
    navigate(-1)
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
        onClick={handleBack}
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
              Guest Checkout
            </h1>
            <p className="text-base md:text-lg font-[titleFont]" style={{ color: '#9C4A15' }}>
              Enter your details and select delivery location
            </p>
          </div>

          {/* Info Card */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-[#9C4A15]/20">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-[#F5EFE7] flex items-center justify-center shrink-0">
                <FaUser className="w-5 h-5 text-[#9C4A15]" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#2A1803]">Quick & Easy</h2>
                <p className="text-[#9C4A15] text-sm">No account needed to place your order</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-start text-sm text-gray-600">
                <FaCheck className="w-4 h-4 text-green-500 mr-2 mt-0.5 shrink-0" />
                <span>Type your address or click on the map to set exact location</span>
              </div>
              <div className="flex items-start text-sm text-gray-600">
                <FaCheck className="w-4 h-4 text-green-500 mr-2 mt-0.5 shrink-0" />
                <span>Your information is secure and only used for this order</span>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="bg-white rounded-xl shadow-xl p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-[#2A1803] mb-2">
                  <div className="flex items-center gap-2">
                    <FaUser className="w-4 h-4 text-[#9C4A15]" />
                    <span>Full Name *</span>
                  </div>
                </label>
                <input
                  type="text"
                  name="fullname"
                  value={formData.fullname}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                  className={`w-full px-4 py-3 text-base rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-[#9C4A15] transition-all ${
                    errors.fullname ? 'border-red-500' : 'border-[#9C4A15]'
                  }`}
                  disabled={isSubmitting}
                />
                {errors.fullname && <p className="mt-1 text-sm text-red-600">{errors.fullname}</p>}
              </div>

              {/* Contact Number and Email */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-[#2A1803] mb-2">
                    <div className="flex items-center gap-2">
                      <FaPhone className="w-4 h-4 text-[#9C4A15]" />
                      <span>Contact Number *</span>
                    </div>
                  </label>
                  <input
                    type="tel"
                    name="contactNumber"
                    value={formData.contactNumber}
                    onChange={handleInputChange}
                    placeholder="0912-345-6789"
                    maxLength="13"
                    className={`w-full px-4 py-3 text-base rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-[#9C4A15] transition-all ${
                      errors.contactNumber ? 'border-red-500' : 'border-[#9C4A15]'
                    }`}
                    disabled={isSubmitting}
                  />
                  {errors.contactNumber && (
                    <p className="mt-1 text-sm text-red-600">{errors.contactNumber}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#2A1803] mb-2">
                    <div className="flex items-center gap-2">
                      <FaEnvelope className="w-4 h-4 text-[#9C4A15]" />
                      <span>Email Address *</span>
                    </div>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="your.email@example.com"
                    className={`w-full px-4 py-3 text-base rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-[#9C4A15] transition-all ${
                      errors.email ? 'border-red-500' : 'border-[#9C4A15]'
                    }`}
                    disabled={isSubmitting}
                  />
                  {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                </div>
              </div>

              {/* Address with Autocomplete */}
              <div>
                <label className="block text-sm font-medium text-[#2A1803] mb-2">
                  <div className="flex items-center gap-2">
                    <FaMapMarkerAlt className="w-4 h-4 text-[#9C4A15]" />
                    <span>Delivery Address *</span>
                  </div>
                </label>

                <AddressAutocomplete
                  value={formData.address}
                  onChange={handleInputChange}
                  onLocationSelect={handleLocationSelect}
                  disabled={isSubmitting}
                />

                {/* Coordinates display - with safe navigation */}
                {/* Coordinates display - expanded */}
                {selectedLocation?.lat && selectedLocation?.lng && (
                  <div className="mt-3 p-3 bg-[#F5EFE7] rounded-lg">
                    <div className="flex flex-wrap gap-4">
                      <p className="text-sm font-mono" style={{ color: '#2A1803' }}>
                        <span className="font-medium">Latitude:</span>{' '}
                        <span className="font-bold" style={{ color: '#9C4A15' }}>
                          {selectedLocation.lat} {/* Removed .toFixed(6) */}
                        </span>
                      </p>
                      <p className="text-sm font-mono" style={{ color: '#2A1803' }}>
                        <span className="font-medium">Longitude:</span>{' '}
                        <span className="font-bold" style={{ color: '#9C4A15' }}>
                          {selectedLocation.lng} {/* Removed .toFixed(6) */}
                        </span>
                      </p>
                    </div>
                  </div>
                )}

                {errors.location && <p className="mt-1 text-sm text-red-600">{errors.location}</p>}
              </div>

              {/* Submit Error */}
              {errors.submit && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-3 bg-red-50 border border-red-200 rounded-lg"
                >
                  <p className="text-red-600 text-sm">{errors.submit}</p>
                </motion.div>
              )}

              {/* Submit Button - with optional chaining */}
              <motion.button
                type="submit"
                disabled={isSubmitting || !selectedLocation?.lat || !selectedLocation?.lng}
                className={`w-full py-4 rounded-lg font-medium text-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#9C4A15] ${
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
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                    Processing...
                  </span>
                ) : (
                  'Proceed to Checkout'
                )}
              </motion.button>
            </form>
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

export default GuestInformation
