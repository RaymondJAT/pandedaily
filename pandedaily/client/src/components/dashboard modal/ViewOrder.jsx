import { useState, useEffect } from 'react'
import { Modal, Table, Tag, Descriptions, Card, message } from 'antd'
import { FiPackage, FiCreditCard, FiCalendar, FiCheckCircle, FiXCircle } from 'react-icons/fi'
import { getOrderItem, updateOrder } from '../../services/api'

const ViewOrder = ({ orderId, isOpen, onClose, onRefresh }) => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [order, setOrder] = useState(null)
  const [items, setItems] = useState([])
  const [actionLoading, setActionLoading] = useState(false)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const statusConfig = {
    PAID: {
      color: 'blue',
      label: 'Paid',
    },
    APPROVED: {
      color: 'green',
      label: 'Approved',
    },
    REJECTED: {
      color: 'red',
      label: 'Rejected',
    },
    'FOR-PICK-UP': {
      color: 'purple',
      label: 'For Pick-Up',
    },
    'OUT-FOR-DELIVERY': {
      color: 'orange',
      label: 'Out for Delivery',
    },
    COMPLETE: {
      color: 'green',
      label: 'Complete',
    },
    PENDING: {
      color: 'gray',
      label: 'Pending',
    },
  }

  useEffect(() => {
    if (isOpen && orderId) {
      fetchOrderDetails()
    }
  }, [isOpen, orderId])

  const fetchOrderDetails = async () => {
    setLoading(true)
    setError(null)
    setOrder(null)
    setItems([])

    try {
      const actualOrderId = extractOrderId(orderId)

      if (!actualOrderId) {
        throw new Error('Invalid order ID')
      }

      const response = await getOrderItem(actualOrderId)

      if (response && response.order) {
        setOrder(response.order)

        const itemsData = response.items?.data || []
        const transformedItems = itemsData.map((item) => ({
          id: item.id || item.oi_id,
          product_name: item.product_name || 'Unknown Product',
          category_name: item.category_name || 'Uncategorized',
          quantity: item.quantity || item.oi_quantity || 0,
          price: item.price || item.oi_price || 0,
          ...item,
        }))

        setItems(transformedItems)
      } else {
        setError('No order data found')
      }
    } catch (err) {
      console.error('Error fetching order details:', err)
      setError(err.message || 'Failed to load order details')
    } finally {
      setLoading(false)
    }
  }

  const extractOrderId = (id) => {
    if (!id) return null
    if (typeof id === 'number' || typeof id === 'string') {
      return id
    }
    if (typeof id === 'object') {
      return id.or_id || id.id || null
    }
    return null
  }

  const handleApprove = async () => {
    try {
      setActionLoading(true)
      const actualOrderId = extractOrderId(orderId)
      const response = await updateOrder(actualOrderId, { status: 'APPROVED' })
      message.success(response.message || 'Order approved successfully')
      await fetchOrderDetails()
      if (onRefresh) onRefresh()
    } catch (err) {
      console.error('Error approving order:', err)
      message.error(err.message || 'Failed to approve order')
    } finally {
      setActionLoading(false)
    }
  }

  const handleReject = async () => {
    try {
      setActionLoading(true)
      const actualOrderId = extractOrderId(orderId)
      const response = await updateOrder(actualOrderId, { status: 'REJECTED' })
      message.success(response.message || 'Order rejected successfully')
      await fetchOrderDetails()
      if (onRefresh) onRefresh()
    } catch (err) {
      console.error('Error rejecting order:', err)
      message.error(err.message || 'Failed to reject order')
    } finally {
      setActionLoading(false)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'

    // For server-side rendering, return a simple format
    if (!isClient) {
      const date = new Date(dateString)
      return date.toISOString().split('T')[0]
    }

    // Only use locale-specific formatting on the client
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

  const formatCurrency = (amount) => {
    // For server-side rendering, return a simple format
    if (!isClient) {
      return `₱${parseFloat(amount || 0).toFixed(2)}`
    }

    // Use locale-specific formatting on client
    return `₱${parseFloat(amount || 0).toLocaleString('en-PH', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`
  }

  const getStatusTag = (status) => {
    const upperStatus = status?.toUpperCase() || 'PENDING'
    const config = statusConfig[upperStatus] || statusConfig.PENDING
    return <Tag color={config.color}>{config.label}</Tag>
  }

  const canModifyStatus = () => {
    if (!order) return false
    const currentStatus = order.or_status?.toUpperCase()
    return currentStatus === 'PAID'
  }

  const itemColumns = [
    {
      title: 'Product',
      dataIndex: 'product_name',
      key: 'product_name',
      render: (text) => (
        <div className="flex items-center">
          <FiPackage className="mr-2 text-gray-400" />
          <span>{text || 'Unknown Product'}</span>
        </div>
      ),
    },
    {
      title: 'Category',
      dataIndex: 'category_name',
      key: 'category_name',
      render: (text) => <Tag color="blue">{text || 'Uncategorized'}</Tag>,
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (text) => <span className="font-medium">{parseFloat(text || 0).toFixed(2)}</span>,
    },
    {
      title: 'Unit Price',
      dataIndex: 'price',
      key: 'price',
      render: (text) => <span className="font-medium">{formatCurrency(text)}</span>,
    },
    {
      title: 'Subtotal',
      key: 'subtotal',
      render: (_, record) => {
        const subtotal = parseFloat(record.price || 0) * parseFloat(record.quantity || 0)
        return <span className="font-medium text-green-600">{formatCurrency(subtotal)}</span>
      },
    },
  ]

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => {
      const price = parseFloat(item.price || 0)
      const quantity = parseFloat(item.quantity || 0)
      return sum + price * quantity
    }, 0)
  }

  const modalTitle = (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-xl font-bold text-gray-800">
          Order Details #
          {order?.or_id?.toString().padStart(5, '0') ||
            extractOrderId(orderId)?.toString().padStart(5, '0') ||
            '00000'}
        </h2>
      </div>
    </div>
  )

  // Don't render modal content until after client-side hydration
  if (!isClient) {
    return null
  }

  return (
    <Modal
      title={modalTitle}
      open={isOpen}
      onCancel={onClose}
      width={900}
      footer={[
        canModifyStatus() && (
          <button
            key="reject"
            onClick={handleReject}
            disabled={actionLoading}
            className="px-4 py-2 border border-red-300 text-red-600 rounded hover:bg-red-50 transition-colors mr-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex items-center gap-2">
              <FiXCircle />
              <span>Reject Order</span>
            </div>
          </button>
        ),
        canModifyStatus() && (
          <button
            key="approve"
            onClick={handleApprove}
            disabled={actionLoading}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors mr-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex items-center gap-2">
              <FiCheckCircle />
              <span>Approve Order</span>
            </div>
          </button>
        ),
        <button
          key="close"
          onClick={onClose}
          disabled={actionLoading}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Close
        </button>,
      ].filter(Boolean)}
    >
      {loading ? (
        <div className="flex justify-center py-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading order details...</p>
          </div>
        </div>
      ) : error ? (
        <div className="flex justify-center py-10">
          <div className="text-center">
            <div className="text-red-500 text-3xl mb-4">⚠️</div>
            <p className="text-red-600 font-medium mb-2">Error loading order</p>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={fetchOrderDetails}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      ) : !order ? (
        <div className="flex justify-center py-10">
          <div className="text-center">
            <p className="text-gray-500 text-lg">No order data found</p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Order Summary */}
          <Card title="Order Information" size="small">
            <Descriptions column={2}>
              <Descriptions.Item label="Status">{getStatusTag(order.or_status)}</Descriptions.Item>
              <Descriptions.Item label="Order Date">
                <div className="flex items-center">
                  <FiCalendar className="mr-2 text-gray-400" />
                  <span suppressHydrationWarning>{formatDate(order.or_createddate)}</span>
                </div>
              </Descriptions.Item>
              <Descriptions.Item label="Total Amount">
                <span className="font-bold text-green-700" suppressHydrationWarning>
                  {formatCurrency(order.or_total)}
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="Payment Type">
                <div className="flex items-center">
                  <FiCreditCard className="mr-2 text-gray-400" />
                  <span>{order.or_payment_type || 'N/A'}</span>
                </div>
              </Descriptions.Item>
              <Descriptions.Item label="Payment Reference" span={2}>
                <span className="font-mono text-sm break-all">
                  {order.or_payment_reference || 'N/A'}
                </span>
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {/* Order Items */}
          <Card title={`Order Items (${items.length})`} size="small">
            {items.length === 0 ? (
              <div className="text-center py-8">
                <FiPackage className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No items found in this order</p>
              </div>
            ) : (
              <>
                <Table
                  columns={itemColumns}
                  dataSource={items.map((item, index) => ({ ...item, key: item.id || index }))}
                  pagination={false}
                  size="small"
                  scroll={{ y: 250 }}
                />

                {/* Order Summary */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex justify-end">
                    <div className="w-72 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Subtotal</span>
                        <span className="font-medium">{formatCurrency(calculateSubtotal())}</span>
                      </div>

                      {Math.abs(calculateSubtotal() - parseFloat(order.or_total || 0)) > 0.01 && (
                        <div className="flex justify-between text-sm text-amber-600">
                          <span>Adjustments</span>
                          <span>
                            {formatCurrency(parseFloat(order.or_total) - calculateSubtotal())}
                          </span>
                        </div>
                      )}

                      <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
                        <span className="text-gray-800">Total</span>
                        <span className="text-green-700" suppressHydrationWarning>
                          {formatCurrency(order.or_total)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </Card>

          {/* Additional Details */}
          {order.or_details && (
            <Card title="Additional Details" size="small">
              <p className="text-gray-800 whitespace-pre-wrap">{order.or_details}</p>
            </Card>
          )}
        </div>
      )}
    </Modal>
  )
}

export default ViewOrder
