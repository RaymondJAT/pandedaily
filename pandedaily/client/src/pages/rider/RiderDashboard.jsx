// pages/rider/RiderDashboard.jsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiTruck,
  FiPackage,
  FiCheckCircle,
  FiClock,
  FiLogOut,
  FiMapPin,
  FiPhone,
  FiUser,
  FiCalendar,
  FiDollarSign,
  FiHome,
  FiChevronRight,
  FiBell,
} from 'react-icons/fi'
import { useAuth } from '../../context/AuthContext'
import { fadeInUp, slideInLeft, slideInRight } from '../../utils/animations'
import {
  getRiderDeliveries,
  updateDeliveryStatus,
  getRiderActivities,
} from '../../services/riderApi'

const RiderDashboard = () => {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [deliveries, setDeliveries] = useState([])
  const [activities, setActivities] = useState([])
  const [selectedDelivery, setSelectedDelivery] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('active')
  const [showNotification, setShowNotification] = useState(false)
  const [notification, setNotification] = useState('')

  useEffect(() => {
    if (!user || user.user_type !== 'rider') {
      navigate('/login')
      return
    }
    fetchData()

    // Set up polling for new deliveries every 30 seconds
    const interval = setInterval(fetchDeliveries, 30000)
    return () => clearInterval(interval)
  }, [user])

  const fetchData = async () => {
    try {
      setLoading(true)
      await Promise.all([fetchDeliveries(), fetchActivities()])
    } catch (err) {
      setError('Failed to load data')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchDeliveries = async () => {
    try {
      const response = await getRiderDeliveries()
      const newDeliveries = response.data || []

      // Check for new deliveries
      if (deliveries.length > 0 && newDeliveries.length > deliveries.length) {
        showNotificationMessage('New delivery assigned to you!')
      }

      setDeliveries(newDeliveries)
    } catch (err) {
      console.error('Error fetching deliveries:', err)
    }
  }

  const fetchActivities = async () => {
    try {
      const response = await getRiderActivities(user.id)
      setActivities(response.data || [])
    } catch (err) {
      console.error('Error fetching activities:', err)
    }
  }

  const showNotificationMessage = (message) => {
    setNotification(message)
    setShowNotification(true)
    setTimeout(() => setShowNotification(false), 5000)
  }

  const handleStatusUpdate = async (deliveryId, newStatus) => {
    try {
      await updateDeliveryStatus(deliveryId, newStatus)
      showNotificationMessage(`Delivery #${deliveryId} marked as ${newStatus}`)
      await fetchDeliveries()
      if (selectedDelivery?.id === deliveryId) {
        setSelectedDelivery(null)
      }
    } catch (err) {
      setError('Failed to update delivery status')
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      PENDING: { color: 'bg-yellow-100 text-yellow-600', label: 'Pending', icon: FiClock },
      'OUT-FOR-DELIVERY': {
        color: 'bg-blue-100 text-blue-600',
        label: 'Out for Delivery',
        icon: FiTruck,
      },
      COMPLETED: { color: 'bg-green-100 text-green-600', label: 'Completed', icon: FiCheckCircle },
      CANCELLED: { color: 'bg-red-100 text-red-600', label: 'Cancelled', icon: FiPackage },
    }
    const config = statusConfig[status] || {
      color: 'bg-gray-100 text-gray-600',
      label: status,
      icon: FiPackage,
    }
    const Icon = config.icon
    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}
      >
        <Icon size={12} />
        {config.label}
      </span>
    )
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING':
        return 'border-yellow-500 bg-yellow-50'
      case 'OUT-FOR-DELIVERY':
        return 'border-blue-500 bg-blue-50'
      case 'COMPLETED':
        return 'border-green-500 bg-green-50'
      case 'CANCELLED':
        return 'border-red-500 bg-red-50'
      default:
        return 'border-gray-500 bg-gray-50'
    }
  }

  const filteredDeliveries = deliveries.filter((d) => {
    if (activeTab === 'active') {
      return d.status !== 'COMPLETED' && d.status !== 'CANCELLED'
    } else if (activeTab === 'completed') {
      return d.status === 'COMPLETED'
    }
    return true
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5EFE7] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#9C4A15] border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-600 font-[titleFont]">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F5EFE7] font-[titleFont]">
      {/* Notification Toast */}
      <AnimatePresence>
        {showNotification && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3"
          >
            <FiBell className="w-5 h-5" />
            <span>{notification}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-40">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#9C4A15] flex items-center justify-center">
                <FiTruck className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold" style={{ color: '#2A1803' }}>
                  Rider Dashboard
                </h1>
                <p className="text-sm text-gray-500">Welcome back, {user?.fullname}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden md:block text-right">
                <p className="text-sm font-medium" style={{ color: '#2A1803' }}>
                  Rider ID: #{user?.id}
                </p>
                <p className="text-xs text-gray-500">
                  Status: <span className="text-green-600 font-medium">Active</span>
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
              >
                <FiLogOut className="w-4 h-4" />
                <span className="hidden md:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <motion.div
          variants={slideInLeft}
          initial="initial"
          animate="animate"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Active Deliveries</p>
                <p className="text-3xl font-bold" style={{ color: '#9C4A15' }}>
                  {
                    deliveries.filter((d) => d.status !== 'COMPLETED' && d.status !== 'CANCELLED')
                      .length
                  }
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <FiTruck className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Pending Pickup</p>
                <p className="text-3xl font-bold" style={{ color: '#9C4A15' }}>
                  {deliveries.filter((d) => d.status === 'PENDING').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <FiClock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Out for Delivery</p>
                <p className="text-3xl font-bold" style={{ color: '#9C4A15' }}>
                  {deliveries.filter((d) => d.status === 'OUT-FOR-DELIVERY').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <FiPackage className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Completed Today</p>
                <p className="text-3xl font-bold" style={{ color: '#9C4A15' }}>
                  {
                    deliveries.filter(
                      (d) =>
                        d.status === 'COMPLETED' &&
                        new Date(d.date).toDateString() === new Date().toDateString(),
                    ).length
                  }
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <FiCheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          className="flex gap-2 mb-6 border-b"
        >
          <button
            onClick={() => setActiveTab('active')}
            className={`px-6 py-3 font-medium transition-all relative ${
              activeTab === 'active' ? 'text-[#9C4A15]' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Active Deliveries
            {activeTab === 'active' && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#9C4A15]"
              />
            )}
            {deliveries.filter((d) => d.status !== 'COMPLETED' && d.status !== 'CANCELLED').length >
              0 && (
              <span className="ml-2 px-2 py-0.5 text-xs bg-[#9C4A15] text-white rounded-full">
                {
                  deliveries.filter((d) => d.status !== 'COMPLETED' && d.status !== 'CANCELLED')
                    .length
                }
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('completed')}
            className={`px-6 py-3 font-medium transition-all relative ${
              activeTab === 'completed' ? 'text-[#9C4A15]' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Completed
            {activeTab === 'completed' && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#9C4A15]"
              />
            )}
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`px-6 py-3 font-medium transition-all relative ${
              activeTab === 'history' ? 'text-[#9C4A15]' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Activity History
            {activeTab === 'history' && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#9C4A15]"
              />
            )}
          </button>
        </motion.div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg"
          >
            {error}
          </motion.div>
        )}

        {/* Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Deliveries List */}
          <motion.div
            variants={slideInLeft}
            initial="initial"
            animate="animate"
            className="lg:col-span-1"
          >
            <div className="bg-white rounded-xl shadow-lg h-[calc(100vh-300px)] flex flex-col">
              <div className="p-4 border-b bg-gray-50 rounded-t-xl">
                <h2 className="font-medium" style={{ color: '#2A1803' }}>
                  {activeTab === 'active' && 'Active Deliveries'}
                  {activeTab === 'completed' && 'Completed Deliveries'}
                  {activeTab === 'history' && 'Activity History'}
                </h2>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {activeTab === 'history' ? (
                  activities.length === 0 ? (
                    <div className="text-center py-8">
                      <FiClock className="mx-auto text-4xl text-gray-300 mb-2" />
                      <p className="text-gray-500 text-sm">No activity history yet</p>
                    </div>
                  ) : (
                    activities.map((activity) => (
                      <div
                        key={activity.id}
                        className="border rounded-lg p-3 hover:shadow-md transition-shadow"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-medium text-sm">
                            Delivery #{activity.delivery_id}
                          </span>
                          {getStatusBadge(activity.status)}
                        </div>
                        <p className="text-xs text-gray-500">
                          {new Date(activity.date).toLocaleString()}
                        </p>
                      </div>
                    ))
                  )
                ) : filteredDeliveries.length === 0 ? (
                  <div className="text-center py-8">
                    <FiPackage className="mx-auto text-4xl text-gray-300 mb-2" />
                    <p className="text-gray-500 text-sm">
                      No {activeTab === 'active' ? 'active' : 'completed'} deliveries
                    </p>
                  </div>
                ) : (
                  filteredDeliveries.map((delivery) => (
                    <motion.div
                      key={delivery.id}
                      whileHover={{ scale: 1.02 }}
                      onClick={() => setSelectedDelivery(delivery)}
                      className={`border rounded-lg p-3 cursor-pointer transition-all ${
                        selectedDelivery?.id === delivery.id
                          ? 'ring-2 ring-[#9C4A15] bg-orange-50'
                          : 'hover:border-[#9C4A15]'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-medium" style={{ color: '#2A1803' }}>
                          Order #{delivery.order_id}
                        </span>
                        {getStatusBadge(delivery.status)}
                      </div>
                      <p className="text-xs text-gray-600 mb-1">{delivery.customer_name}</p>
                      <p className="text-xs text-gray-500 truncate">{delivery.delivery_address}</p>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </motion.div>

          {/* Delivery Details */}
          <motion.div
            variants={slideInRight}
            initial="initial"
            animate="animate"
            className="lg:col-span-2"
          >
            {selectedDelivery ? (
              <div className="bg-white rounded-xl shadow-lg h-[calc(100vh-300px)] flex flex-col">
                <div
                  className={`p-6 border-b rounded-t-xl ${getStatusColor(selectedDelivery.status)}`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-xl font-bold" style={{ color: '#2A1803' }}>
                        Order #{selectedDelivery.order_id}
                      </h2>
                      <p className="text-sm text-gray-600 mt-1">
                        Assigned on {new Date(selectedDelivery.assigned_date).toLocaleString()}
                      </p>
                    </div>
                    {getStatusBadge(selectedDelivery.status)}
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                  {/* Customer Information */}
                  <div className="mb-6">
                    <h3 className="font-medium mb-3" style={{ color: '#2A1803' }}>
                      Customer Information
                    </h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <FiUser className="text-gray-400 w-4 h-4" />
                        <span className="font-medium">{selectedDelivery.customer_name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <FiPhone className="text-gray-400 w-4 h-4" />
                        <span>{selectedDelivery.customer_contact}</span>
                      </div>
                      <div className="flex items-start gap-2 text-sm">
                        <FiMapPin className="text-gray-400 w-4 h-4 mt-0.5" />
                        <span>{selectedDelivery.delivery_address}</span>
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="mb-6">
                    <h3 className="font-medium mb-3" style={{ color: '#2A1803' }}>
                      Order Items
                    </h3>
                    <div className="space-y-2">
                      {selectedDelivery.items?.map((item, index) => (
                        <div
                          key={index}
                          className="flex justify-between text-sm py-2 border-b last:border-0"
                        >
                          <span>
                            {item.quantity}x {item.product_name}
                          </span>
                          <span className="font-medium" style={{ color: '#9C4A15' }}>
                            ₱{(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Order Summary */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Subtotal</span>
                        <span className="font-medium">
                          ₱{selectedDelivery.subtotal?.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Delivery Fee</span>
                        <span className="font-medium">
                          ₱{selectedDelivery.delivery_fee?.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between font-medium pt-2 border-t">
                        <span>Total</span>
                        <span style={{ color: '#9C4A15' }}>
                          ₱{selectedDelivery.total?.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Delivery Timeline */}
                  {selectedDelivery.timeline && (
                    <div className="mb-6">
                      <h3 className="font-medium mb-3" style={{ color: '#2A1803' }}>
                        Delivery Timeline
                      </h3>
                      <div className="space-y-3">
                        {selectedDelivery.timeline.map((event, index) => (
                          <div key={index} className="flex gap-3">
                            <div className="relative">
                              <div
                                className={`w-3 h-3 rounded-full mt-1 ${
                                  event.completed ? 'bg-green-500' : 'bg-gray-300'
                                }`}
                              />
                              {index < selectedDelivery.timeline.length - 1 && (
                                <div className="absolute top-4 left-1.5 w-0.5 h-8 bg-gray-300 -translate-x-1/2" />
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-medium">{event.status}</p>
                              <p className="text-xs text-gray-500">{event.time}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                {selectedDelivery.status !== 'COMPLETED' &&
                  selectedDelivery.status !== 'CANCELLED' && (
                    <div className="p-6 border-t bg-gray-50 rounded-b-xl">
                      <div className="flex gap-3">
                        {selectedDelivery.status === 'PENDING' && (
                          <button
                            onClick={() =>
                              handleStatusUpdate(selectedDelivery.id, 'OUT-FOR-DELIVERY')
                            }
                            className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                          >
                            Start Delivery
                          </button>
                        )}
                        {selectedDelivery.status === 'OUT-FOR-DELIVERY' && (
                          <>
                            <button
                              onClick={() => handleStatusUpdate(selectedDelivery.id, 'COMPLETED')}
                              className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                            >
                              Mark as Completed
                            </button>
                            <button
                              onClick={() => handleStatusUpdate(selectedDelivery.id, 'PENDING')}
                              className="px-4 py-3 border border-red-500 text-red-600 rounded-lg font-medium hover:bg-red-50 transition-colors"
                            >
                              Report Issue
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  )}
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-lg h-[calc(100vh-300px)] flex items-center justify-center">
                <div className="text-center">
                  <FiPackage className="mx-auto text-5xl text-gray-300 mb-3" />
                  <p className="text-gray-500">Select a delivery to view details</p>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default RiderDashboard
