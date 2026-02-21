import { FiPackage } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import { WebsiteRoutes } from '../../routes/websiteRoutes'

const EmptyOrderState = () => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-12 text-center">
      <FiPackage className="mx-auto text-4xl text-gray-300 mb-3" />
      <p className="text-gray-500 mb-4">No orders found</p>
      <Link
        to={WebsiteRoutes.order}
        className="inline-block px-4 py-2 rounded-lg text-white text-sm hover:opacity-90 transition-opacity"
        style={{ backgroundColor: '#9C4A15' }}
      >
        Order Now
      </Link>
    </div>
  )
}

export default EmptyOrderState
