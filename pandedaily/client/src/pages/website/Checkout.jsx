import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  FiUser,
  FiPhone,
  FiMail,
  FiMapPin,
  FiCalendar,
  FiPackage,
  FiClock,
  FiEdit2,
  FiCheckCircle,
  FiArrowLeft,
  FiShoppingBag,
} from 'react-icons/fi'
import { useAuth } from '../../context/AuthContext'

const Checkout = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, isAuthenticated } = useAuth()

  // Delivery state
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDates, setSelectedDates] = useState([])
  const [currentMonth, setCurrentMonth] = useState([])
  const [deliverySchedule, setDeliverySchedule] = useState('morning')
  const [selectedTime, setSelectedTime] = useState('')
  const [specialInstructions, setSpecialInstructions] = useState('')

  // Order details from previous page
  const [orderDetails, setOrderDetails] = useState(null)

  // Customer info
  const [customerInfo, setCustomerInfo] = useState(null)

  // Maximum days selection
  const MAX_DAYS = 10
  const SCROLL_THRESHOLD = 7

  // Get today's date for comparison
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Time options based on schedule
  const morningTimes = [
    '06:30:00',
    '07:00:00',
    '07:30:00',
    '08:00:00',
    '08:30:00',
    '09:00:00',
    '09:30:00',
  ]

  const eveningTimes = [
    '15:00:00',
    '15:30:00',
    '16:00:00',
    '16:30:00',
    '17:00:00',
    '17:30:00',
    '18:00:00',
    '18:30:00',
  ]

  // Format time for display
  const formatTimeForDisplay = (time) => {
    if (!time) return ''
    const [hours, minutes] = time.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour > 12 ? hour - 12 : hour
    return `${displayHour}:${minutes} ${ampm}`
  }

  // Animation variants - exactly matching Order page
  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.7, ease: 'easeOut' },
  }

  const fadeIn = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.8, ease: 'easeOut' },
  }

  const staggerContainer = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const faqItem = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, ease: 'easeOut' },
  }

  // Load order details from navigation state or localStorage
  useEffect(() => {
    const orderFromState = location.state?.orderDetails

    if (orderFromState) {
      console.log('Order details from state:', orderFromState)
      setOrderDetails(orderFromState)
      localStorage.setItem('currentOrder', JSON.stringify(orderFromState))
    } else {
      const savedOrder = localStorage.getItem('pendingOrder')
      if (savedOrder) {
        console.log('Order details from localStorage:', JSON.parse(savedOrder))
        setOrderDetails(JSON.parse(savedOrder))
      } else {
        navigate('/order')
      }
    }
  }, [location.state, navigate])

  // Calendar functions
  useEffect(() => {
    generateMonthData()
  }, [currentDate])

  const generateMonthData = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = getDaysInMonth(year, month)

    const monthArray = []

    for (let i = 0; i < firstDay; i++) {
      monthArray.push(null)
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      monthArray.push({
        date,
        dayOfWeek: date.getDay(),
        dayName: getDayName(date.getDay()),
        isToday: date.toDateString() === new Date().toDateString(),
        isPast: date < today,
      })
    }

    setCurrentMonth(monthArray)
  }

  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate()
  }

  const getDayName = (dayIndex) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    return days[dayIndex]
  }

  const getMonthName = (month) => {
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ]
    return months[month]
  }

  const handleDateClick = (date) => {
    // Don't allow selecting past dates
    if (date < today) {
      alert('Cannot select past dates')
      return
    }

    const dateString = date.toDateString()
    let newSelectedDates

    if (selectedDates.includes(dateString)) {
      // Remove date if already selected
      newSelectedDates = selectedDates.filter((d) => d !== dateString)
    } else {
      // Check if maximum days reached
      if (selectedDates.length >= MAX_DAYS) {
        alert(`You can only select up to ${MAX_DAYS} delivery dates`)
        return
      }
      newSelectedDates = [...selectedDates, dateString]
    }

    setSelectedDates(newSelectedDates)
  }

  const handlePrevMonth = () => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    // Don't allow going to months before current month
    if (newDate.getMonth() < today.getMonth() && newDate.getFullYear() <= today.getFullYear()) {
      return
    }
    setCurrentDate(newDate)
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const handleSelectAllWeekdays = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const daysInMonth = getDaysInMonth(year, month)
    const newSelectedDates = []

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      // Only add future dates
      if (date >= today) {
        const dayOfWeek = date.getDay()
        if (dayOfWeek >= 1 && dayOfWeek <= 5) {
          if (newSelectedDates.length < MAX_DAYS) {
            newSelectedDates.push(date.toDateString())
          }
        }
      }
    }

    setSelectedDates(newSelectedDates)
    if (newSelectedDates.length >= MAX_DAYS) {
      alert(`Maximum ${MAX_DAYS} days selected`)
    }
  }

  const handleSelectAllWeekends = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const daysInMonth = getDaysInMonth(year, month)
    const newSelectedDates = []

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      // Only add future dates
      if (date >= today) {
        const dayOfWeek = date.getDay()
        if (dayOfWeek === 0 || dayOfWeek === 6) {
          if (newSelectedDates.length < MAX_DAYS) {
            newSelectedDates.push(date.toDateString())
          }
        }
      }
    }

    setSelectedDates(newSelectedDates)
    if (newSelectedDates.length >= MAX_DAYS) {
      alert(`Maximum ${MAX_DAYS} days selected`)
    }
  }

  const handleClearAll = () => {
    setSelectedDates([])
  }

  const handleScheduleChange = (schedule) => {
    setDeliverySchedule(schedule)
    setSelectedTime('')
  }

  const handleTimeSelect = (time) => {
    setSelectedTime(time)
  }

  const isDateSelected = (date) => {
    return selectedDates.includes(date.toDateString())
  }

  const getDateStyle = (date, isToday, isPast) => {
    const isSelected = isDateSelected(date)

    if (isPast) {
      return 'bg-gray-100 text-gray-400 cursor-not-allowed'
    }

    if (isSelected) {
      if (isToday) {
        return 'bg-gradient-to-br from-[#9C4A15] to-[#7a3a12] text-white shadow-sm'
      }
      return 'bg-gradient-to-br from-[#F5EFE7] to-[#e8dfd2] text-[#2A1803] border border-[#9C4A15]'
    }

    if (isToday) {
      return 'bg-[#F5EFE7] text-[#2A1803] border border-[#9C4A15]'
    }

    return 'bg-white hover:bg-[#F5EFE7] text-[#2A1803] hover:text-[#9C4A15]'
  }

  // Extract customer information from user object
  useEffect(() => {
    if (user) {
      const customerData = {
        c_fullname:
          user.c_fullname || user.fullname || user.name || user.username || 'Not provided',
        c_contact:
          user.c_contact ||
          user.contact ||
          user.phone ||
          user.phoneNumber ||
          user.mobile ||
          'Not provided',
        c_email: user.c_email || user.email || 'Not provided',
        c_address: user.c_address || user.address || user.delivery_address || 'Not provided',
        c_id: user.c_id || user.id || user._id || user.user_id || null,
        rawUser: user,
      }
      setCustomerInfo(customerData)
    }
  }, [user])

  // Format date for display
  const formatDateDisplay = (dateStr) => {
    const date = new Date(dateStr)
    return `${getDayName(date.getDay())}, ${getMonthName(date.getMonth())} ${date.getDate()}`
  }

  // Calculate totals
  const getTotalItems = () => {
    if (!orderDetails?.products) return 0
    return orderDetails.products.reduce((sum, product) => sum + product.quantity, 0)
  }

  const getTotalPricePerDelivery = () => {
    if (!orderDetails?.products) return 0
    return orderDetails.products.reduce((sum, product) => {
      // Ensure price is treated as a number
      const price = typeof product.price === 'string' ? parseFloat(product.price) : product.price
      return sum + product.quantity * price
    }, 0)
  }

  const getTotalPrice = () => {
    return getTotalPricePerDelivery() * selectedDates.length
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  // Helper function to format price display
  const formatPrice = (price) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price
    return numPrice.toFixed(2)
  }

  const handleProceedToPayment = () => {
    // Validation
    if (selectedDates.length === 0) {
      alert('Please select at least one delivery date')
      return
    }

    if (!selectedTime) {
      alert('Please select a delivery time')
      return
    }

    // Prepare checkout details to pass to payment page
    const checkoutDetails = {
      products: orderDetails.products,
      dates: selectedDates,
      schedule: deliverySchedule,
      selectedTime: selectedTime,
      instructions: specialInstructions,
      totalPieces: getTotalItems(),
      totalPricePerDelivery: getTotalPricePerDelivery(),
      totalPrice: getTotalPrice(),
      customerInfo: customerInfo,
    }

    // Store in localStorage as backup
    localStorage.setItem('checkoutDetails', JSON.stringify(checkoutDetails))

    // Navigate to payment page
    navigate('/order/payment', {
      state: {
        checkoutDetails: checkoutDetails,
      },
    })
  }

  const handleBack = () => {
    navigate(-1)
  }

  const handleEditProducts = () => {
    navigate('/order')
  }

  const currentTimeOptions = deliverySchedule === 'morning' ? morningTimes : eveningTimes

  // Show loading state
  if (!orderDetails || !user) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: '#F5EFE7' }}
      >
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#9C4A15] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p style={{ color: '#2A1803' }}>Loading checkout...</p>
        </div>
      </div>
    )
  }

  if (!customerInfo) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: '#F5EFE7' }}
      >
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#9C4A15] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p style={{ color: '#2A1803' }}>Preparing customer information...</p>
        </div>
      </div>
    )
  }

  return (
    <section
      className="min-h-screen py-8 md:py-12 font-[titleFont]"
      style={{ backgroundColor: '#F5EFE7' }}
    >
      <div className="container mx-auto px-4">
        {/* Header Section - exactly like Order page */}
        <motion.div
          className="text-center mb-8 md:mb-12"
          initial="initial"
          animate="animate"
          variants={fadeInUp}
        >
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-[#9C4A15] hover:text-[#8a3f12] transition-colors"
            >
              <FiArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back</span>
            </button>
            <h1
              className="text-2xl md:text-3xl lg:text-4xl font-light font-[titleFont]"
              style={{ color: '#2A1803' }}
            >
              Checkout
            </h1>
            <div className="w-20"></div>
          </div>
          <div className="h-1 w-32 mx-auto" style={{ backgroundColor: '#9C4A15' }}></div>
        </motion.div>

        <motion.div
          className="mx-auto"
          initial="initial"
          animate="animate"
          variants={staggerContainer}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10">
            {/* LEFT COLUMN - Calendar Section */}
            <div className="flex flex-col">
              {/* Calendar Section with fixed height */}
              <motion.div
                className="flex flex-col h-full"
                variants={faqItem}
                transition={{ delay: 0.15 }}
              >
                <h2
                  className="text-xl md:text-2xl font-light mb-6 font-[titleFont]"
                  style={{ color: '#2A1803' }}
                >
                  <div className="flex items-center gap-3">
                    <FiCalendar className="text-[#9C4A15]" />
                    Select Delivery Dates
                  </div>
                </h2>

                <div className="bg-white rounded-xl shadow-lg p-6 md:p-7 flex-1 flex flex-col h-full">
                  {/* Month Navigation with modern style */}
                  <div className="flex items-center justify-between mb-8 shrink-0">
                    <button
                      onClick={handlePrevMonth}
                      className="w-10 h-10 flex items-center justify-center rounded-lg bg-[#F5EFE7] hover:bg-[#e8dfd2] transition-colors text-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ color: '#9C4A15' }}
                      disabled={
                        currentDate.getMonth() <= today.getMonth() &&
                        currentDate.getFullYear() <= today.getFullYear()
                      }
                    >
                      ←
                    </button>
                    <h3
                      className="text-xl font-medium font-[titleFont]"
                      style={{ color: '#2A1803' }}
                    >
                      {getMonthName(currentDate.getMonth())} {currentDate.getFullYear()}
                    </h3>
                    <button
                      onClick={handleNextMonth}
                      className="w-10 h-10 flex items-center justify-center rounded-lg bg-[#F5EFE7] hover:bg-[#e8dfd2] transition-colors text-lg cursor-pointer"
                      style={{ color: '#9C4A15' }}
                    >
                      →
                    </button>
                  </div>

                  {/* Day headers with modern style */}
                  <div className="grid grid-cols-7 gap-2 mb-4 shrink-0">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                      <div
                        key={index}
                        className="text-center py-2 text-sm font-medium font-[titleFont]"
                        style={{ color: '#9C4A15' }}
                      >
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Calendar Grid - Modern style */}
                  <div className="grid grid-cols-7 gap-2 mb-6 shrink-0">
                    {currentMonth.map((dayData, index) => {
                      if (!dayData) {
                        return <div key={index} className="aspect-square"></div>
                      }

                      const { date, isToday, isPast } = dayData
                      const isSelected = isDateSelected(date)

                      return (
                        <button
                          key={index}
                          onClick={() => !isPast && handleDateClick(date)}
                          disabled={isPast}
                          className={`
                aspect-square flex flex-col items-center justify-center rounded-xl 
                transition-all duration-200 cursor-pointer font-[titleFont]
                ${isPast ? 'bg-gray-50 text-gray-300 cursor-not-allowed' : ''}
                ${!isPast && !isSelected ? 'hover:bg-[#F5EFE7] hover:text-[#9C4A15]' : ''}
                ${isSelected ? 'bg-[#9C4A15] text-white shadow-md' : 'bg-white text-[#2A1803]'}
                ${isToday && !isSelected ? 'ring-2 ring-[#9C4A15] ring-offset-2' : ''}
              `}
                        >
                          <span className="text-base font-medium">{date.getDate()}</span>
                          {isSelected && (
                            <span className="text-xs mt-0.5 opacity-90">Selected</span>
                          )}
                        </button>
                      )
                    })}
                  </div>

                  {/* Quick Actions - Modern pill style */}
                  <div className="flex flex-wrap gap-3 mb-6 shrink-0">
                    <button
                      onClick={handleSelectAllWeekdays}
                      className="px-5 py-2.5 rounded-full font-[titleFont] text-sm cursor-pointer transition-all duration-200 hover:shadow-md"
                      style={{
                        backgroundColor: '#F5EFE7',
                        color: '#2A1803',
                      }}
                    >
                      Weekdays
                    </button>
                    <button
                      onClick={handleSelectAllWeekends}
                      className="px-5 py-2.5 rounded-full font-[titleFont] text-sm cursor-pointer transition-all duration-200 hover:shadow-md"
                      style={{
                        backgroundColor: '#F5EFE7',
                        color: '#2A1803',
                      }}
                    >
                      Weekends
                    </button>
                    <button
                      onClick={handleClearAll}
                      className="px-5 py-2.5 rounded-full font-[titleFont] text-sm cursor-pointer transition-all duration-200 hover:shadow-md"
                      style={{
                        backgroundColor: '#F5EFE7',
                        color: '#2A1803',
                      }}
                    >
                      Clear All
                    </button>
                  </div>

                  {/* Selected Dates Preview - Scrollable with fixed height */}
                  <div className="flex-1 overflow-hidden flex flex-col min-h-0">
                    <div
                      className="mt-4 pt-6 border-t-2 shrink-0"
                      style={{ borderColor: '#F5EFE7' }}
                    >
                      <div className="flex justify-between items-center mb-4">
                        <h3
                          className="font-semibold font-[titleFont] text-lg"
                          style={{ color: '#2A1803' }}
                        >
                          Selected Delivery Dates
                        </h3>
                        <div className="flex items-center gap-2">
                          <span
                            className="text-sm font-[titleFont] px-4 py-1.5 rounded-full"
                            style={{ backgroundColor: '#F5EFE7', color: '#9C4A15' }}
                          >
                            {selectedDates.length} / {MAX_DAYS} days
                          </span>
                        </div>
                      </div>
                    </div>

                    {selectedDates.length === 0 ? (
                      <div
                        className="flex-1 flex items-center justify-center py-8 text-center"
                        style={{ color: '#9C4A15' }}
                      >
                        <div>
                          <svg
                            className="w-16 h-16 mb-4 opacity-30 mx-auto"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.5}
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          <p className="font-[titleFont] text-base">No dates selected yet</p>
                          <p className="text-sm mt-2 opacity-70">
                            Click on dates above to add delivery dates
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div
                        className={`${
                          selectedDates.length >= SCROLL_THRESHOLD
                            ? 'overflow-y-auto pr-2 custom-scrollbar'
                            : ''
                        } min-h-0`}
                        style={{
                          maxHeight: selectedDates.length >= SCROLL_THRESHOLD ? '240px' : 'none',
                        }}
                      >
                        <div className="grid grid-cols-2 gap-3">
                          {selectedDates.map((dateStr, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-3 rounded-xl transition-all duration-200 hover:shadow-md"
                              style={{
                                backgroundColor: '#F5EFE7',
                              }}
                            >
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-10 h-10 flex flex-col items-center justify-center rounded-lg"
                                  style={{ backgroundColor: '#9C4A15', color: '#F5EFE7' }}
                                >
                                  <span className="text-[10px] font-medium">
                                    {new Date(dateStr).toLocaleString('default', {
                                      month: 'short',
                                    })}
                                  </span>
                                  <span className="text-sm font-bold leading-tight">
                                    {new Date(dateStr).getDate()}
                                  </span>
                                </div>
                                <div>
                                  <span
                                    className="font-medium font-[titleFont] text-xs block"
                                    style={{ color: '#2A1803' }}
                                  >
                                    {formatDateDisplay(dateStr).substring(0, 6)}...
                                  </span>
                                  <span
                                    className="text-[10px] font-[titleFont] block mt-0.5"
                                    style={{ color: '#9C4A15' }}
                                  >
                                    {getDayName(new Date(dateStr).getDay())}
                                  </span>
                                </div>
                              </div>
                              <div className="text-right">
                                <span
                                  className="text-[10px] font-[titleFont] font-medium px-2 py-1 rounded-lg whitespace-nowrap"
                                  style={{
                                    backgroundColor: 'rgba(156, 74, 21, 0.1)',
                                    color: '#9C4A15',
                                  }}
                                >
                                  {selectedTime
                                    ? formatTimeForDisplay(selectedTime)
                                    : 'Select time'}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>

            {/* RIGHT COLUMN - Delivery Configuration and Selected Products */}
            <div className="flex flex-col space-y-8">
              {/* Delivery Configuration */}
              <motion.div className="flex flex-col" variants={faqItem} transition={{ delay: 0.1 }}>
                <h2
                  className="text-xl md:text-2xl font-light mb-6 font-[titleFont]"
                  style={{ color: '#2A1803' }}
                >
                  <div className="flex items-center gap-3">
                    <FiClock className="text-[#9C4A15]" />
                    Delivery Configuration
                  </div>
                </h2>

                <div className="bg-white rounded-xl shadow-lg p-6 md:p-7">
                  {/* Schedule Selection */}
                  <h3
                    className="text-lg font-medium mb-4 font-[titleFont]"
                    style={{ color: '#9C4A15' }}
                  >
                    Choose Delivery Schedule
                  </h3>
                  <div className="flex gap-4 mb-6">
                    <button
                      onClick={() => handleScheduleChange('morning')}
                      className={`flex-1 py-4 rounded-lg border-2 transition-all duration-200 font-[titleFont] text-base cursor-pointer ${
                        deliverySchedule === 'morning'
                          ? 'border-[#9C4A15] bg-[#F5EFE7]'
                          : 'border-gray-200 hover:border-[#9C4A15]'
                      }`}
                      style={{ color: '#2A1803' }}
                    >
                      <div className="font-medium">Morning</div>
                      <div className="text-sm mt-1" style={{ color: '#9C4A15' }}>
                        6:30 AM - 9:30 AM
                      </div>
                    </button>
                    <button
                      onClick={() => handleScheduleChange('evening')}
                      className={`flex-1 py-4 rounded-lg border-2 transition-all duration-200 font-[titleFont] text-base cursor-pointer ${
                        deliverySchedule === 'evening'
                          ? 'border-[#9C4A15] bg-[#F5EFE7]'
                          : 'border-gray-200 hover:border-[#9C4A15]'
                      }`}
                      style={{ color: '#2A1803' }}
                    >
                      <div className="font-medium">Evening</div>
                      <div className="text-sm mt-1" style={{ color: '#9C4A15' }}>
                        3:00 PM - 6:30 PM
                      </div>
                    </button>
                  </div>

                  {/* Time Selection */}
                  <h3
                    className="text-lg font-medium mb-4 font-[titleFont]"
                    style={{ color: '#9C4A15' }}
                  >
                    Select Delivery Time
                  </h3>
                  <div className="grid grid-cols-4 gap-2 mb-6">
                    {currentTimeOptions.map((time) => (
                      <button
                        key={time}
                        onClick={() => handleTimeSelect(time)}
                        className={`py-3 rounded-lg transition-all duration-200 font-[titleFont] text-sm cursor-pointer ${
                          selectedTime === time
                            ? 'bg-[#9C4A15] text-white'
                            : 'bg-[#F5EFE7] text-[#2A1803] hover:bg-[#e8dfd2]'
                        }`}
                      >
                        {formatTimeForDisplay(time)}
                      </button>
                    ))}
                  </div>

                  {/* Special Instructions */}
                  <h3
                    className="text-lg font-medium mb-4 mt-8 font-[titleFont]"
                    style={{ color: '#9C4A15' }}
                  >
                    Special Instructions
                  </h3>
                  <textarea
                    value={specialInstructions}
                    onChange={(e) => setSpecialInstructions(e.target.value)}
                    placeholder="Any special requests or notes for delivery..."
                    className="w-full h-28 px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-[#9C4A15] focus:outline-none focus:ring-2 focus:ring-[#9C4A15] font-[titleFont] text-sm resize-none"
                    style={{ color: '#2A1803' }}
                  />
                </div>
              </motion.div>

              {/* Selected Products Section - with fixed height and scrollable */}
              <motion.div className="flex flex-col" variants={faqItem} transition={{ delay: 0.2 }}>
                <h2
                  className="text-xl md:text-2xl font-light mb-6 font-[titleFont]"
                  style={{ color: '#2A1803' }}
                >
                  <div className="flex items-center gap-3">
                    <FiShoppingBag className="text-[#9C4A15]" />
                    Selected Products
                  </div>
                </h2>

                <div className="bg-white rounded-xl shadow-lg p-6 md:p-7 flex flex-col h-100">
                  {/* Products List - Scrollable */}
                  {orderDetails.products.length > 0 && (
                    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                      <div className="space-y-4">
                        {orderDetails.products.map((product) => {
                          // Ensure price is a number for display
                          const price =
                            typeof product.price === 'string'
                              ? parseFloat(product.price)
                              : product.price
                          return (
                            <div
                              key={product.id}
                              className="flex justify-between items-center pb-4 border-b last:border-0"
                              style={{ borderColor: '#F5EFE7' }}
                            >
                              <div className="flex items-start gap-3">
                                <div
                                  className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold shrink-0"
                                  style={{ backgroundColor: '#F5EFE7', color: '#9C4A15' }}
                                >
                                  {product.quantity}x
                                </div>
                                <div>
                                  <h4
                                    className="font-medium font-[titleFont] text-sm"
                                    style={{ color: '#2A1803' }}
                                  >
                                    {product.name}
                                  </h4>
                                  <p
                                    className="text-xs font-[titleFont] mt-1"
                                    style={{ color: '#9C4A15' }}
                                  >
                                    ₱{formatPrice(price)} per piece
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <span
                                  className="font-bold font-[titleFont] text-sm"
                                  style={{ color: '#9C4A15' }}
                                >
                                  {formatCurrency(product.quantity * price)}
                                </span>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* Subtotal - Fixed at bottom */}
                  <div className="mt-4 pt-4 border-t shrink-0" style={{ borderColor: '#F5EFE7' }}>
                    <div className="flex justify-between items-center">
                      <span
                        className="font-bold font-[titleFont] text-base"
                        style={{ color: '#2A1803' }}
                      >
                        Subtotal per delivery
                      </span>
                      <span
                        className="font-bold font-[titleFont] text-lg"
                        style={{ color: '#9C4A15' }}
                      >
                        {formatCurrency(getTotalPricePerDelivery())}
                      </span>
                    </div>
                    <p
                      className="text-xs font-[titleFont] mt-1 text-right"
                      style={{ color: '#9C4A15' }}
                    >
                      Total items: {getTotalItems()}
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Action Button - Moved outside the grid for better placement */}
        <motion.div className="mt-8" variants={faqItem} transition={{ delay: 0.25 }}>
          <div className="flex justify-end">
            <motion.button
              onClick={handleProceedToPayment}
              disabled={selectedDates.length === 0 || !selectedTime}
              className={`px-12 py-4 rounded-full font-bold font-[titleFont] text-base transition-all duration-200 shadow-lg cursor-pointer ${
                selectedDates.length === 0 || !selectedTime ? 'opacity-70 cursor-not-allowed' : ''
              }`}
              style={{
                backgroundColor: selectedDates.length > 0 && selectedTime ? '#9C4A15' : '#9CA3AF',
                color: '#F5EFE7',
              }}
              whileHover={selectedDates.length > 0 && selectedTime ? { scale: 1.02 } : {}}
              whileTap={selectedDates.length > 0 && selectedTime ? { scale: 0.98 } : {}}
            >
              {selectedDates.length === 0
                ? 'Select Delivery Dates'
                : !selectedTime
                  ? 'Select Delivery Time'
                  : `Proceed to Payment`}
            </motion.button>
          </div>

          {/* Show user status message */}
          {isAuthenticated && user && (
            <p className="text-center mt-3 font-[titleFont] text-sm" style={{ color: '#2A1803' }}>
              Ordering as:{' '}
              <span style={{ color: '#9C4A15', fontWeight: '600' }}>
                {user.fullname || user.c_fullname}
              </span>
            </p>
          )}

          <p className="text-center mt-3 font-[titleFont] text-sm" style={{ color: '#9C4A15' }}>
            Free delivery on all subscriptions
          </p>
        </motion.div>

        {/* Footer Note */}
        <motion.div className="text-center mt-12" variants={faqItem} transition={{ delay: 0.3 }}>
          <div className="h-1 w-32 mx-auto mb-4" style={{ backgroundColor: '#9C4A15' }}></div>
          <p className="text-lg md:text-xl font-[titleFont]" style={{ color: '#2A1803' }}>
            Need more help? Contact us at{' '}
            <a
              href="mailto:customerservice@pandedaily.com"
              className="font-medium hover:underline"
              style={{ color: '#9C4A15' }}
            >
              customerservice@pandedaily.com
            </a>
          </p>
          <p className="text-sm font-[titleFont] mt-2" style={{ color: '#9C4A15' }}>
            Free delivery on all subscriptions • Zero preservatives • Hand-kneaded daily
          </p>
        </motion.div>
      </div>

      {/* Add custom scrollbar styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f5efe7;
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #9c4a15;
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #7a3a12;
        }
      `}</style>
    </section>
  )
}

export default Checkout
