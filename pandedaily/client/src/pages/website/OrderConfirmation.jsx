import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  FiCheckCircle,
  FiShoppingBag,
  FiCalendar,
  FiPackage,
  FiClock,
  FiUser,
  FiHome,
  FiArrowRight,
  FiShoppingCart,
} from 'react-icons/fi'

const OrderConfirmation = () => {
  const navigate = useNavigate()
  const [orderData, setOrderData] = useState(null)

  useEffect(() => {
    const savedOrder = localStorage.getItem('confirmedOrder')
    if (savedOrder) {
      setOrderData(JSON.parse(savedOrder))
    } else {
      navigate('/order')
    }
  }, [navigate])

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  const formatDateDisplay = (dateStr) => {
    const date = new Date(dateStr)
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ]
    return `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}`
  }

  if (!orderData) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: '#F5EFE7' }}
      >
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#9C4A15] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p style={{ color: '#2A1803' }}>Loading confirmation...</p>
        </div>
      </div>
    )
  }

  return (
    <section className="min-h-screen py-12 md:py-16" style={{ backgroundColor: '#F5EFE7' }}>
      <div className="container mx-auto px-4">
        {/* Success Animation */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div
            className="w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'rgba(156, 74, 21, 0.1)' }}
          >
            <FiCheckCircle className="w-16 h-16" style={{ color: '#9C4A15' }} />
          </div>
          <h1
            className="text-3xl md:text-4xl font-light font-[titleFont] mb-4"
            style={{ color: '#2A1803' }}
          >
            Order Confirmed!
          </h1>
          <p className="text-lg md:text-xl font-[titleFont] mb-6" style={{ color: '#9C4A15' }}>
            Thank you for your order, {orderData.customer_info.c_fullname?.split(' ')[0]}!
          </p>
          <div
            className="inline-block px-6 py-2 rounded-full mb-8"
            style={{ backgroundColor: 'rgba(156, 74, 21, 0.1)', color: '#9C4A15' }}
          >
            <span className="font-bold font-[titleFont]">Order #{orderData.order_number}</span>
          </div>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          <motion.div
            className="bg-white rounded-xl shadow-lg p-6 md:p-8 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Order Details */}
              <div>
                <h2
                  className="text-xl font-light font-[titleFont] mb-6"
                  style={{ color: '#2A1803' }}
                >
                  <div className="flex items-center gap-3">
                    <FiShoppingBag className="text-[#9C4A15]" />
                    Order Summary
                  </div>
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <FiCalendar className="w-5 h-5 text-[#9C4A15]" />
                    <div>
                      <p className="text-sm font-medium" style={{ color: '#9C4A15' }}>
                        Delivery Days
                      </p>
                      <p className="font-[titleFont]" style={{ color: '#2A1803' }}>
                        {orderData.order_details.dates.length} days
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <FiPackage className="w-5 h-5 text-[#9C4A15]" />
                    <div>
                      <p className="text-sm font-medium" style={{ color: '#9C4A15' }}>
                        Pieces per delivery
                      </p>
                      <p className="font-[titleFont]" style={{ color: '#2A1803' }}>
                        {orderData.order_details.quantity} pcs
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <FiClock className="w-5 h-5 text-[#9C4A15]" />
                    <div>
                      <p className="text-sm font-medium" style={{ color: '#9C4A15' }}>
                        Delivery Time
                      </p>
                      <p className="font-[titleFont]" style={{ color: '#2A1803' }}>
                        {orderData.delivery_schedule === 'morning'
                          ? 'Morning (6:30-10 AM)'
                          : 'Evening (3-7 PM)'}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t" style={{ borderColor: '#F5EFE7' }}>
                    <div className="flex justify-between items-center">
                      <span className="font-bold font-[titleFont]" style={{ color: '#2A1803' }}>
                        Total Amount
                      </span>
                      <span
                        className="font-bold font-[titleFont] text-xl"
                        style={{ color: '#9C4A15' }}
                      >
                        {formatCurrency(orderData.total_amount)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Next Steps */}
              <div>
                <h2
                  className="text-xl font-light font-[titleFont] mb-6"
                  style={{ color: '#2A1803' }}
                >
                  What's Next?
                </h2>
                <div className="space-y-4">
                  <div
                    className="p-4 rounded-lg"
                    style={{
                      backgroundColor: '#F5EFE7',
                      border: '1px solid rgba(156, 74, 21, 0.2)',
                    }}
                  >
                    <p className="font-medium mb-2" style={{ color: '#9C4A15' }}>
                      📱 Confirmation Call
                    </p>
                    <p className="text-sm" style={{ color: '#2A1803' }}>
                      Our team will call you within 24 hours to confirm your order details.
                    </p>
                  </div>
                  <div
                    className="p-4 rounded-lg"
                    style={{
                      backgroundColor: '#F5EFE7',
                      border: '1px solid rgba(156, 74, 21, 0.2)',
                    }}
                  >
                    <p className="font-medium mb-2" style={{ color: '#9C4A15' }}>
                      📦 First Delivery
                    </p>
                    <p className="text-sm" style={{ color: '#2A1803' }}>
                      Your first delivery will be on{' '}
                      <span className="font-medium">
                        {formatDateDisplay(orderData.order_details.dates[0])}
                      </span>
                    </p>
                  </div>
                  <div
                    className="p-4 rounded-lg"
                    style={{
                      backgroundColor: '#F5EFE7',
                      border: '1px solid rgba(156, 74, 21, 0.2)',
                    }}
                  >
                    <p className="font-medium mb-2" style={{ color: '#9C4A15' }}>
                      📞 Need Help?
                    </p>
                    <p className="text-sm" style={{ color: '#2A1803' }}>
                      Contact us: customerservice@pandedaily.com
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            className="flex flex-col md:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Link
              to="/customer/orders"
              className="flex-1 md:flex-none px-8 py-4 rounded-full font-bold font-[titleFont] transition-all duration-200 hover:scale-105 text-center"
              style={{
                backgroundColor: '#2A1803',
                color: '#F5EFE7',
              }}
            >
              <div className="flex items-center justify-center gap-2">
                <FiShoppingBag />
                <span>View My Orders</span>
              </div>
            </Link>
            <Link
              to="/order"
              className="flex-1 md:flex-none px-8 py-4 rounded-full font-bold font-[titleFont] transition-all duration-200 hover:scale-105 text-center"
              style={{
                backgroundColor: '#9C4A15',
                color: '#F5EFE7',
              }}
            >
              <div className="flex items-center justify-center gap-2">
                <FiShoppingCart />
                <span>Place Another Order</span>
              </div>
            </Link>
            <Link
              to="/"
              className="flex-1 md:flex-none px-8 py-4 rounded-full font-bold font-[titleFont] transition-all duration-200 hover:scale-105 text-center"
              style={{
                backgroundColor: 'transparent',
                color: '#2A1803',
                border: '2px solid #2A1803',
              }}
            >
              <div className="flex items-center justify-center gap-2">
                <FiHome />
                <span>Back to Home</span>
              </div>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default OrderConfirmation
