// src/components/dashboard modal/ViewDelivery.jsx
import { useState, useEffect } from 'react'
import { Modal, Descriptions, Card, Tag, Timeline } from 'antd'
import {
  FiTruck,
  FiCalendar,
  FiUser,
  FiHome,
  FiPhone,
  FiMail,
  FiPackage,
  FiClock,
} from 'react-icons/fi'
import { getDeliveryById, getDeliveryActivitiesById } from '../../services/api'

const ViewDelivery = ({ deliveryId, isOpen, onClose, onRefresh }) => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [delivery, setDelivery] = useState(null)
  const [activities, setActivities] = useState([])

  const deliveryStatusConfig = {
    PENDING: { color: 'default', label: 'Pending' },
    'FOR-PICK-UP': { color: 'blue', label: 'For Pick-up' },
    'OUT-FOR-DELIVERY': { color: 'orange', label: 'Out for Delivery' },
    COMPLETE: { color: 'green', label: 'Complete' },
    CANCELLED: { color: 'red', label: 'Cancelled' },
  }

  const scheduleStatusConfig = {
    PENDING: { color: 'default', label: 'Pending' },
    ASSIGNED: { color: 'blue', label: 'Assigned' },
    'OUT-FOR-DELIVERY': { color: 'orange', label: 'Out for Delivery' },
    COMPLETE: { color: 'green', label: 'Complete' },
  }

  const orderStatusConfig = {
    PENDING: { color: 'default', label: 'Pending' },
    APPROVED: { color: 'blue', label: 'Approved' },
    PAID: { color: 'green', label: 'Paid' },
    'OUT-FOR-DELIVERY': { color: 'orange', label: 'Out for Delivery' },
    COMPLETE: { color: 'green', label: 'Complete' },
    CANCELLED: { color: 'red', label: 'Cancelled' },
  }

  // Extract numeric ID from various possible formats
  const extractNumericId = (id) => {
    if (!id) return null
    if (typeof id === 'number') return id
    if (typeof id === 'string') {
      const parsed = parseInt(id, 10)
      return isNaN(parsed) ? null : parsed
    }
    if (typeof id === 'object') {
      return id.d_id || id.id || null
    }
    return null
  }

  const numericDeliveryId = extractNumericId(deliveryId)

  useEffect(() => {
    if (isOpen && numericDeliveryId) {
      fetchDeliveryDetails()
      fetchDeliveryActivities()
    }
  }, [isOpen, numericDeliveryId])

  const fetchDeliveryDetails = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await getDeliveryById(numericDeliveryId)

      // Handle response structure - API returns { message, count, data }
      let deliveryData
      if (response.data && Array.isArray(response.data)) {
        deliveryData = response.data[0] // Get first item if array
      } else if (response.data) {
        deliveryData = response.data
      } else {
        deliveryData = response
      }

      if (!deliveryData) {
        throw new Error('No delivery data found')
      }

      // Transform the data to match our expected structure
      const transformedData = {
        // Delivery fields
        d_id: deliveryData.d_id || deliveryData.id,
        d_delivery_schedule_id:
          deliveryData.d_delivery_schedule_id || deliveryData.delivery_schedule_id,
        d_rider_id: deliveryData.d_rider_id || deliveryData.rider_id,
        d_status: deliveryData.d_status || deliveryData.status,
        d_createddate: deliveryData.d_createddate || deliveryData.createddate,

        // Schedule fields
        schedule_id: deliveryData.schedule_id || deliveryData.ds_id,
        schedule_name: deliveryData.schedule_name || deliveryData.ds_name,
        schedule_date: deliveryData.schedule_date || deliveryData.ds_date,
        schedule_status: deliveryData.schedule_status || deliveryData.ds_status,
        ds_start_time: deliveryData.ds_start_time,
        ds_end_time: deliveryData.ds_end_time,
        ds_cutoff: deliveryData.ds_cutoff,

        // Order fields
        order_id: deliveryData.order_id || deliveryData.or_id,
        or_customer_id: deliveryData.or_customer_id,
        or_total: deliveryData.or_total,
        order_total: deliveryData.or_total,
        order_status: deliveryData.order_status || deliveryData.or_status,
        order_date: deliveryData.order_date || deliveryData.or_createddate,
        or_payment_type: deliveryData.or_payment_type,
        or_payment_reference: deliveryData.or_payment_reference,

        // Customer fields
        customer_name: deliveryData.customer_name || deliveryData.c_fullname,
        customer_address: deliveryData.customer_address || deliveryData.c_address,
        customer_contact: deliveryData.customer_contact || deliveryData.c_contact,
        customer_email: deliveryData.customer_email,

        // Rider fields
        rider_name: deliveryData.rider_name || deliveryData.r_fullname,
        rider_contact: deliveryData.rider_contact || deliveryData.r_contact,
        rider_status: deliveryData.rider_status,

        // Keep original data
        ...deliveryData,
      }

      setDelivery(transformedData)
    } catch (err) {
      console.error('Error fetching delivery details:', err)
      setError(err.message || 'Failed to load delivery details')
    } finally {
      setLoading(false)
    }
  }

  const fetchDeliveryActivities = async () => {
    try {
      const response = await getDeliveryActivitiesById(numericDeliveryId)

      // Handle response structure
      let activitiesData = []
      if (response.data && Array.isArray(response.data)) {
        activitiesData = response.data
      } else if (Array.isArray(response)) {
        activitiesData = response
      }

      // Transform activities data
      const transformedActivities = activitiesData.map((activity) => ({
        id: activity.id || activity.da_id,
        status: activity.status || activity.da_status,
        remarks: activity.remarks || activity.da_remarks,
        createddate: activity.createddate || activity.da_createddate,
        images: activity.images || [],
      }))

      setActivities(transformedActivities)
    } catch (err) {
      console.error('Error fetching delivery activities:', err)
      setActivities([])
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-PH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      })
    } catch {
      return 'Invalid Date'
    }
  }

  const formatTime = (timeString) => {
    if (!timeString) return 'N/A'
    try {
      const date = new Date(timeString)
      return date.toLocaleTimeString('en-PH', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      })
    } catch {
      return timeString
    }
  }

  const formatCurrency = (amount) => {
    return `₱${parseFloat(amount || 0).toLocaleString('en-PH', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`
  }

  const getStatusTag = (status, type = 'delivery') => {
    if (!status) return <Tag color="default">N/A</Tag>

    let config
    const upperStatus = status.toUpperCase()

    switch (type) {
      case 'delivery':
        config = deliveryStatusConfig[upperStatus] || deliveryStatusConfig.PENDING
        break
      case 'schedule':
        config = scheduleStatusConfig[upperStatus] || scheduleStatusConfig.PENDING
        break
      case 'order':
        config = orderStatusConfig[upperStatus] || orderStatusConfig.PENDING
        break
      default:
        config = { color: 'default', label: status }
    }
    return <Tag color={config.color}>{config.label}</Tag>
  }

  const modalTitle = (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-xl font-bold text-gray-800">
          Delivery Details #
          {delivery?.d_id?.toString().padStart(5, '0') ||
            numericDeliveryId?.toString().padStart(5, '0') ||
            '00000'}
        </h2>
      </div>
    </div>
  )

  return (
    <Modal
      title={modalTitle}
      open={isOpen}
      onCancel={onClose}
      width={900}
      style={{ top: 20 }}
      styles={{
        body: {
          maxHeight: 'calc(100vh - 200px)',
          overflowY: 'auto',
          paddingRight: '8px',
          marginTop: '8px',
        },
      }}
      footer={[
        <button
          key="close"
          onClick={onClose}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors"
        >
          Close
        </button>,
      ]}
    >
      {loading ? (
        <div className="flex justify-center py-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading delivery details...</p>
          </div>
        </div>
      ) : error ? (
        <div className="flex justify-center py-10">
          <div className="text-center">
            <div className="text-red-500 text-3xl mb-4">⚠️</div>
            <p className="text-red-600 font-medium mb-2">Error loading delivery</p>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={fetchDeliveryDetails}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      ) : !delivery ? (
        <div className="flex justify-center py-10">
          <div className="text-center">
            <p className="text-gray-500 text-lg">No delivery data found</p>
          </div>
        </div>
      ) : (
        <div className="space-y-6 pr-1">
          {/* Delivery Information */}
          <Card title="Delivery Information" size="small">
            <Descriptions column={2}>
              <Descriptions.Item label="Delivery Status">
                {getStatusTag(delivery.d_status, 'delivery')}
              </Descriptions.Item>
              <Descriptions.Item label="Created Date">
                <div className="flex items-center">
                  <FiCalendar className="mr-2 text-gray-400" />
                  <span>{formatDate(delivery.d_createddate)}</span>
                </div>
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {/* Schedule Information */}
          <Card title="Schedule Information" size="small">
            <Descriptions column={2}>
              <Descriptions.Item label="Schedule Name">
                <div className="flex items-center">
                  <FiClock className="mr-2 text-gray-400" />
                  <span>{delivery.schedule_name || 'N/A'}</span>
                </div>
              </Descriptions.Item>
              <Descriptions.Item label="Schedule Status">
                {getStatusTag(delivery.schedule_status, 'schedule')}
              </Descriptions.Item>
              <Descriptions.Item label="Schedule Date">
                <div className="flex items-center">
                  <FiCalendar className="mr-2 text-gray-400" />
                  <span>{formatDate(delivery.schedule_date)}</span>
                </div>
              </Descriptions.Item>
              <Descriptions.Item label="Schedule Time">
                <div className="flex items-center">
                  <FiClock className="mr-2 text-gray-400" />
                  <span>
                    {delivery.ds_start_time ? formatTime(delivery.ds_start_time) : 'N/A'} -{' '}
                    {delivery.ds_end_time ? formatTime(delivery.ds_end_time) : 'N/A'}
                  </span>
                </div>
              </Descriptions.Item>
              <Descriptions.Item label="Cut-off Date" span={2}>
                <div className="flex items-center">
                  <FiCalendar className="mr-2 text-gray-400" />
                  <span>{formatDate(delivery.ds_cutoff)}</span>
                </div>
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {/* Customer Information */}
          <Card title="Customer Information" size="small">
            <Descriptions column={2}>
              <Descriptions.Item label="Customer Name" span={2}>
                <div className="flex items-center">
                  <FiUser className="mr-2 text-gray-400" />
                  <span className="font-medium">{delivery.customer_name || 'N/A'}</span>
                </div>
              </Descriptions.Item>
              <Descriptions.Item label="Address" span={2}>
                <div className="flex items-start">
                  <FiHome className="mr-2 text-gray-400 mt-1" />
                  <span>{delivery.customer_address || 'N/A'}</span>
                </div>
              </Descriptions.Item>
              <Descriptions.Item label="Contact Number">
                <div className="flex items-center">
                  <FiPhone className="mr-2 text-gray-400" />
                  <span>{delivery.customer_contact || 'N/A'}</span>
                </div>
              </Descriptions.Item>
              <Descriptions.Item label="Email Address">
                <div className="flex items-center">
                  <FiMail className="mr-2 text-gray-400" />
                  <span>{delivery.customer_email || 'N/A'}</span>
                </div>
              </Descriptions.Item>
              <Descriptions.Item label="Customer ID">
                <span className="font-mono">
                  #{delivery.or_customer_id?.toString().padStart(5, '0') || 'N/A'}
                </span>
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {/* Rider Information */}
          <Card title="Rider Information" size="small">
            {delivery.rider_name ? (
              <Descriptions column={2}>
                <Descriptions.Item label="Rider Name">
                  <div className="flex items-center">
                    <FiTruck className="mr-2 text-gray-400" />
                    <span className="font-medium">{delivery.rider_name}</span>
                  </div>
                </Descriptions.Item>
                <Descriptions.Item label="Contact Number">
                  <div className="flex items-center">
                    <FiPhone className="mr-2 text-gray-400" />
                    <span>{delivery.rider_contact || 'N/A'}</span>
                  </div>
                </Descriptions.Item>
                <Descriptions.Item label="Rider Status">
                  <Tag color={delivery.rider_status === 'ACTIVE' ? 'green' : 'default'}>
                    {delivery.rider_status || 'N/A'}
                  </Tag>
                </Descriptions.Item>
              </Descriptions>
            ) : (
              <div className="text-center py-4">
                <FiTruck className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500">No rider assigned yet</p>
              </div>
            )}
          </Card>

          {/* Order Information */}
          <Card title="Order Information" size="small">
            <Descriptions column={2}>
              <Descriptions.Item label="Order ID">
                <span className="font-mono font-semibold text-blue-700">
                  #{delivery.order_id?.toString().padStart(5, '0')}
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="Order Status">
                {getStatusTag(delivery.order_status, 'order')}
              </Descriptions.Item>
              <Descriptions.Item label="Order Date">
                <div className="flex items-center">
                  <FiCalendar className="mr-2 text-gray-400" />
                  <span>{formatDate(delivery.order_date)}</span>
                </div>
              </Descriptions.Item>
              <Descriptions.Item label="Total Amount">
                <span className="font-bold text-green-700">
                  {formatCurrency(delivery.or_total || delivery.order_total)}
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="Payment Method">
                <div className="flex items-center">
                  <FiPackage className="mr-2 text-gray-400" />
                  <span>{delivery.or_payment_type || 'N/A'}</span>
                </div>
              </Descriptions.Item>
              <Descriptions.Item label="Payment Reference" span={2}>
                <span className="font-mono text-sm break-all">
                  {delivery.or_payment_reference || 'N/A'}
                </span>
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {/* Delivery Activity Timeline */}
          <Card title="Delivery Activity History" size="small">
            {activities.length === 0 ? (
              <div className="text-center py-8">
                <FiClock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No activity records found</p>
              </div>
            ) : (
              <Timeline
                mode="left"
                items={activities.map((activity) => ({
                  color:
                    activity.status === 'COMPLETE'
                      ? 'green'
                      : activity.status === 'CANCELLED'
                        ? 'red'
                        : activity.status === 'OUT-FOR-DELIVERY'
                          ? 'orange'
                          : activity.status === 'FOR-PICK-UP'
                            ? 'blue'
                            : 'gray',
                  label: (
                    <span className="text-xs text-gray-500">
                      {formatDate(activity.createddate)}
                    </span>
                  ),
                  children: (
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {getStatusTag(activity.status, 'delivery')}
                        </span>
                      </div>
                      {activity.remarks && (
                        <p className="text-sm text-gray-600 mt-1">{activity.remarks}</p>
                      )}
                      {activity.images && activity.images.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs text-gray-500 mb-1">
                            {activity.images.length} image(s) attached
                          </p>
                          <div className="flex gap-2">
                            {activity.images.slice(0, 3).map((img, idx) => (
                              <div
                                key={img.image_id || img.id || idx}
                                className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors"
                                title="Click to view image"
                              >
                                <FiPackage className="w-6 h-6 text-gray-400" />
                              </div>
                            ))}
                            {activity.images.length > 3 && (
                              <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                                <span className="text-xs text-gray-500">
                                  +{activity.images.length - 3}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ),
                }))}
              />
            )}
          </Card>
        </div>
      )}
    </Modal>
  )
}

export default ViewDelivery
