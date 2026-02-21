import { motion } from 'framer-motion'
import { FiClock } from 'react-icons/fi'
import TimeSlotPicker from './TimeSlotPicker'

const DeliveryConfiguration = ({
  deliverySchedule,
  selectedTime,
  currentTimeOptions,
  onScheduleChange,
  onTimeSelect,
  formatTimeForDisplay,
  specialInstructions,
  onInstructionsChange,
  faqItem,
}) => {
  return (
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
        <h3 className="text-lg font-medium mb-4 font-[titleFont]" style={{ color: '#9C4A15' }}>
          Choose Delivery Schedule
        </h3>
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => onScheduleChange('morning')}
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
            onClick={() => onScheduleChange('evening')}
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
        <TimeSlotPicker
          selectedTime={selectedTime}
          timeOptions={currentTimeOptions}
          onTimeSelect={onTimeSelect}
          formatTimeForDisplay={formatTimeForDisplay}
        />

        {/* Special Instructions */}
        <h3 className="text-lg font-medium mb-4 mt-8 font-[titleFont]" style={{ color: '#9C4A15' }}>
          Special Instructions
        </h3>
        <textarea
          value={specialInstructions}
          onChange={(e) => onInstructionsChange(e.target.value)}
          placeholder="Any special requests or notes for delivery..."
          className="w-full h-28 px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-[#9C4A15] focus:outline-none focus:ring-2 focus:ring-[#9C4A15] font-[titleFont] text-sm resize-none"
          style={{ color: '#2A1803' }}
        />
      </div>
    </motion.div>
  )
}

export default DeliveryConfiguration
