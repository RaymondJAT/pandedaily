// components/dashboard modal/AssignRiderModal.jsx
import { useState, useEffect } from 'react'
import { Modal, Select, message } from 'antd'
import { FiTruck, FiUser, FiPhone } from 'react-icons/fi'
import { assignRiderToDelivery, getAvailableRiders } from '../../services/api'

const AssignRiderModal = ({ delivery, isOpen, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false)
  const [riders, setRiders] = useState([])
  const [selectedRiderId, setSelectedRiderId] = useState(null)
  const [fetchingRiders, setFetchingRiders] = useState(false)

  useEffect(() => {
    if (isOpen) {
      fetchAvailableRiders()
      // Reset selected rider when modal opens
      setSelectedRiderId(null)
    }
  }, [isOpen])

  const fetchAvailableRiders = async () => {
    setFetchingRiders(true)
    try {
      const response = await getAvailableRiders()
      // Handle the response structure from your API
      const ridersData = response.data || response

      if (Array.isArray(ridersData)) {
        // Filter only active riders
        const activeRiders = ridersData.filter((rider) => rider.status === 'ACTIVE')
        setRiders(activeRiders)
      } else {
        setRiders([])
      }
    } catch (error) {
      console.error('Error fetching riders:', error)
      message.error('Failed to load available riders')
    } finally {
      setFetchingRiders(false)
    }
  }

  const handleAssign = async () => {
    if (!selectedRiderId) {
      message.warning('Please select a rider')
      return
    }

    setLoading(true)
    try {
      // Extract the actual delivery ID
      const deliveryId = delivery.d_id || delivery.id || delivery

      const response = await assignRiderToDelivery(deliveryId, { rider_id: selectedRiderId })
      message.success(response.message || 'Rider assigned successfully')
      onSuccess()
    } catch (error) {
      console.error('Error assigning rider:', error)
      message.error(error.message || 'Failed to assign rider')
    } finally {
      setLoading(false)
    }
  }

  const formatRiderOption = (rider) => ({
    value: rider.id,
    label: (
      <div className="flex items-center gap-3 py-2">
        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
          <FiUser className="w-4 h-4 text-blue-600" />
        </div>
        <div className="flex-1">
          <div className="font-medium">{rider.fullname}</div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <FiPhone className="w-3 h-3" />
            <span>{rider.username}</span>
          </div>
        </div>
      </div>
    ),
  })

  // Get delivery ID for display
  const getDeliveryDisplayId = () => {
    return delivery.d_id || delivery.id || 'N/A'
  }

  // Get order ID for display
  const getOrderDisplayId = () => {
    return delivery.order_id || delivery.or_id || 'N/A'
  }

  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <FiTruck className="w-5 h-5 text-blue-600" />
          <span className="text-lg font-semibold">Assign Rider</span>
        </div>
      }
      open={isOpen}
      onCancel={onClose}
      width={500}
      footer={[
        <button
          key="cancel"
          onClick={onClose}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>,
        <button
          key="assign"
          onClick={handleAssign}
          disabled={loading || !selectedRiderId}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ml-2"
        >
          {loading ? 'Assigning...' : 'Assign Rider'}
        </button>,
      ]}
    >
      <div className="py-4">
        {/* Delivery Info Summary */}
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h3 className="font-medium text-gray-700 mb-2">Delivery Details</h3>
          <div className="text-sm space-y-1">
            <p>
              <span className="text-gray-500">Delivery ID:</span>{' '}
              <span className="font-mono">
                #DEL-{getDeliveryDisplayId().toString().padStart(5, '0')}
              </span>
            </p>
            <p>
              <span className="text-gray-500">Order ID:</span>{' '}
              <span className="font-mono">#{getOrderDisplayId().toString().padStart(5, '0')}</span>
            </p>
            <p>
              <span className="text-gray-500">Customer:</span> {delivery.customer_name || 'N/A'}
            </p>
            <p>
              <span className="text-gray-500">Address:</span> {delivery.customer_address || 'N/A'}
            </p>
            <p>
              <span className="text-gray-500">Current Status:</span>{' '}
              <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full text-xs">
                {delivery.d_status || delivery.status || 'PENDING'}
              </span>
            </p>
          </div>
        </div>

        {/* Rider Selection */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Select Rider <span className="text-red-500">*</span>
          </label>
          <Select
            placeholder="Choose a rider"
            className="w-full"
            loading={fetchingRiders}
            options={riders.map(formatRiderOption)}
            value={selectedRiderId}
            onChange={setSelectedRiderId}
            showSearch
            optionFilterProp="children"
            filterOption={(input, option) => {
              // Custom filter to search by rider name
              if (option?.label?.props?.children) {
                const riderName = option.label.props.children[1].props.children[0].props.children
                return riderName.toLowerCase().includes(input.toLowerCase())
              }
              return false
            }}
            notFoundContent={fetchingRiders ? 'Loading riders...' : 'No available riders found'}
          />
          <p className="text-xs text-gray-500 mt-1">
            Select an available rider to assign to this delivery. Only active riders are shown.
          </p>
        </div>
      </div>
    </Modal>
  )
}

export default AssignRiderModal
