/**
 * Currency formatting
 */
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

/**
 * Price formatting (without currency symbol)
 */
export const formatPrice = (price) => {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price
  return numPrice.toFixed(2)
}

/**
 * Time formatting for display (e.g., "06:30:00" -> "6:30 AM")
 */
export const formatTimeForDisplay = (time) => {
  if (!time) return ''
  const [hours, minutes] = time.split(':')
  const hour = parseInt(hours)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour > 12 ? hour - 12 : hour
  return `${displayHour}:${minutes} ${ampm}`
}

/**
 * Date formatting for API (YYYY-MM-DD)
 */
export const formatDateForAPI = (dateStr) => {
  const date = new Date(dateStr)
  return date.toISOString().split('T')[0]
}

/**
 * Date formatting for display (e.g., "Mon, Jan 15")
 */
export const formatDateDisplay = (dateStr) => {
  const date = new Date(dateStr)
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ]
  return `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}`
}

/**
 * Get month name from month index
 */
export const getMonthName = (month) => {
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

/**
 * Get day name from day index
 */
export const getDayName = (dayIndex) => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  return days[dayIndex]
}

/**
 * Combine date and time for API
 */
export const combineDateAndTime = (dateStr, timeStr) => {
  return `${formatDateForAPI(dateStr)} ${timeStr}`
}

/**
 * Calculate end time based on start time and schedule
 */
export const calculateEndTime = (startTime, schedule) => {
  const [startHour, startMinute] = startTime.split(':').map(Number)
  let endHour, endMinute

  if (schedule === 'morning') {
    endHour = startHour + 2
    endMinute = startMinute + 30
    if (endMinute >= 60) {
      endHour += 1
      endMinute -= 60
    }
  } else {
    endHour = startHour + 3
    endMinute = startMinute
    if (endHour >= 24) {
      endHour = 23
      endMinute = 59
    }
  }
  return `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}:00`
}

/**
 * Format phone number for display
 */
export const formatPhoneNumber = (phone) => {
  if (!phone) return ''
  const digits = phone.replace(/\D/g, '')
  if (digits.length > 7) {
    return `${digits.slice(0, 4)}-${digits.slice(4, 7)}-${digits.slice(7)}`
  } else if (digits.length > 4) {
    return `${digits.slice(0, 4)}-${digits.slice(4)}`
  }
  return digits
}

/**
 * Clean phone number for API (remove formatting)
 */
export const cleanPhoneNumber = (phone) => {
  return phone.replace(/\D/g, '')
}
