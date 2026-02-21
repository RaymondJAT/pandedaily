const TimeSlotPicker = ({ selectedTime, timeOptions, onTimeSelect, formatTimeForDisplay }) => {
  return (
    <>
      <h3 className="text-lg font-medium mb-4 font-[titleFont]" style={{ color: '#9C4A15' }}>
        Select Delivery Time
      </h3>
      <div className="grid grid-cols-4 gap-2 mb-6">
        {timeOptions.map((time) => (
          <button
            key={time}
            onClick={() => onTimeSelect(time)}
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
    </>
  )
}

export default TimeSlotPicker
