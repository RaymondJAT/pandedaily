import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FaUser, FaPhone, FaEnvelope, FaMapMarkerAlt, FaArrowLeft, FaCheck } from 'react-icons/fa'

const GuestInformation = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    fullname: '',
    contactNumber: '',
    email: '',
    address: '',
  })
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

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

  const validateForm = () => {
    const newErrors = {}

    if (!formData.fullname.trim()) {
      newErrors.fullname = 'Full name is required'
    }

    if (!formData.contactNumber.trim()) {
      newErrors.contactNumber = 'Contact number is required'
    } else if (!/^[0-9+\-\s()]{10,15}$/.test(formData.contactNumber.replace(/\s/g, ''))) {
      newErrors.contactNumber = 'Please enter a valid contact number'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required'
    } else if (formData.address.trim().length < 10) {
      newErrors.address = 'Address is too short (minimum 10 characters)'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSubmitting(true)

    try {
      // Save guest information to localStorage or context
      const guestInfo = {
        ...formData,
        isGuest: true,
        timestamp: new Date().toISOString(),
      }

      localStorage.setItem('guestInfo', JSON.stringify(guestInfo))

      // Navigate to checkout or menu page
      navigate('/checkout')
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

  return (
    <div className="max-h-screen bg-linear-to-b from-[#F5EFE7] to-white">
      {/* Header - Fixed */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={handleBack}
              className="flex items-center gap-1 sm:gap-2 text-[#9C4A15] hover:text-[#8a3f12] transition-colors p-1 sm:p-0"
            >
              <FaArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="font-medium text-sm sm:text-base">Back</span>
            </button>
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-[#2A1803] font-[titleFont] text-center">
              Guest Information
            </h1>
            <div className="w-6 sm:w-10"></div> {/* Spacer for alignment */}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto"
        >
          {/* Info Card */}
          <div className="bg-white rounded-lg sm:rounded-xl shadow-lg p-3 sm:p-4 md:p-6 mb-4 sm:mb-6 border border-[#9C4A15]/20">
            <div className="flex items-start gap-2 sm:gap-3 mb-3 sm:mb-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full bg-[#F5EFE7] flex items-center justify-center shrink-0">
                <FaUser className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-[#9C4A15]" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg md:text-xl font-bold text-[#2A1803] font-[titleFont]">
                  Enter Your Details
                </h2>
                <p className="text-[#9C4A15] text-xs sm:text-sm md:text-base mt-0.5 sm:mt-1">
                  We need your information to process your order
                </p>
              </div>
            </div>
            <div className="space-y-1 sm:space-y-2">
              <div className="flex items-start sm:items-center text-xs sm:text-sm text-gray-600">
                <FaCheck className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 mr-1.5 sm:mr-2 mt-0.5 sm:mt-0 shrink-0" />
                <span>Your information is only used for order processing</span>
              </div>
              <div className="flex items-start sm:items-center text-xs sm:text-sm text-gray-600">
                <FaCheck className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 mr-1.5 sm:mr-2 mt-0.5 sm:mt-0 shrink-0" />
                <span>We won't use your email for marketing without permission</span>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4 md:space-y-6">
            {/* Full Name */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-[#2A1803] mb-1 sm:mb-2">
                <div className="flex items-center gap-1 sm:gap-2">
                  <FaUser className="w-3 h-3 sm:w-4 sm:h-4 text-[#9C4A15]" />
                  <span>Full Name *</span>
                </div>
              </label>
              <input
                type="text"
                name="fullname"
                value={formData.fullname}
                onChange={handleInputChange}
                placeholder="Enter your full name"
                className={`w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#9C4A15] transition-all ${
                  errors.fullname ? 'border-red-500' : 'border-[#9C4A15]/30'
                }`}
                disabled={isSubmitting}
              />
              {errors.fullname && (
                <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.fullname}</p>
              )}
            </div>

            {/* Contact Number and Email - Responsive Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
              {/* Contact Number */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-[#2A1803] mb-1 sm:mb-2">
                  <div className="flex items-center gap-1 sm:gap-2">
                    <FaPhone className="w-3 h-3 sm:w-4 sm:h-4 text-[#9C4A15]" />
                    <span>Contact Number *</span>
                  </div>
                </label>
                <input
                  type="tel"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleInputChange}
                  placeholder="09123456789"
                  className={`w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#9C4A15] transition-all ${
                    errors.contactNumber ? 'border-red-500' : 'border-[#9C4A15]/30'
                  }`}
                  disabled={isSubmitting}
                />
                {errors.contactNumber && (
                  <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.contactNumber}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-[#2A1803] mb-1 sm:mb-2">
                  <div className="flex items-center gap-1 sm:gap-2">
                    <FaEnvelope className="w-3 h-3 sm:w-4 sm:h-4 text-[#9C4A15]" />
                    <span>Email Address *</span>
                  </div>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="your.email@example.com"
                  className={`w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#9C4A15] transition-all ${
                    errors.email ? 'border-red-500' : 'border-[#9C4A15]/30'
                  }`}
                  disabled={isSubmitting}
                />
                {errors.email && (
                  <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.email}</p>
                )}
                <p className="mt-1 text-xs sm:text-sm text-gray-600">
                  We'll send your order confirmation to this email
                </p>
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-[#2A1803] mb-1 sm:mb-2">
                <div className="flex items-center gap-1 sm:gap-2">
                  <FaMapMarkerAlt className="w-3 h-3 sm:w-4 sm:h-4 text-[#9C4A15]" />
                  <span>Delivery Address *</span>
                </div>
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Enter your complete address including street, barangay, city, and landmark"
                rows={2}
                className={`w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#9C4A15] transition-all ${
                  errors.address ? 'border-red-500' : 'border-[#9C4A15]/30'
                }`}
                disabled={isSubmitting}
              />
              {errors.address && (
                <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.address}</p>
              )}
              <p className="mt-1 text-xs sm:text-sm text-gray-600">
                Please provide detailed address for accurate delivery
              </p>
            </div>

            {/* Submit Error */}
            {errors.submit && (
              <div className="p-2 sm:p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-xs sm:text-sm">{errors.submit}</p>
              </div>
            )}

            {/* Action Buttons - Stacked on mobile, side by side on tablet+ */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 md:gap-4 pt-4 sm:pt-6">
              <button
                type="button"
                onClick={handleBack}
                className="w-full sm:flex-1 px-3 sm:px-4 md:px-6 py-2.5 sm:py-3 border border-[#9C4A15] sm:border-2 text-[#9C4A15] rounded-lg hover:bg-[#F5EFE7] transition-colors font-medium text-sm md:text-base"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="w-full sm:flex-1 px-3 sm:px-4 md:px-6 py-2.5 sm:py-3 bg-[#9C4A15] text-white rounded-lg hover:bg-[#8a3f12] transition-colors font-medium flex items-center justify-center gap-1.5 sm:gap-2 text-sm md:text-base"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <FaCheck className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                    <span>Continue to Order</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Privacy Note */}
          <div className="mt-4 sm:mt-6 p-2.5 sm:p-3 md:p-4 bg-[#F5EFE7] rounded-lg border border-[#9C4A15]/20">
            <p className="text-xs sm:text-sm text-[#2A1803] text-center">
              <span className="font-semibold">Privacy Note:</span> Your information is securely
              stored and only used for processing your current order. We value your privacy.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default GuestInformation
