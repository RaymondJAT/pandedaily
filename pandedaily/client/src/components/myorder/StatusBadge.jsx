import { FiPackage, FiClock, FiCheckCircle, FiTruck, FiHome } from 'react-icons/fi'

const orderStatuses = {
  PAID: { label: 'Paid', color: 'text-yellow-600', bgColor: 'bg-yellow-100', icon: FiClock },
  APPROVED: {
    label: 'Approved',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    icon: FiCheckCircle,
  },
  REJECTED: { label: 'Rejected', color: 'text-red-600', bgColor: 'bg-red-100', icon: FiPackage },
  'FOR-PICK-UP': {
    label: 'For Pick Up',
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    icon: FiPackage,
  },
  'OUT-FOR-DELIVERY': {
    label: 'Out for Delivery',
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
    icon: FiTruck,
  },
  COMPLETE: { label: 'Completed', color: 'text-green-600', bgColor: 'bg-green-100', icon: FiHome },
}

const StatusBadge = ({ status }) => {
  const config = orderStatuses[status] || {
    label: status || 'Unknown',
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
    icon: FiPackage,
  }
  const Icon = config.icon

  return (
    <span
      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.bgColor} ${config.color}`}
    >
      <Icon className="mr-1" size={12} />
      {config.label}
    </span>
  )
}

export default StatusBadge
