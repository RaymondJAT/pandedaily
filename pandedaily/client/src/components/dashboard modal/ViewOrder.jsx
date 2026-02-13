import { useState, useEffect } from 'react'
import { Modal, Table, Tag, Descriptions, Card } from 'antd'
import { FiPackage, FiCreditCard, FiCalendar } from 'react-icons/fi'
import { getOrderItem } from '../../services/api'

const ViewOrder = ({ orderId, isOpen, onClose, onRefresh }) => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [order, setOrder] = useState(null)
  const [items, setItems] = useState([])

  const statusConfig = {
    PAID: {
      color: 'green',
      label: 'Paid',
    },
    'ON-DELIVERY': {
      color: 'orange',
      label: 'On Delivery',
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
      // Extract the actual ID from the orderId prop
      const actualOrderId = extractOrderId(orderId)

      if (!actualOrderId) {
        throw new Error('Invalid order ID')
      }

      const response = await getOrderItem(actualOrderId)

      if (response && response.order) {
        setOrder(response.order)
        setItems(response.items?.data || [])
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

  // Helper function to extract order ID
  const extractOrderId = (id) => {
    if (!id) return null

    // If it's a number or string, use it directly
    if (typeof id === 'number' || typeof id === 'string') {
      return id
    }

    // If it's an object, try to get or_id or id property
    if (typeof id === 'object') {
      return id.or_id || id.id || null
    }

    return null
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

  const formatCurrency = (amount) => {
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

  // Table columns for order items - removed Total column
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
      render: (text) => (
        <span className="font-medium">
          {parseFloat(text || 0).toLocaleString('en-PH', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </span>
      ),
    },
    {
      title: 'Unit Price',
      dataIndex: 'price',
      key: 'price',
      render: (text) => <span className="font-medium">{formatCurrency(text)}</span>,
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

  return (
    <Modal
      title={modalTitle}
      open={isOpen}
      onCancel={onClose}
      width={800}
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
                  <span>{formatDate(order.or_createddate)}</span>
                </div>
              </Descriptions.Item>
              <Descriptions.Item label="Total Amount">
                <span className="font-bold text-green-700">{formatCurrency(order.or_total)}</span>
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
                  summary={() => (
                    <Table.Summary.Row>
                      <Table.Summary.Cell index={0} colSpan={3}>
                        <span className="font-semibold">Subtotal</span>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={1}>
                        <span className="font-semibold">{formatCurrency(calculateSubtotal())}</span>
                      </Table.Summary.Cell>
                    </Table.Summary.Row>
                  )}
                />

                {/* Order Summary */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex justify-end">
                    <div className="w-64 space-y-2">
                      {/* Subtotal is now shown in the table summary */}

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
                        <span className="text-green-700">{formatCurrency(order.or_total)}</span>
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
