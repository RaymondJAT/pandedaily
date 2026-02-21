import { useState, useEffect } from 'react'

export const useDeliveryCalendar = (maxDays = 10) => {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDates, setSelectedDates] = useState([])
  const [currentMonth, setCurrentMonth] = useState([])

  const today = new Date()
  today.setHours(0, 0, 0, 0)

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
    if (date < today) return false

    const dateString = date.toDateString()
    let newSelectedDates

    if (selectedDates.includes(dateString)) {
      newSelectedDates = selectedDates.filter((d) => d !== dateString)
    } else {
      if (selectedDates.length >= maxDays) return false
      newSelectedDates = [...selectedDates, dateString]
    }

    setSelectedDates(newSelectedDates)
    return true
  }

  const handlePrevMonth = () => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    if (newDate.getMonth() < today.getMonth() && newDate.getFullYear() <= today.getFullYear()) {
      return false
    }
    setCurrentDate(newDate)
    return true
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
    return true
  }

  const selectAllWeekdays = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const daysInMonth = getDaysInMonth(year, month)
    const newSelectedDates = []

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      if (date >= today) {
        const dayOfWeek = date.getDay()
        if (dayOfWeek >= 1 && dayOfWeek <= 5) {
          if (newSelectedDates.length < maxDays) {
            newSelectedDates.push(date.toDateString())
          }
        }
      }
    }

    setSelectedDates(newSelectedDates)
    return newSelectedDates.length >= maxDays
  }

  const selectAllWeekends = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const daysInMonth = getDaysInMonth(year, month)
    const newSelectedDates = []

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      if (date >= today) {
        const dayOfWeek = date.getDay()
        if (dayOfWeek === 0 || dayOfWeek === 6) {
          if (newSelectedDates.length < maxDays) {
            newSelectedDates.push(date.toDateString())
          }
        }
      }
    }

    setSelectedDates(newSelectedDates)
    return newSelectedDates.length >= maxDays
  }

  const clearAllDates = () => {
    setSelectedDates([])
  }

  const isDateSelected = (date) => {
    return selectedDates.includes(date.toDateString())
  }

  const formatDateDisplay = (dateStr) => {
    const date = new Date(dateStr)
    return `${getDayName(date.getDay())}, ${getMonthName(date.getMonth())} ${date.getDate()}`
  }

  return {
    currentDate,
    selectedDates,
    currentMonth,
    today,
    getDayName,
    getMonthName,
    handleDateClick,
    handlePrevMonth,
    handleNextMonth,
    selectAllWeekdays,
    selectAllWeekends,
    clearAllDates,
    isDateSelected,
    formatDateDisplay,
    maxDays,
  }
}
