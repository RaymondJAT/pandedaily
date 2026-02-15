import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import AuthChoiceModal from '../../components/website modal/AuthChoiceModal'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { createOrder } from '../../services/api'

const Order = () => {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDates, setSelectedDates] = useState([])
  const [currentMonth, setCurrentMonth] = useState([])
  const [deliverySchedule, setDeliverySchedule] = useState('morning')
  const [selectedTime, setSelectedTime] = useState('') // New state for selected time
  const [quantity, setQuantity] = useState(20)
  const [customQuantity, setCustomQuantity] = useState('')
  const [specialInstructions, setSpecialInstructions] = useState('')
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [orderError, setOrderError] = useState('')

  // Get user authentication status
  const { user, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    console.log('Order page - User object:', user)
    if (user) {
      console.log('User properties in Order page:', Object.keys(user))
    }
  }, [user])

  // Price configuration
  const PANDESAL_PRICE_PER_PIECE = 15
  const PRODUCT_ID = 1 // Assuming pandesal product ID is 1

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
    const [hours, minutes] = time.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour > 12 ? hour - 12 : hour
    return `${displayHour}:${minutes} ${ampm}`
  }

  // Animation variants
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

  // Initialize calendar without selecting today
  useEffect(() => {
    generateMonthData()
  }, [currentDate])

  const generateMonthData = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = getDaysInMonth(year, month)

    const monthArray = []

    // Add empty cells for alignment
    for (let i = 0; i < firstDay; i++) {
      monthArray.push(null)
    }

    // Add actual days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      monthArray.push({
        date,
        dayOfWeek: date.getDay(),
        dayName: getDayName(date.getDay()),
        isToday: date.toDateString() === new Date().toDateString(),
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
    const dateString = date.toDateString()
    let newSelectedDates

    if (selectedDates.includes(dateString)) {
      newSelectedDates = selectedDates.filter((d) => d !== dateString)
    } else {
      newSelectedDates = [...selectedDates, dateString]
    }

    setSelectedDates(newSelectedDates)
  }

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const handleToday = () => {
    setCurrentDate(new Date())
  }

  const handleSelectAllWeekdays = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const daysInMonth = getDaysInMonth(year, month)
    const newSelectedDates = []

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      const dayOfWeek = date.getDay()
      if (dayOfWeek >= 1 && dayOfWeek <= 5) {
        newSelectedDates.push(date.toDateString())
      }
    }

    setSelectedDates(newSelectedDates)
  }

  const handleSelectAllWeekends = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const daysInMonth = getDaysInMonth(year, month)
    const newSelectedDates = []

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      const dayOfWeek = date.getDay()
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        newSelectedDates.push(date.toDateString())
      }
    }

    setSelectedDates(newSelectedDates)
  }

  const handleClearAll = () => {
    setSelectedDates([])
  }

  const handleQuantityChange = (value) => {
    setQuantity(value)
    if (value !== 'custom') {
      setCustomQuantity('')
    }
  }

  const handleScheduleChange = (schedule) => {
    setDeliverySchedule(schedule)
    setSelectedTime('') // Reset selected time when schedule changes
  }

  const handleTimeSelect = (time) => {
    setSelectedTime(time)
  }

  const isDateSelected = (date) => {
    return selectedDates.includes(date.toDateString())
  }

  const getDateStyle = (date, isToday) => {
    const isSelected = isDateSelected(date)

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

  const getFinalQuantity = () => {
    if (quantity === 'custom') {
      return parseInt(customQuantity) || 0
    }
    return quantity
  }

  const getTotalPandesal = () => {
    return selectedDates.length * getFinalQuantity()
  }

  const getTotalPrice = () => {
    const totalPieces = getTotalPandesal()
    return totalPieces * PANDESAL_PRICE_PER_PIECE
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  const formatDateDisplay = (dateStr) => {
    const date = new Date(dateStr)
    return `${getDayName(date.getDay())}, ${getMonthName(date.getMonth())} ${date.getDate()}`
  }

  const formatDateForAPI = (dateStr) => {
    const date = new Date(dateStr)
    return date.toISOString().split('T')[0] // Returns YYYY-MM-DD format
  }

  const getDeliveryTimeSlots = () => {
    if (!selectedTime) return null

    // For morning delivery, end time is 2.5 hours after start time
    // For evening delivery, end time is 3 hours after start time
    const startHour = parseInt(selectedTime.split(':')[0])
    const startMinute = parseInt(selectedTime.split(':')[1])

    let endHour, endMinute

    if (deliverySchedule === 'morning') {
      // Add 2.5 hours for morning deliveries
      endHour = startHour + 2
      endMinute = startMinute + 30
      if (endMinute >= 60) {
        endHour += 1
        endMinute -= 60
      }
    } else {
      // Add 3 hours for evening deliveries
      endHour = startHour + 3
      endMinute = startMinute
      if (endHour >= 24) {
        endHour = 23
        endMinute = 59
      }
    }

    const endTimeFormatted = `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}:00`

    return {
      start_time: selectedTime,
      end_time: endTimeFormatted,
      cutoff: '23:59:59', // Cutoff at midnight before delivery day
    }
  }

  const handleSubmitOrder = () => {
    // Reset any previous errors
    setOrderError('')

    // Validation
    if (selectedDates.length === 0) {
      alert('Please select at least one delivery date')
      return
    }

    if (!selectedTime) {
      alert('Please select a delivery time')
      return
    }

    if (quantity === 'custom' && (!customQuantity || parseInt(customQuantity) < 20)) {
      alert('Please enter a valid quantity (minimum 20 pieces)')
      return
    }

    // Check if user is already logged in
    if (isAuthenticated && user) {
      // User is logged in, prepare order details and go to confirmation
      console.log('User is logged in, preparing order details...')

      const finalQuantity = getFinalQuantity()
      const timeSlots = getDeliveryTimeSlots()

      // Prepare order details to pass to confirmation page
      const orderDetails = {
        dates: selectedDates,
        schedule: deliverySchedule,
        selectedTime: selectedTime,
        timeSlots: timeSlots,
        quantity: finalQuantity,
        instructions: specialInstructions,
        totalPieces: getTotalPandesal(),
        totalPrice: getTotalPrice(),
        pricePerPiece: PANDESAL_PRICE_PER_PIECE,
        customerId: user.id,
        customerName: user.fullname || user.c_fullname,
      }

      // Store in localStorage as backup
      localStorage.setItem('pendingOrder', JSON.stringify(orderDetails))

      // Navigate to order confirmation page with state
      navigate('/checkout', {
        state: {
          orderDetails: orderDetails,
          totalAmount: getTotalPrice(),
        },
      })
    } else {
      // User is not logged in, show auth modal
      console.log('User is not logged in, showing auth modal...')
      setShowAuthModal(true)
    }
  }

  const handleGuestContinue = () => {
    // For now, since customer_id is required, we'll redirect to login
    alert('Please login or register to place an order')
    setShowAuthModal(false)
    navigate('/login', {
      state: {
        fromOrder: true,
        message: 'Please login or register to place your order',
      },
    })
  }

  const handleLoginRegister = () => {
    // Save order details temporarily before redirecting to login
    const tempOrder = {
      dates: selectedDates,
      schedule: deliverySchedule,
      selectedTime: selectedTime,
      quantity: getFinalQuantity(),
      instructions: specialInstructions,
      totalPieces: getTotalPandesal(),
      totalPrice: getTotalPrice(),
      pricePerPiece: PANDESAL_PRICE_PER_PIECE,
    }

    localStorage.setItem('pendingOrder', JSON.stringify(tempOrder))
    setShowAuthModal(false)

    // Redirect to login page
    navigate('/login', {
      state: {
        fromOrder: true,
        message: 'Please login or register to complete your order',
      },
    })
  }

  const currentTimeOptions = deliverySchedule === 'morning' ? morningTimes : eveningTimes

  return (
    <section className="py-12 md:py-10" style={{ backgroundColor: '#F5EFE7' }}>
      <div className="container mx-auto px-4">
        {/* Header Section */}
        <motion.div
          className="text-center mb-10 md:mb-12"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeInUp}
        >
          <h1
            className="text-2xl md:text-3xl lg:text-4xl font-light mb-4 font-[titleFont]"
            style={{ color: '#2A1803' }}
          >
            Your Daily Bread, Just a Click Away!
          </h1>

          <motion.p
            className="text-base md:text-lg lg:text-lg max-w-3xl mx-auto font-[titleFont] mb-6"
            style={{ color: '#9C4A15' }}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Freshly baked, hand-kneaded, and zero preservatives. Order Now!
          </motion.p>

          <div className="h-1 w-24 mx-auto" style={{ backgroundColor: '#9C4A15' }}></div>
        </motion.div>

        {/* Login reminder if not authenticated */}
        {!isAuthenticated && (
          <motion.div
            className="mb-6 p-4 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <p className="font-[titleFont]">
              Please{' '}
              <button
                onClick={() => setShowAuthModal(true)}
                className="font-bold underline hover:text-blue-900"
              >
                login or register
              </button>{' '}
              to place your order.
            </p>
          </motion.div>
        )}

        {/* Error message display */}
        {orderError && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {orderError}
          </div>
        )}

        <motion.div
          className="mx-auto"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, amount: 0.1 }}
          variants={staggerContainer}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10">
            {/* Calendar Section */}
            <motion.div className="flex flex-col" variants={faqItem}>
              <h2
                className="text-xl md:text-2xl font-light mb-6 font-[titleFont]"
                style={{ color: '#2A1803' }}
              >
                Select Delivery Dates
              </h2>

              <div className="bg-white rounded-xl shadow-lg p-6 md:p-7 flex-1 flex flex-col">
                {/* Month Navigation */}
                <div className="flex items-center justify-between mb-6">
                  <button
                    onClick={handlePrevMonth}
                    className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-[#F5EFE7] transition-colors text-base cursor-pointer"
                    style={{ color: '#2A1803' }}
                  >
                    ←
                  </button>
                  <h3 className="text-lg font-medium font-[titleFont]" style={{ color: '#2A1803' }}>
                    {getMonthName(currentDate.getMonth())} {currentDate.getFullYear()}
                  </h3>
                  <button
                    onClick={handleNextMonth}
                    className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-[#F5EFE7] transition-colors text-base cursor-pointer"
                    style={{ color: '#2A1803' }}
                  >
                    →
                  </button>
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-2 mb-6">
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                    <div
                      key={index}
                      className="text-center py-2 text-sm font-semibold font-[titleFont]"
                      style={{ color: '#9C4A15' }}
                    >
                      {day}
                    </div>
                  ))}

                  {currentMonth.map((dayData, index) => {
                    if (!dayData) {
                      return <div key={index} className="aspect-square"></div>
                    }

                    const { date, isToday } = dayData
                    const isSelected = isDateSelected(date)

                    return (
                      <button
                        key={index}
                        onClick={() => handleDateClick(date)}
                        className={`aspect-square flex items-center justify-center rounded-lg transition-all duration-200 cursor-pointer ${getDateStyle(
                          date,
                          isToday,
                        )} 
                          ${isSelected ? 'transform hover:scale-105' : 'hover:scale-102'} 
                          font-[titleFont] text-sm`}
                      >
                        <span className={`font-medium`}>{date.getDate()}</span>
                      </button>
                    )
                  })}
                </div>

                {/* Quick Actions */}
                <div className="flex flex-wrap gap-3 mb-6">
                  <button
                    onClick={handleSelectAllWeekdays}
                    className="px-4 py-2 rounded-full font-[titleFont] text-sm cursor-pointer"
                    style={{
                      backgroundColor: '#F5EFE7',
                      color: '#2A1803',
                      border: '1px solid #9C4A15',
                    }}
                  >
                    Weekdays
                  </button>
                  <button
                    onClick={handleSelectAllWeekends}
                    className="px-4 py-2 rounded-full font-[titleFont] text-sm cursor-pointer"
                    style={{
                      backgroundColor: '#F5EFE7',
                      color: '#2A1803',
                      border: '1px solid #9C4A15',
                    }}
                  >
                    Weekends
                  </button>
                  <button
                    onClick={handleClearAll}
                    className="px-4 py-2 rounded-full font-[titleFont] text-sm cursor-pointer"
                    style={{
                      backgroundColor: '#F5EFE7',
                      color: '#2A1803',
                      border: '1px solid #9C4A15',
                    }}
                  >
                    Clear
                  </button>
                </div>

                {/* Selected Dates Preview */}
                <div className="mt-4 pt-6 border-t" style={{ borderColor: '#F5EFE7' }}>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold font-[titleFont] text-lg" style={{ color: '#2A1803' }}>
                      Selected Delivery Dates ({selectedDates.length})
                    </h3>
                    {selectedDates.length > 0 && selectedTime && (
                      <span
                        className="text-sm font-[titleFont] px-3 py-1 rounded-full"
                        style={{ backgroundColor: '#F5EFE7', color: '#9C4A15' }}
                      >
                        {formatTimeForDisplay(selectedTime)}
                      </span>
                    )}
                  </div>

                  {selectedDates.length === 0 ? (
                    <div
                      className="flex flex-col items-center justify-center py-8 md:py-12 text-center"
                      style={{ color: '#9C4A15' }}
                    >
                      <svg
                        className="w-12 h-12 mb-4 opacity-50"
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
                      <p className="text-sm mt-1">
                        Click on dates in the calendar above to add delivery dates
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {selectedDates.map((dateStr, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-4 rounded-lg hover:shadow-sm transition-shadow"
                            style={{
                              backgroundColor: '#F5EFE7',
                              border: '1px solid rgba(156, 74, 21, 0.2)',
                            }}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className="w-10 h-10 flex items-center justify-center rounded-lg"
                                style={{ backgroundColor: '#9C4A15', color: '#F5EFE7' }}
                              >
                                <span className="font-bold font-[titleFont]">
                                  {new Date(dateStr).getDate()}
                                </span>
                              </div>
                              <div>
                                <span
                                  className="font-medium font-[titleFont] block"
                                  style={{ color: '#2A1803' }}
                                >
                                  {formatDateDisplay(dateStr)}
                                </span>
                                <span
                                  className="text-xs font-[titleFont] block mt-1"
                                  style={{ color: '#9C4A15' }}
                                >
                                  {getDayName(new Date(dateStr).getDay())}
                                </span>
                              </div>
                            </div>
                            <div className="text-right">
                              <span
                                className="text-sm font-[titleFont] font-medium block"
                                style={{ color: '#9C4A15' }}
                              >
                                {selectedTime ? formatTimeForDisplay(selectedTime) : 'Select time'}
                              </span>
                              <span
                                className="text-xs font-[titleFont] block mt-1"
                                style={{ color: '#2A1803' }}
                              >
                                {getFinalQuantity()} pcs
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

            {/* Order Configuration */}
            <div className="flex flex-col space-y-8">
              {/* Delivery Configuration */}
              <motion.div className="flex flex-col" variants={faqItem} transition={{ delay: 0.1 }}>
                <h2
                  className="text-xl md:text-2xl font-light mb-6 font-[titleFont]"
                  style={{ color: '#2A1803' }}
                >
                  Delivery Configuration
                </h2>

                <div className="bg-white rounded-xl shadow-lg p-6 md:p-7 flex-1">
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

                  {/* Quantity Selection */}
                  <h3
                    className="text-lg font-medium mb-4 font-[titleFont]"
                    style={{ color: '#9C4A15' }}
                  >
                    Quantity per Delivery
                  </h3>
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    {[20, 40, 50].map((option) => (
                      <button
                        key={option}
                        onClick={() => handleQuantityChange(option)}
                        className={`py-3 rounded-lg transition-all duration-200 font-[titleFont] text-sm cursor-pointer ${
                          quantity === option && quantity !== 'custom'
                            ? 'bg-[#9C4A15] text-white'
                            : 'bg-[#F5EFE7] text-[#2A1803] hover:bg-[#e8dfd2]'
                        }`}
                      >
                        {option} pcs
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-3 mb-3">
                    <button
                      onClick={() => handleQuantityChange('custom')}
                      className={`flex-1 py-3 rounded-lg transition-all duration-200 font-[titleFont] text-sm cursor-pointer ${
                        quantity === 'custom'
                          ? 'bg-[#9C4A15] text-white'
                          : 'bg-[#F5EFE7] text-[#2A1803] hover:bg-[#e8dfd2]'
                      }`}
                    >
                      Custom
                    </button>
                    {quantity === 'custom' && (
                      <input
                        type="number"
                        value={customQuantity}
                        onChange={(e) => setCustomQuantity(e.target.value.replace(/\D/g, ''))}
                        placeholder="Enter quantity"
                        min="20"
                        className="flex-1 px-4 py-3 rounded-lg border-2 border-[#9C4A15] focus:outline-none focus:ring-2 focus:ring-[#9C4A15] font-[titleFont] text-sm"
                        style={{ color: '#2A1803' }}
                      />
                    )}
                  </div>
                  <p className="text-sm font-[titleFont]" style={{ color: '#9C4A15' }}>
                    Minimum: 20 pieces per delivery (₱{20 * PANDESAL_PRICE_PER_PIECE} minimum)
                  </p>

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

              {/* Order Summary */}
              <motion.div className="flex flex-col" variants={faqItem} transition={{ delay: 0.2 }}>
                <h2
                  className="text-xl md:text-2xl font-light mb-6 font-[titleFont]"
                  style={{ color: '#2A1803' }}
                >
                  Order Summary
                </h2>

                <div className="bg-white rounded-xl shadow-lg p-6 md:p-7 flex-1 flex flex-col">
                  <div className="space-y-4 flex-1">
                    <div className="flex justify-between items-center">
                      <span className="font-[titleFont] text-base" style={{ color: '#2A1803' }}>
                        Selected Days
                      </span>
                      <span
                        className="font-bold font-[titleFont] text-lg"
                        style={{ color: '#9C4A15' }}
                      >
                        {selectedDates.length}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-[titleFont] text-base" style={{ color: '#2A1803' }}>
                        Delivery Time
                      </span>
                      <span
                        className="font-bold font-[titleFont] text-lg"
                        style={{ color: '#9C4A15' }}
                      >
                        {selectedTime ? formatTimeForDisplay(selectedTime) : 'Not selected'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-[titleFont] text-base" style={{ color: '#2A1803' }}>
                        Pieces per delivery
                      </span>
                      <span
                        className="font-bold font-[titleFont] text-lg"
                        style={{ color: '#9C4A15' }}
                      >
                        {getFinalQuantity()} pcs
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-[titleFont] text-base" style={{ color: '#2A1803' }}>
                        Price per piece
                      </span>
                      <span
                        className="font-bold font-[titleFont] text-lg"
                        style={{ color: '#9C4A15' }}
                      >
                        {formatCurrency(PANDESAL_PRICE_PER_PIECE)}
                      </span>
                    </div>

                    <div className="h-px" style={{ backgroundColor: '#F5EFE7' }}></div>

                    <div className="flex justify-between items-center mb-2">
                      <span
                        className="font-bold font-[titleFont] text-lg"
                        style={{ color: '#2A1803' }}
                      >
                        Total Pandesal
                      </span>
                      <span
                        className="font-bold font-[titleFont] text-xl"
                        style={{ color: '#9C4A15' }}
                      >
                        {getTotalPandesal()} pcs
                      </span>
                    </div>

                    {/* Total Price Section */}
                    <div className="mt-4 pt-4 border-t" style={{ borderColor: '#F5EFE7' }}>
                      <div className="flex justify-between items-center mb-2">
                        <span
                          className="font-bold font-[titleFont] text-lg"
                          style={{ color: '#2A1803' }}
                        >
                          Total Amount
                        </span>
                        <span
                          className="font-bold font-[titleFont] text-2xl"
                          style={{ color: '#9C4A15' }}
                        >
                          {formatCurrency(getTotalPrice())}
                        </span>
                      </div>
                      <p
                        className="text-sm font-[titleFont] text-right"
                        style={{ color: '#9C4A15' }}
                      >
                        ({getTotalPandesal()} pcs × {formatCurrency(PANDESAL_PRICE_PER_PIECE)})
                      </p>
                    </div>

                    {specialInstructions && (
                      <div
                        className="mt-4 p-3 rounded-lg font-[titleFont] text-sm"
                        style={{ backgroundColor: '#F5EFE7', color: '#2A1803' }}
                      >
                        <span className="font-medium">Special Instructions:</span>{' '}
                        {specialInstructions}
                      </div>
                    )}
                  </div>

                  <div className="mt-6">
                    <motion.button
                      onClick={handleSubmitOrder}
                      disabled={
                        selectedDates.length === 0 ||
                        !selectedTime ||
                        (quantity === 'custom' &&
                          (!customQuantity || parseInt(customQuantity) < 20)) ||
                        !isAuthenticated
                      }
                      className={`w-full py-4 rounded-full font-bold font-[titleFont] text-base transition-all duration-200 shadow-lg cursor-pointer ${
                        !isAuthenticated ? 'opacity-70 cursor-not-allowed' : ''
                      }`}
                      style={{
                        backgroundColor: '#9C4A15',
                        color: '#F5EFE7',
                      }}
                      whileHover={isAuthenticated ? { scale: 1.02 } : {}}
                      whileTap={isAuthenticated ? { scale: 0.98 } : {}}
                    >
                      {!isAuthenticated
                        ? 'Login to Place Order'
                        : selectedDates.length === 0
                          ? 'Select Delivery Dates'
                          : !selectedTime
                            ? 'Select Delivery Time'
                            : `Proceed to Payment • ${formatCurrency(getTotalPrice())}`}
                    </motion.button>

                    {/* Show user status message */}
                    {isAuthenticated && user && (
                      <p
                        className="text-center mt-3 font-[titleFont] text-sm"
                        style={{ color: '#2A1803' }}
                      >
                        Ordering as:{' '}
                        <span style={{ color: '#9C4A15', fontWeight: '600' }}>
                          {user.fullname || user.c_fullname}
                        </span>
                      </p>
                    )}

                    <p
                      className="text-center mt-3 font-[titleFont] text-sm"
                      style={{ color: '#9C4A15' }}
                    >
                      Free delivery on all subscriptions
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
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

      {/* shown if user is NOT logged in */}
      <AuthChoiceModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onGuestContinue={handleGuestContinue}
        onLoginRegister={handleLoginRegister}
      />
    </section>
  )
}

export default Order
