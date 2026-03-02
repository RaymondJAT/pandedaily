import { useState, useEffect, useMemo, useCallback } from 'react'
import PlatformTable from '../../components/PlatformTable'
import {
  FiUser,
  FiCheckCircle,
  FiClock,
  FiTruck,
  FiCreditCard,
  FiXCircle,
  FiPackage,
  FiX,
} from 'react-icons/fi'
import { orderColumns } from '../../mapping/orderColumns'
import { getOrders } from '../../services/api'
import ViewOrder from '../../components/dashboard modal/ViewOrder'

const Orders = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [sortKey, setSortKey] = useState('or_createddate')
  const [sortDirection, setSortDirection] = useState('desc')
  const [statusFilter, setStatusFilter] = useState('')
  const [paymentFilter, setPaymentFilter] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRows, setSelectedRows] = useState([])
  const [selectAll, setSelectAll] = useState(false)

  const [viewingOrderId, setViewingOrderId] = useState(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)

  const columnsWithRender = useMemo(() => {
    return orderColumns.map((col) => {
      const baseColumn = {
        ...col,
        headerClassName: 'text-center font-semibold',
        cellClassName: 'text-center align-middle',
      }

      switch (col.key) {
        case 'or_id':
          return {
            ...baseColumn,
            render: (value) => {
              if (value === undefined || value === null) {
                return <span className="font-mono font-semibold text-gray-400">N/A</span>
              }
              return (
                <div className="flex justify-center">
                  <span className="font-mono font-semibold text-blue-700 text-xs sm:text-sm">
                    #{value.toString().padStart(5, '0')}
                  </span>
                </div>
              )
            },
          }

        case 'or_date':
          return {
            ...baseColumn,
            render: (value) => {
              if (!value)
                return (
                  <div className="flex justify-center">
                    <span className="text-gray-400 text-xs">N/A</span>
                  </div>
                )

              try {
                const date = new Date(value)
                const formattedDate = date.toLocaleDateString('en-PH', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })
                const formattedTime = date.toLocaleTimeString('en-PH', {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true,
                })

                return (
                  <div className="flex flex-col items-center justify-center">
                    <span className="text-gray-700 text-[10px] sm:text-sm">{formattedDate}</span>
                    <span className="text-gray-500 text-[8px] sm:text-xs">{formattedTime}</span>
                  </div>
                )
              } catch (err) {
                return (
                  <div className="flex justify-center">
                    <span className="text-gray-400 text-xs">Invalid date</span>
                  </div>
                )
              }
            },
          }

        case 'customer_name':
          return {
            ...baseColumn,
            render: (value) => (
              <div className="flex justify-center items-center gap-1 sm:gap-2">
                <FiUser className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                <span
                  className="font-medium text-gray-800 text-xs sm:text-sm truncate max-w-20 sm:max-w-30"
                  title={value}
                >
                  {value || 'Guest Customer'}
                </span>
              </div>
            ),
          }

        case 'or_total':
          return {
            ...baseColumn,
            render: (value) => {
              const amount = parseFloat(value || 0)
              return (
                <div className="flex justify-center">
                  <span className="font-bold text-green-700 text-xs sm:text-sm">
                    ₱
                    {amount.toLocaleString('en-PH', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
              )
            },
          }

        case 'or_status':
          return {
            ...baseColumn,
            render: (value) => {
              const statusConfig = {
                PAID: {
                  icon: FiCheckCircle,
                  bg: 'bg-green-100',
                  text: 'text-green-800',
                  border: 'border-green-200',
                  label: 'Paid',
                },
                APPROVED: {
                  icon: FiCheckCircle,
                  bg: 'bg-blue-100',
                  text: 'text-blue-800',
                  border: 'border-blue-200',
                  label: 'Approved',
                },
                REJECTED: {
                  icon: FiXCircle,
                  bg: 'bg-red-100',
                  text: 'text-red-800',
                  border: 'border-red-200',
                  label: 'Rejected',
                },
                'FOR-PICK-UP': {
                  icon: FiPackage,
                  bg: 'bg-blue-100',
                  text: 'text-blue-800',
                  border: 'border-blue-200',
                  label: 'For Pick-Up',
                },
                'OUT-FOR-DELIVERY': {
                  icon: FiTruck,
                  bg: 'bg-amber-100',
                  text: 'text-amber-800',
                  border: 'border-amber-200',
                  label: 'On Delivery',
                },
                COMPLETE: {
                  icon: FiCheckCircle,
                  bg: 'bg-green-100',
                  text: 'text-green-800',
                  border: 'border-green-200',
                  label: 'Complete',
                },
              }

              const config = statusConfig[value] || {
                icon: FiClock,
                bg: 'bg-gray-100',
                text: 'text-gray-800',
                border: 'border-gray-200',
                label: value || 'Pending',
              }

              const Icon = config.icon

              return (
                <div className="flex justify-center">
                  <span
                    className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold border flex items-center gap-1 ${config.bg} ${config.text} ${config.border}`}
                  >
                    <Icon className="w-3 h-3" />
                    <span className="truncate max-w-12.5 sm:max-w-none">{config.label}</span>
                  </span>
                </div>
              )
            },
          }

        case 'or_payment_type':
          return {
            ...baseColumn,
            render: (value) => (
              <div className="flex justify-center items-center gap-1 sm:gap-2">
                <FiCreditCard className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                <span className="text-gray-700 text-xs sm:text-sm truncate max-w-15 sm:max-w-20">
                  {value || 'N/A'}
                </span>
              </div>
            ),
          }

        case 'or_payment_reference':
          return {
            ...baseColumn,
            render: (value) => (
              <div className="flex justify-center">
                <span
                  className="font-mono text-[10px] sm:text-sm text-gray-600 truncate max-w-17.5 sm:max-w-25"
                  title={value}
                >
                  {value || 'N/A'}
                </span>
              </div>
            ),
          }

        default:
          return baseColumn
      }
    })
  }, [])

  // Fetch orders from API
  const fetchOrders = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await getOrders()

      const data = response.data || response

      if (Array.isArray(data)) {
        // Transform the data to ensure all fields exist
        const transformedData = data.map((order) => ({
          id: order.or_id || order.id || 0,
          or_id: order.or_id || order.id || 0,
          or_createddate: order.or_createddate || order.createddate || order.created_at || '',
          or_customer_id: order.or_customer_id || order.customer_id || 0,
          customer_name: order.customer_name || 'Guest Customer',
          or_total: order.or_total || order.total || 0,
          or_status: order.or_status || order.status || 'pending',
          or_payment_type: order.or_payment_type || order.payment_type || 'Unknown',
          or_payment_reference: order.or_payment_reference || order.payment_reference || '',
          ...order,
        }))

        setOrders(transformedData)
      } else {
        console.error('Invalid data format:', data)
        setError('Invalid data format received from server. Expected an array.')
        setOrders([])
      }
    } catch (err) {
      console.error('Error fetching orders:', err)
      setError(err.message || 'Failed to fetch orders. Please try again.')
      setOrders([])
    } finally {
      setLoading(false)
    }
  }, [])

  // Initial fetch
  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  // Get unique values for filter dropdowns
  const uniqueStatuses = useMemo(() => {
    if (!Array.isArray(orders)) return []
    return Array.from(new Set(orders.map((item) => item.or_status))).filter(
      (status) => status !== undefined && status !== '',
    )
  }, [orders])

  const uniquePaymentTypes = useMemo(() => {
    if (!Array.isArray(orders)) return []
    return Array.from(new Set(orders.map((item) => item.or_payment_type))).filter(
      (type) => type !== undefined && type !== '',
    )
  }, [orders])

  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    if (!Array.isArray(orders)) return []

    let filtered = [...orders]

    // Status filter
    if (statusFilter !== '') {
      filtered = filtered.filter((item) => item.or_status === statusFilter)
    }

    // Payment type filter
    if (paymentFilter !== '') {
      filtered = filtered.filter((item) => item.or_payment_type === paymentFilter)
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (item) =>
          (item.or_id && item.or_id.toString().includes(query)) ||
          (item.customer_name && item.customer_name.toLowerCase().includes(query)) ||
          (item.or_payment_reference && item.or_payment_reference.toLowerCase().includes(query)),
      )
    }

    // Sorting with null-safe comparison
    return filtered.sort((a, b) => {
      if (sortKey === 'or_id') {
        const aId = a[sortKey] || 0
        const bId = b[sortKey] || 0
        return sortDirection === 'asc' ? aId - bId : bId - aId
      }

      if (sortKey === 'or_date') {
        const aDate = a[sortKey] ? new Date(a[sortKey]).getTime() : 0
        const bDate = b[sortKey] ? new Date(b[sortKey]).getTime() : 0
        return sortDirection === 'asc' ? aDate - bDate : bDate - aDate
      }

      if (sortKey === 'or_total') {
        const aTotal = parseFloat(a[sortKey] || 0)
        const bTotal = parseFloat(b[sortKey] || 0)
        return sortDirection === 'asc' ? aTotal - bTotal : bTotal - aTotal
      }

      const aValue = a[sortKey] || ''
      const bValue = b[sortKey] || ''

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
      return 0
    })
  }, [orders, sortKey, sortDirection, statusFilter, paymentFilter, searchQuery])

  const handleSort = (key) => {
    setSortDirection((prev) => (sortKey === key && prev === 'asc' ? 'desc' : 'asc'))
    setSortKey(key)
  }

  const handleSelectionChange = (selectedIds) => {
    setSelectedRows(selectedIds)
  }

  const handleSelectAll = (isSelected, allIds) => {
    setSelectAll(isSelected)
    setSelectedRows(isSelected ? allIds : [])
  }

  const clearFilters = () => {
    setStatusFilter('')
    setPaymentFilter('')
    setSearchQuery('')
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-[#9C4A15] mx-auto"></div>
          <p className="mt-3 sm:mt-4 text-sm sm:text-base text-gray-600">Loading orders...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-xl sm:text-2xl mb-2">⚠️</div>
          <p className="text-red-600 font-medium text-sm sm:text-base mb-2">Error loading orders</p>
          <p className="text-gray-600 text-xs sm:text-sm mb-4 wrap-break-words">{error}</p>
          <button
            onClick={fetchOrders}
            className="px-3 sm:px-4 py-1.5 sm:py-2 bg-[#9C4A15] hover:bg-[#8a3f12] text-[#F5EFE7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9C4A15] focus:ring-offset-2 text-xs sm:text-sm flex items-center gap-2 transition-colors cursor-pointer mx-auto"
          >
            <FiX className="w-3 h-3 sm:w-4 sm:h-4 hidden" />
            <span>Retry</span>
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 min-h-0 p-2 sm:p-3">
        {/* Main header section */}
        <div className="bg-component shadow-lg rounded-lg border border-slate-400 mb-2 sm:mb-3">
          <div className="px-3 sm:px-4 py-2 sm:py-1">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 text-center sm:text-left">
                  Order Management
                </h1>
                <p className="text-xs sm:text-sm text-gray-600 hidden sm:block text-center sm:text-left">
                  View all customer orders and track their status
                </p>
              </div>
            </div>
            {/* Mobile description */}
            <p className="text-xs text-gray-600 mt-1 sm:hidden ">
              Track customer orders and status
            </p>
          </div>

          {/* Filters and search */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center px-3 sm:px-4 pb-3 gap-3">
            <div className="flex flex-wrap gap-2 w-full md:w-auto">
              <div className="flex flex-row gap-2 w-full sm:w-auto">
                <select
                  className="flex-1 px-3 py-2 border border-slate-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9C4A15] text-sm"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="">All Status</option>
                  {uniqueStatuses.map((status) => (
                    <option key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </select>

                <select
                  className="flex-1 px-3 py-2 border border-slate-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9C4A15] text-sm"
                  value={paymentFilter}
                  onChange={(e) => setPaymentFilter(e.target.value)}
                >
                  <option value="">All Payment</option>
                  {uniquePaymentTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:flex-none">
                <input
                  type="text"
                  placeholder="Search orders..."
                  className="w-full md:w-80 px-3 py-2 border border-slate-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9C4A15] text-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              {(statusFilter || paymentFilter || searchQuery) && (
                <button
                  onClick={clearFilters}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-sm text-gray-600 shrink-0"
                  title="Clear filters"
                >
                  <FiX className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Table container - Mobile optimized */}
        <div className="h-[calc(100vh-250px)] sm:h-[calc(100vh-280px)] lg:h-[calc(100vh-250px)] xl:h-[calc(100vh-220px)] overflow-hidden">
          <div className="bg-component shadow-lg rounded-lg border border-slate-400 h-full flex flex-col p-2">
            {filteredAndSortedData.length === 0 ? (
              <div className="flex-1 flex items-center justify-center p-4">
                <div className="text-center">
                  <p className="text-gray-500 text-sm sm:text-base">No orders found</p>
                  {searchQuery || statusFilter || paymentFilter ? (
                    <>
                      <p className="text-gray-400 text-xs sm:text-sm mt-2">
                        Try adjusting your filters
                      </p>
                      <button
                        onClick={clearFilters}
                        className="mt-3 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs sm:text-sm transition-colors"
                      >
                        Clear Filters
                      </button>
                    </>
                  ) : (
                    <p className="text-gray-400 text-xs sm:text-sm mt-2">No order data available</p>
                  )}
                </div>
              </div>
            ) : (
              <PlatformTable
                columns={columnsWithRender}
                data={filteredAndSortedData}
                sortKey={sortKey}
                sortDirection={sortDirection}
                onSort={handleSort}
                maxHeight="calc(100% - 60px)"
                title={null}
                responsive={true}
                containerClassName="h-full"
                selectedRows={selectedRows}
                onSelectionChange={handleSelectionChange}
                selectAll={selectAll}
                onSelectAll={handleSelectAll}
                showActions={true}
                actionButtonProps={{
                  showView: true,
                  onView: (row) => {
                    setViewingOrderId(row.or_id || row.id)
                    setIsViewModalOpen(true)
                  },
                }}
              />
            )}
          </div>
        </div>
      </div>

      {isViewModalOpen && (
        <ViewOrder
          orderId={viewingOrderId}
          isOpen={isViewModalOpen}
          onClose={() => {
            setIsViewModalOpen(false)
            setViewingOrderId(null)
          }}
          onRefresh={fetchOrders}
        />
      )}
    </div>
  )
}

export default Orders
