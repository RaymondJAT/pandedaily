import { motion, AnimatePresence } from 'framer-motion'
import {
  FaUser,
  FaSignInAlt,
  FaChevronRight,
  FaCheck,
  FaTimes,
  FaMapMarkerAlt,
  FaTag,
  FaHistory,
} from 'react-icons/fa'
import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

const AuthChoiceModal = ({ isOpen, onClose }) => {
  const modalRef = useRef(null)
  const navigate = useNavigate()

  // Modal animation variants
  const modalBackdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  }

  const modalContentVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: { opacity: 1, scale: 1, y: 0 },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  }

  const handleClickOutside = (event) => {
    if (modalRef.current && !modalRef.current.contains(event.target)) {
      onClose()
    }
  }

  const handleEscapeKey = (event) => {
    if (event.key === 'Escape') {
      onClose()
    }
  }

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleEscapeKey)
      document.body.style.overflow = 'hidden'

      // Cleanup function
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
        document.removeEventListener('keydown', handleEscapeKey)
        document.body.style.overflow = 'unset'
      }
    }
  }, [isOpen, onClose])

  const handleGuestContinue = () => {
    onClose()
    navigate('/guest-info')
  }

  const handleLoginRegisterClick = () => {
    onClose()
    navigate('/login')
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={modalBackdropVariants}
            transition={{ duration: 0.2 }}
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
          >
            <div className="absolute inset-0" onClick={onClose} />

            {/* Modal Content */}
            <motion.div
              ref={modalRef}
              className="relative w-full max-w-md mx-auto"
              variants={modalContentVariants}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="modal-title"
            >
              {/* Modal Container */}
              <div
                className="rounded-xl md:rounded-2xl shadow-xl md:shadow-2xl overflow-hidden"
                style={{ backgroundColor: '#F5EFE7' }}
              >
                {/* Close Button */}
                <button
                  onClick={onClose}
                  className="absolute right-3 top-3 md:right-4 md:top-4 z-10 p-2 rounded-full hover:bg-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-[#9C4A15] focus:ring-offset-2"
                  style={{ color: '#2A1803' }}
                  aria-label="Close modal"
                >
                  <FaTimes className="w-4 h-4 md:w-5 md:h-5" />
                </button>

                {/* Header */}
                <div className="p-6 md:p-8 text-center border-b" style={{ borderColor: '#9C4A15' }}>
                  <motion.h2
                    id="modal-title"
                    className="text-xl md:text-2xl lg:text-3xl font-light mb-2 md:mb-3 font-[titleFont]"
                    style={{ color: '#2A1803' }}
                    variants={itemVariants}
                    transition={{ delay: 0.1 }}
                  >
                    How would you like to continue?
                  </motion.h2>
                  <motion.p
                    className="text-xs md:text-sm lg:text-base font-[titleFont]"
                    style={{ color: '#9C4A15' }}
                    variants={itemVariants}
                    transition={{ delay: 0.15 }}
                  >
                    Choose your preferred way to place your order
                  </motion.p>
                </div>

                {/* Options */}
                <div className="p-4 md:p-6 lg:p-8 space-y-4 md:space-y-6">
                  {/* Guest Option */}
                  <motion.button
                    onClick={handleGuestContinue}
                    className="w-full p-4 md:p-5 lg:p-6 rounded-lg md:rounded-xl border-2 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] group focus:outline-none focus:ring-2 focus:ring-[#9C4A15] focus:ring-offset-2 cursor-pointer"
                    style={{
                      backgroundColor: 'white',
                      borderColor: '#9C4A15',
                      color: '#2A1803',
                    }}
                    variants={itemVariants}
                    transition={{ delay: 0.2 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-start gap-3 md:gap-4 text-left">
                      <div
                        className="shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: '#F5EFE7' }}
                      >
                        <FaUser className="w-5 h-5 md:w-6 md:h-6" style={{ color: '#9C4A15' }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base md:text-lg font-semibold font-[titleFont] mb-1 md:mb-1.5 truncate">
                          Continue as Guest
                        </h3>
                        <p className="text-xs md:text-sm font-[titleFont] opacity-80 line-clamp-2">
                          Place your order without creating an account
                        </p>
                      </div>
                      <FaChevronRight
                        className="w-4 h-4 md:w-5 md:h-5 mt-0.5 md:mt-1 shrink-0 group-hover:translate-x-1 transition-transform"
                        style={{ color: '#9C4A15' }}
                      />
                    </div>
                  </motion.button>

                  {/* Login/Register Option */}
                  <motion.button
                    onClick={handleLoginRegisterClick}
                    className="w-full p-4 md:p-5 lg:p-6 rounded-lg md:rounded-xl border-2 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] group focus:outline-none focus:ring-2 focus:ring-[#9C4A15] focus:ring-offset-2 cursor-pointer"
                    style={{
                      backgroundColor: 'white',
                      borderColor: '#9C4A15',
                      color: '#2A1803',
                    }}
                    variants={itemVariants}
                    transition={{ delay: 0.25 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-start gap-3 md:gap-4 text-left">
                      <div
                        className="shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: '#9C4A15' }}
                      >
                        <FaSignInAlt
                          className="w-5 h-5 md:w-6 md:h-6"
                          style={{ color: '#F5EFE7' }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base md:text-lg font-semibold font-[titleFont] mb-1 md:mb-1.5 truncate">
                          Login or Register
                        </h3>
                        <p className="text-xs md:text-sm font-[titleFont] opacity-80 line-clamp-2">
                          Save your details for faster checkout and order tracking
                        </p>
                      </div>
                      <FaChevronRight
                        className="w-4 h-4 md:w-5 md:h-5 mt-0.5 md:mt-1 shrink-0 group-hover:translate-x-1 transition-transform"
                        style={{ color: '#9C4A15' }}
                      />
                    </div>
                  </motion.button>

                  {/* Benefits List */}
                  <motion.div
                    className="pt-4 md:pt-6 border-t"
                    style={{ borderColor: '#9C4A15' }}
                    variants={itemVariants}
                    transition={{ delay: 0.3 }}
                  >
                    <h4
                      className="text-sm md:text-base font-semibold font-[titleFont] mb-2 md:mb-3"
                      style={{ color: '#2A1803' }}
                    >
                      Benefits of creating an account:
                    </h4>
                    <ul className="space-y-2 md:space-y-3">
                      <li
                        className="flex items-center text-xs md:text-sm font-[titleFont]"
                        style={{ color: '#9C4A15' }}
                      >
                        <FaMapMarkerAlt
                          className="w-3 h-3 md:w-4 md:h-4 mr-2 shrink-0"
                          style={{ color: '#9C4A15' }}
                        />
                        <span className="truncate">Save delivery addresses</span>
                      </li>
                      <li
                        className="flex items-center text-xs md:text-sm font-[titleFont]"
                        style={{ color: '#9C4A15' }}
                      >
                        <FaTag
                          className="w-3 h-3 md:w-4 md:h-4 mr-2 shrink-0"
                          style={{ color: '#9C4A15' }}
                        />
                        <span className="truncate">Get exclusive discounts</span>
                      </li>
                      <li
                        className="flex items-center text-xs md:text-sm font-[titleFont]"
                        style={{ color: '#9C4A15' }}
                      >
                        <FaHistory
                          className="w-3 h-3 md:w-4 md:h-4 mr-2 shrink-0"
                          style={{ color: '#9C4A15' }}
                        />
                        <span className="truncate">View order history</span>
                      </li>
                      <li
                        className="flex items-center text-xs md:text-sm font-[titleFont]"
                        style={{ color: '#9C4A15' }}
                      >
                        <FaCheck
                          className="w-3 h-3 md:w-4 md:h-4 mr-2 shrink-0"
                          style={{ color: '#9C4A15' }}
                        />
                        <span className="truncate">Faster checkout next time</span>
                      </li>
                    </ul>
                  </motion.div>
                </div>
              </div>

              {/* Decorative Elements */}
              <div
                className="hidden md:block absolute -top-4 -left-4 w-8 h-8 rounded-full"
                style={{ backgroundColor: '#9C4A15', opacity: 0.2 }}
              ></div>
              <div
                className="hidden md:block absolute -bottom-4 -right-4 w-12 h-12 rounded-full"
                style={{ backgroundColor: '#9C4A15', opacity: 0.1 }}
              ></div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default AuthChoiceModal
