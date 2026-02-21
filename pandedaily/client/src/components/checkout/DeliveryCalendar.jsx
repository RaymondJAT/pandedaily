import { motion } from 'framer-motion'
import { FiCalendar } from 'react-icons/fi'
import CalendarGrid from './CalendarGrid'
import SelectedDatesList from './SelectedDateList'

const DeliveryCalendar = ({
  currentDate,
  selectedDates,
  currentMonth,
  today,
  getMonthName,
  handlePrevMonth,
  handleNextMonth,
  handleDateClick,
  selectAllWeekdays,
  selectAllWeekends,
  clearAllDates,
  isDateSelected,
  formatDateDisplay,
  getDayName,
  selectedTime,
  formatTimeForDisplay,
  maxDays,
  faqItem,
}) => {
  return (
    <motion.div className="flex flex-col h-full" variants={faqItem} transition={{ delay: 0.15 }}>
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
        {/* Month Navigation */}
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
          <h3 className="text-xl font-medium font-[titleFont]" style={{ color: '#2A1803' }}>
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

        {/* Calendar Grid */}
        <CalendarGrid
          currentMonth={currentMonth}
          today={today}
          isDateSelected={isDateSelected}
          handleDateClick={handleDateClick}
        />

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-3 mb-6 shrink-0">
          <button
            onClick={selectAllWeekdays}
            className="px-5 py-2.5 rounded-full font-[titleFont] text-sm cursor-pointer transition-all duration-200 hover:shadow-md"
            style={{ backgroundColor: '#F5EFE7', color: '#2A1803' }}
          >
            Weekdays
          </button>
          <button
            onClick={selectAllWeekends}
            className="px-5 py-2.5 rounded-full font-[titleFont] text-sm cursor-pointer transition-all duration-200 hover:shadow-md"
            style={{ backgroundColor: '#F5EFE7', color: '#2A1803' }}
          >
            Weekends
          </button>
          <button
            onClick={clearAllDates}
            className="px-5 py-2.5 rounded-full font-[titleFont] text-sm cursor-pointer transition-all duration-200 hover:shadow-md"
            style={{ backgroundColor: '#F5EFE7', color: '#2A1803' }}
          >
            Clear All
          </button>
        </div>

        {/* Selected Dates Preview */}
        <SelectedDatesList
          selectedDates={selectedDates}
          maxDays={maxDays}
          formatDateDisplay={formatDateDisplay}
          getDayName={getDayName}
          selectedTime={selectedTime}
          formatTimeForDisplay={formatTimeForDisplay}
        />
      </div>
    </motion.div>
  )
}

export default DeliveryCalendar
