const CalendarGrid = ({ currentMonth, today, isDateSelected, handleDateClick }) => {
  return (
    <>
      {/* Day headers */}
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

      {/* Calendar Grid */}
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
              {isSelected && <span className="text-xs mt-0.5 opacity-90">Selected</span>}
            </button>
          )
        })}
      </div>
    </>
  )
}

export default CalendarGrid
