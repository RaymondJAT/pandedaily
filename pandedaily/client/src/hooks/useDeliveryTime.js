import { useState } from 'react'

export const useDeliveryTime = () => {
  const [deliverySchedule, setDeliverySchedule] = useState('morning')
  const [selectedTime, setSelectedTime] = useState('')

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

  const formatTimeForDisplay = (time) => {
    if (!time) return ''
    const [hours, minutes] = time.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour > 12 ? hour - 12 : hour
    return `${displayHour}:${minutes} ${ampm}`
  }

  const handleScheduleChange = (schedule) => {
    setDeliverySchedule(schedule)
    setSelectedTime('')
  }

  const handleTimeSelect = (time) => {
    setSelectedTime(time)
  }

  const currentTimeOptions = deliverySchedule === 'morning' ? morningTimes : eveningTimes

  const calculateEndTime = (startTime) => {
    const [startHour, startMinute] = startTime.split(':').map(Number)
    let endHour, endMinute

    if (deliverySchedule === 'morning') {
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

  return {
    deliverySchedule,
    selectedTime,
    morningTimes,
    eveningTimes,
    currentTimeOptions,
    formatTimeForDisplay,
    handleScheduleChange,
    handleTimeSelect,
    calculateEndTime,
  }
}
