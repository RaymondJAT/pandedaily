import { motion } from 'framer-motion'
import { FiFilter, FiSearch } from 'react-icons/fi'
import { fadeIn } from '../../utils/animations'

const orderStatuses = {
  PAID: { label: 'Paid' },
  APPROVED: { label: 'Approved' },
  REJECTED: { label: 'Rejected' },
  'FOR-PICK-UP': { label: 'For Pick Up' },
  'OUT-FOR-DELIVERY': { label: 'Out for Delivery' },
  COMPLETE: { label: 'Completed' },
}

const OrderFilters = ({
  filterStatus,
  searchQuery,
  onFilterChange,
  onSearchChange,
  showFilters,
  onToggleFilters,
}) => {
  return (
    <motion.div variants={fadeIn} className="bg-white rounded-xl shadow-lg p-6 mb-8">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex items-center space-x-2">
          <FiFilter className="text-gray-400" />
          <select
            value={filterStatus}
            onChange={(e) => onFilterChange(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-[#9C4A15] outline-none"
            style={{ borderColor: '#E5E7EB' }}
          >
            <option value="all">All Orders</option>
            {Object.entries(orderStatuses).map(([key, value]) => (
              <option key={key} value={key}>
                {value.label}
              </option>
            ))}
          </select>
        </div>

        <div className="relative flex-1 max-w-xs">
          <FiSearch
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={14}
          />
          <input
            type="text"
            placeholder="Search order ID..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-8 pr-3 py-2 border rounded-lg w-full text-sm focus:ring-1 focus:ring-[#9C4A15] outline-none"
            style={{ borderColor: '#E5E7EB' }}
          />
        </div>
      </div>
    </motion.div>
  )
}

export default OrderFilters
