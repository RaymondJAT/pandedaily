import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import AuthChoiceModal from '../../components/website modal/AuthChoiceModal'

const Order = () => {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDates, setSelectedDates] = useState([])
  const [currentMonth, setCurrentMonth] = useState([])
  const [deliverySchedule, setDeliverySchedule] = useState('morning')
  const [quantity, setQuantity] = useState(20)
  const [customQuantity, setCustomQuantity] = useState('')
  const [specialInstructions, setSpecialInstructions] = useState('')
  const [showAuthModal, setShowAuthModal] = useState(false)

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

  const formatDateDisplay = (dateStr) => {
    const date = new Date(dateStr)
    return `${getDayName(date.getDay())}, ${getMonthName(date.getMonth())} ${date.getDate()}`
  }

  const handleSubmitOrder = () => {
    if (selectedDates.length === 0) {
      alert('Please select at least one delivery date')
      return
    }

    if (quantity === 'custom' && (!customQuantity || parseInt(customQuantity) < 20)) {
      alert('Please enter a valid quantity (minimum 20 pieces)')
      return
    }

    // Show auth modal instead of directly submitting
    setShowAuthModal(true)
  }

  const handleGuestContinue = () => {
    // Submit order as guest
    const orderDetails = {
      dates: selectedDates,
      schedule: deliverySchedule,
      quantity: getFinalQuantity(),
      instructions: specialInstructions,
      totalPieces: getTotalPandesal(),
      totalPrice: getTotalPandesal() * 10,
    }

    console.log('Order submitted as guest:', orderDetails)
    alert('Order submitted successfully! We will contact you for confirmation.')
    setShowAuthModal(false)
  }

  const handleLoginRegister = () => {
    // Redirect to login/register page
    console.log('Redirecting to login/register')
    // You would typically do: router.push('/auth')
    // For now, just close modal and show message
    alert('Redirecting to login/register page...')
    setShowAuthModal(false)
  }

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

        {/* Layout - Two columns with balanced spacing */}
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
                <div className="pt-6 border-t" style={{ borderColor: '#F5EFE7' }}>
                  <h3
                    className="font-bold mb-4 font-[titleFont] text-base"
                    style={{ color: '#2A1803' }}
                  >
                    Selected Dates ({selectedDates.length})
                  </h3>
                  <div className="space-y-3 h-35 overflow-y-auto pr-2">
                    {selectedDates.map((dateStr, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 rounded-lg text-sm"
                        style={{ backgroundColor: '#F5EFE7' }}
                      >
                        <span
                          className="font-medium font-[titleFont] truncate pr-2"
                          style={{ color: '#2A1803' }}
                        >
                          {formatDateDisplay(dateStr)}
                        </span>
                        <span
                          className="text-sm font-[titleFont] whitespace-nowrap"
                          style={{ color: '#9C4A15' }}
                        >
                          {deliverySchedule === 'morning' ? '6:30-10 AM' : '3-7 PM'}
                        </span>
                      </div>
                    ))}
                    {selectedDates.length === 0 && (
                      <p
                        className="text-center py-4 font-[titleFont] text-sm"
                        style={{ color: '#9C4A15' }}
                      >
                        No dates selected
                      </p>
                    )}
                  </div>
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
                  <h3
                    className="text-lg font-medium mb-4 font-[titleFont]"
                    style={{ color: '#9C4A15' }}
                  >
                    Choose Delivery Time
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
                        6:30-10 AM
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
                        3-7 PM
                      </div>
                    </button>
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
                    Minimum: 20 pieces per delivery
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
                        Pieces per delivery
                      </span>
                      <span
                        className="font-bold font-[titleFont] text-lg"
                        style={{ color: '#9C4A15' }}
                      >
                        {getFinalQuantity()} pcs
                      </span>
                    </div>

                    <div className="h-px" style={{ backgroundColor: '#F5EFE7' }}></div>

                    <div className="flex justify-between items-center">
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

                    {specialInstructions && (
                      <div
                        className="mt-4 p-3 rounded-lg font-[titleFont] text-sm"
                        style={{ backgroundColor: '#F5EFE7', color: '#2A1803' }}
                      >
                        With special instructions
                      </div>
                    )}
                  </div>

                  <div className="mt-6">
                    <motion.button
                      onClick={handleSubmitOrder}
                      className="w-full py-4 rounded-full font-bold font-[titleFont] text-base transition-all duration-200 shadow-lg cursor-pointer"
                      style={{
                        backgroundColor: '#9C4A15',
                        color: '#F5EFE7',
                      }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      disabled={
                        selectedDates.length === 0 ||
                        (quantity === 'custom' &&
                          (!customQuantity || parseInt(customQuantity) < 20))
                      }
                    >
                      {selectedDates.length === 0
                        ? 'Select Delivery Dates'
                        : `Place Order for ${selectedDates.length} Delivery${selectedDates.length !== 1 ? 's' : ''}`}
                    </motion.button>

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

      {/* Auth Choice Modal */}
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
