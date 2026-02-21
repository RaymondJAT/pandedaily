const SelectedDatesList = ({
  selectedDates,
  maxDays,
  formatDateDisplay,
  getDayName,
  selectedTime,
  formatTimeForDisplay,
}) => {
  const SCROLL_THRESHOLD = 7

  if (selectedDates.length === 0) {
    return (
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
          <p className="text-sm mt-2 opacity-70">Click on dates above to add delivery dates</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="mt-4 pt-6 border-t-2 shrink-0" style={{ borderColor: '#F5EFE7' }}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold font-[titleFont] text-lg" style={{ color: '#2A1803' }}>
            Selected Delivery Dates
          </h3>
          <div className="flex items-center gap-2">
            <span
              className="text-sm font-[titleFont] px-4 py-1.5 rounded-full"
              style={{ backgroundColor: '#F5EFE7', color: '#9C4A15' }}
            >
              {selectedDates.length} / {maxDays} days
            </span>
          </div>
        </div>
      </div>

      <div
        className={`${
          selectedDates.length >= SCROLL_THRESHOLD ? 'overflow-y-auto pr-2 custom-scrollbar' : ''
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
              style={{ backgroundColor: '#F5EFE7' }}
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-10 h-10 flex flex-col items-center justify-center rounded-lg"
                  style={{ backgroundColor: '#9C4A15', color: '#F5EFE7' }}
                >
                  <span className="text-[10px] font-medium">
                    {new Date(dateStr).toLocaleString('default', { month: 'short' })}
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
                  {selectedTime ? formatTimeForDisplay(selectedTime) : 'Select time'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

export default SelectedDatesList
