import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { FaArrowLeft, FaUser, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa'
import { useAuth } from '../../context/AuthContext'
import { loginUser } from '../../services/api'

const Login = () => {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({ username: '', password: '' })
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [apiError, setApiError] = useState('')

  // Validate form before sending
  const validateForm = () => {
    const newErrors = {}
    if (!formData.username.trim()) newErrors.username = 'Username is required'
    if (!formData.password) newErrors.password = 'Password is required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Input change handler
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }))
    if (apiError) setApiError('')
  }

  // Form submit handler
  const handleSubmit = async (e) => {
    e.preventDefault()
    setApiError('')

    if (!validateForm()) return

    setIsSubmitting(true)
    try {
      const response = await loginUser(formData.username, formData.password)

      // Update auth context
      login({
        ...response.user,
        token: response.token,

        type: response.user.user_type,
      })

      if (response.user.user_type === 'admin') {
        navigate('/dashboard')
      } else if (response.user.user_type === 'customer') {
        navigate('/order')
      } else {
        navigate('/')
      }
    } catch (err) {
      setApiError(err.message || 'Login failed. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Go to signup
  const goToSignup = () => navigate('/signup')

  // Animation variants
  const pageVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, transition: { duration: 0.2 } },
  }
  const formVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
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
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 md:top-6 md:left-6 flex items-center gap-2 p-2 md:p-3 rounded-lg hover:bg-white/50 transition-colors focus:outline-none focus:ring-2 focus:ring-[#9C4A15]"
          style={{ color: '#2A1803' }}
        >
          <FaArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
          <span className="text-sm md:text-base font-[titleFont]">Back</span>
        </button>

        {/* Form Container */}
        <motion.div className="w-full max-w-md mx-auto" variants={formVariants}>
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
                Welcome Back
              </h1>
              <p className="text-sm md:text-base font-[titleFont]" style={{ color: '#9C4A15' }}>
                Sign in to your account
              </p>
            </div>

            {/* Form */}
            <div className="p-6 md:p-8">
              {apiError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg"
                >
                  <p className="text-red-600 text-sm font-[titleFont]">{apiError}</p>
                </motion.div>
              )}

              <form onSubmit={handleSubmit}>
                {/* Username */}
                <div className="mb-6">
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
                      placeholder="Enter your username"
                    />
                  </div>
                  {errors.username && (
                    <p className="text-red-500 text-xs mt-1 font-[titleFont]">{errors.username}</p>
                  )}
                </div>

                {/* Password */}
                <div className="mb-6">
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
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 focus:outline-none focus:ring-2 focus:ring-[#9C4A15] rounded-full p-1 cursor-pointer"
                      style={{ color: '#9C4A15' }}
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-red-500 text-xs mt-1 font-[titleFont]">{errors.password}</p>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full py-3 md:py-4 rounded-lg font-medium font-[titleFont] transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#9C4A15] cursor-pointer ${
                    isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                  style={{ backgroundColor: '#9C4A15', color: '#F5EFE7' }}
                >
                  {isSubmitting ? 'Signing In...' : 'Sign In'}
                </button>
              </form>
            </div>

            {/* Footer */}
            <div
              className="px-6 py-4 text-center border-t"
              style={{ borderColor: '#9C4A15', backgroundColor: '#F5EFE7' }}
            >
              <p className="text-xs font-[titleFont]" style={{ color: '#9C4A15' }}>
                Don't have an account?{' '}
                <button onClick={goToSignup} className="font-medium underline hover:text-[#2A1803]">
                  Sign Up
                </button>
              </p>
            </div>
          </div>

          {/* Guest Option */}
          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/order')}
              className="text-sm font-[titleFont] hover:underline"
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
