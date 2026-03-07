import { useState, useEffect, useMemo, useCallback } from 'react'
import PlatformTable from '../../components/PlatformTable'
import {
  FiPackage,
  FiUser,
  FiTruck,
  FiClock,
  FiCheckCircle,
  FiAlertCircle,
  FiPhone,
  FiX,
} from 'react-icons/fi'
import { deliveryColumns } from '../../mapping/deliveryColumns'
import { getDeliveries, getDeliveryById, assignRiderToDelivery } from '../../services/api'
import ViewDelivery from '../../components/dashboard modal/ViewDelivery'
import AssignRider from '../../components/dashboard modal/AssignRider'

const Delivery = () => {
  const [deliveries, setDeliveries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [sortKey, setSortKey] = useState('d_createddate')
  const [sortDirection, setSortDirection] = useState('desc')
  const [statusFilter, setStatusFilter] = useState('')
  const [scheduleFilter, setScheduleFilter] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRows, setSelectedRows] = useState([])
  const [selectAll, setSelectAll] = useState(false)

  const [viewingDeliveryId, setViewingDeliveryId] = useState(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isAssignRiderModalOpen, setIsAssignRiderModalOpen] = useState(false)
  const [selectedDelivery, setSelectedDelivery] = useState(null)

  const columnsWithRender = useMemo(() => {
    return deliveryColumns.map((col) => {
      const baseColumn = {
        ...col,
        headerClassName: 'text-center font-semibold',
        cellClassName: 'text-center align-middle',
      }

      switch (col.key) {
        case 'd_id':
          return {
            ...baseColumn,
            render: (value) => {
              if (value === undefined || value === null) {
                return <span className="font-mono font-semibold text-gray-400">N/A</span>
              }
              return (
                <div className="flex justify-center">
                  <span className="font-mono font-semibold text-blue-700 text-xs sm:text-sm">
                    #DEL-{value.toString().padStart(5, '0')}
                  </span>
                </div>
              )
            },
          }

        case 'order_id':
          return {
            ...baseColumn,
            render: (value) => (
              <div className="flex justify-center">
                <span className="font-mono text-[10px] sm:text-sm font-medium text-gray-700">
                  #{value?.toString().padStart(5, '0') || 'N/A'}
                </span>
              </div>
            ),
          }

        case 'd_createddate':
          return {
            ...baseColumn,
            render: (value) => {
              if (!value) return <span className="text-gray-400 text-xs">N/A</span>

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
              } catch {
                return <span className="text-gray-400 text-xs">Invalid date</span>
              }
            },
          }

        case 'customer_name':
          return {
            ...baseColumn,
            render: (value, row) => (
              <div className="flex items-center justify-center gap-1 sm:gap-2">
                <FiUser className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                <span
                  className="font-medium text-gray-800 text-xs sm:text-sm truncate max-w-20 sm:max-w-30"
                  title={value}
                >
                  {value || 'N/A'}
                </span>
              </div>
            ),
          }

        case 'rider_name':
          return {
            ...baseColumn,
            render: (value, row) => (
              <div className="flex flex-col items-center justify-center">
                {value ? (
                  <>
                    <div className="flex items-center gap-1 sm:gap-2">
                      <FiTruck className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                      <span className="font-medium text-gray-800 text-xs sm:text-sm truncate max-w-17.5 sm:max-w-25">
                        {value}
                      </span>
                    </div>
                    {row.rider_contact && (
                      <div className="flex items-center gap-1 mt-0.5 text-[8px] sm:text-xs text-gray-500">
                        <FiPhone className="w-2 h-2 sm:w-3 sm:h-3" />
                        <span className="truncate max-w-15 sm:max-w-25">{row.rider_contact}</span>
                      </div>
                    )}
                  </>
                ) : (
                  <span className="text-gray-400 text-xs italic">Not assigned</span>
                )}
              </div>
            ),
          }

        case 'd_status':
          return {
            ...baseColumn,
            render: (value) => {
              const statusConfig = {
                PENDING: {
                  icon: FiClock,
                  bg: 'bg-yellow-100',
                  text: 'text-yellow-800',
                  border: 'border-yellow-200',
                  label: 'Pending',
                },
                'FOR-PICK-UP': {
                  icon: FiPackage,
                  bg: 'bg-blue-100',
                  text: 'text-blue-800',
                  border: 'border-blue-200',
                  label: 'For Pick-up',
                },
                'OUT-FOR-DELIVERY': {
                  icon: FiTruck,
                  bg: 'bg-amber-100',
                  text: 'text-amber-800',
                  border: 'border-amber-200',
                  label: 'Out for Delivery',
                },
                COMPLETE: {
                  icon: FiCheckCircle,
                  bg: 'bg-green-100',
                  text: 'text-green-800',
                  border: 'border-green-200',
                  label: 'Complete',
                },
                CANCELLED: {
                  icon: FiAlertCircle,
                  bg: 'bg-red-100',
                  text: 'text-red-800',
                  border: 'border-red-200',
                  label: 'Cancelled',
                },
              }

              const config = statusConfig[value] || {
                icon: FiAlertCircle,
                bg: 'bg-gray-100',
                text: 'text-gray-800',
                border: 'border-gray-200',
                label: value || 'Unknown',
              }

              const Icon = config.icon

              return (
                <div className="flex justify-center">
                  <span
                    className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold border flex items-center gap-1 ${config.bg} ${config.text} ${config.border}`}
                  >
                    <Icon className="w-2 h-2 sm:w-3 sm:h-3" />
                    <span className="truncate max-w-12.5 sm:max-w-none">{config.label}</span>
                  </span>
                </div>
              )
            },
          }

        case 'schedule_status':
          return {
            ...baseColumn,
            render: (value) => {
              const config = {
                PENDING: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Pending' },
                ASSIGNED: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Assigned' },
                'OUT-FOR-DELIVERY': {
                  bg: 'bg-amber-100',
                  text: 'text-amber-800',
                  label: 'Out for Delivery',
                },
                COMPLETE: { bg: 'bg-green-100', text: 'text-green-800', label: 'Complete' },
              }

              const status = config[value] || {
                bg: 'bg-gray-100',
                text: 'text-gray-800',
                label: value,
              }

              return (
                <span
                  className={`px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs ${status.bg} ${status.text}`}
                >
                  {status.label}
                </span>
              )
            },
          }

        default:
          return baseColumn
      }
    })
  }, [])

  // Fetch deliveries from API
  const fetchDeliveries = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await getDeliveries()
      const data = response.data || response

      if (Array.isArray(data)) {
        const transformedData = data.map((delivery) => ({
          id: delivery.d_id || delivery.id || 0,
          d_id: delivery.d_id || delivery.id || 0,
          d_delivery_schedule_id: delivery.d_delivery_schedule_id || delivery.schedule_id || 0,
          d_rider_id: delivery.d_rider_id || delivery.rider_id || null,
          d_status: delivery.d_status || delivery.status || 'PENDING',
          d_createddate:
            delivery.d_createddate || delivery.createddate || delivery.created_at || '',
          schedule_id: delivery.schedule_id || delivery.ds_id || 0,
          schedule_name: delivery.schedule_name || delivery.ds_name || '',
          schedule_date: delivery.schedule_date || delivery.ds_date || '',
          schedule_time:
            delivery.schedule_start_time && delivery.schedule_end_time
              ? `${delivery.schedule_start_time} - ${delivery.schedule_end_time}`
              : '',
          schedule_status: delivery.schedule_status || delivery.ds_status || '',
          schedule_cutoff: delivery.schedule_cutoff || delivery.ds_cutoff || '',
          order_id: delivery.order_id || delivery.or_id || 0,
          order_total: delivery.order_total || delivery.or_total || 0,
          order_status: delivery.order_status || delivery.or_status || '',
          order_date: delivery.order_date || delivery.or_createddate || '',
          customer_name: delivery.customer_name || delivery.c_fullname || 'Guest Customer',
          customer_address: delivery.customer_address || delivery.c_address || '',
          customer_contact: delivery.customer_contact || delivery.c_contact || '',
          rider_name: delivery.rider_name || delivery.r_fullname || '',
          rider_contact: delivery.rider_contact || delivery.r_contact || '',
          rider_status: delivery.rider_status || delivery.r_status || '',
          ...delivery,
        }))

        setDeliveries(transformedData)
      } else {
        console.error('Invalid data format:', data)
        setError('Invalid data format received from server. Expected an array.')
        setDeliveries([])
      }
    } catch (err) {
      console.error('Error fetching deliveries:', err)
      setError(err.message || 'Failed to fetch deliveries. Please try again.')
      setDeliveries([])
    } finally {
      setLoading(false)
    }
  }, [])

  // Initial fetch
  useEffect(() => {
    fetchDeliveries()
  }, [fetchDeliveries])

  // Get unique values for filter dropdowns
  const uniqueStatuses = useMemo(() => {
    if (!Array.isArray(deliveries)) return []
    return Array.from(new Set(deliveries.map((item) => item.d_status))).filter(
      (status) => status !== undefined && status !== null && status !== '',
    )
  }, [deliveries])

  const uniqueScheduleStatuses = useMemo(() => {
    if (!Array.isArray(deliveries)) return []
    return Array.from(new Set(deliveries.map((item) => item.schedule_status))).filter(
      (status) => status !== undefined && status !== null && status !== '',
    )
  }, [deliveries])

  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    if (!Array.isArray(deliveries)) return []

    let filtered = [...deliveries]

    if (statusFilter !== '') {
      filtered = filtered.filter((item) => item.d_status === statusFilter)
    }

    if (scheduleFilter !== '') {
      filtered = filtered.filter((item) => item.schedule_status === scheduleFilter)
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (item) =>
          (item.d_id && item.d_id.toString().includes(query)) ||
          (item.order_id && item.order_id.toString().includes(query)) ||
          (item.customer_name && item.customer_name.toLowerCase().includes(query)) ||
          (item.rider_name && item.rider_name.toLowerCase().includes(query)) ||
          (item.schedule_name && item.schedule_name.toLowerCase().includes(query)),
      )
    }

    return filtered.sort((a, b) => {
      if (sortKey === 'd_id' || sortKey === 'order_id') {
        const aId = a[sortKey] || 0
        const bId = b[sortKey] || 0
        return sortDirection === 'asc' ? aId - bId : bId - aId
      }

      if (sortKey === 'd_createddate' || sortKey === 'order_date' || sortKey === 'schedule_date') {
        const aDate = a[sortKey] ? new Date(a[sortKey]).getTime() : 0
        const bDate = b[sortKey] ? new Date(b[sortKey]).getTime() : 0
        return sortDirection === 'asc' ? aDate - bDate : bDate - aDate
      }

      if (sortKey === 'order_total') {
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
  }, [deliveries, sortKey, sortDirection, statusFilter, scheduleFilter, searchQuery])

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

  const handleViewDelivery = (id) => {
    const actualId = typeof id === 'object' ? id.d_id || id.id || id : id
    setViewingDeliveryId(actualId)
    setIsViewModalOpen(true)
  }

  const handleAssignRider = async (delivery) => {
    try {
      const actualId =
        typeof delivery === 'object' ? delivery.d_id || delivery.id || delivery : delivery
      const response = await getDeliveryById(actualId)
      const deliveryData = response.data || response
      setSelectedDelivery(deliveryData)
      setIsAssignRiderModalOpen(true)
    } catch (err) {
      console.error('Error fetching delivery details:', err)
      setSelectedDelivery(delivery)
      setIsAssignRiderModalOpen(true)
    }
  }

  const clearFilters = () => {
    setStatusFilter('')
    setScheduleFilter('')
    setSearchQuery('')
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-[#9C4A15] mx-auto"></div>
          <p className="mt-3 sm:mt-4 text-sm sm:text-base text-gray-600">Loading deliveries...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-xl sm:text-2xl mb-2">⚠️</div>
          <p className="text-red-600 font-medium text-sm sm:text-base mb-2">
            Error loading deliveries
          </p>
          <p className="text-gray-600 text-xs sm:text-sm mb-4 wrap-break-words">{error}</p>
          <button
            onClick={fetchDeliveries}
            className="px-3 sm:px-4 py-1.5 sm:py-2 bg-[#9C4A15] hover:bg-[#8a3f12] text-[#F5EFE7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9C4A15] focus:ring-offset-2 text-xs sm:text-sm flex items-center gap-2 transition-colors cursor-pointer mx-auto"
          >
            <FiX className="w-3 h-3 sm:w-4 sm:h-4" />
            <span>Retry</span>
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 min-h-0 p-2 sm:p-3">
        <div className="bg-component shadow-lg rounded-lg border border-slate-400 mb-2 sm:mb-3">
          <div className="px-3 sm:px-4 py-2 sm:py-1">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 text-center sm:text-left">
                  Delivery Management
                </h1>
                <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">
                  Manage and track all delivery operations
                </p>
              </div>
            </div>
            <p className="text-xs text-gray-600 mt-1 sm:hidden">
              Manage and track delivery operations
            </p>
          </div>

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
                      {status.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                    </option>
                  ))}
                </select>

                <select
                  className="flex-1 px-3 py-2 border border-slate-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9C4A15] text-sm"
                  value={scheduleFilter}
                  onChange={(e) => setScheduleFilter(e.target.value)}
                >
                  <option value="">All Schedule</option>
                  {uniqueScheduleStatuses.map((status) => (
                    <option key={status} value={status}>
                      {status.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:flex-none">
                <input
                  type="text"
                  placeholder="Search deliveries..."
                  className="w-full md:w-80 px-3 py-2 border border-slate-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9C4A15] text-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              {(statusFilter || scheduleFilter || searchQuery) && (
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

        <div className="h-[calc(100vh-250px)] sm:h-[calc(100vh-280px)] lg:h-[calc(100vh-250px)] xl:h-[calc(100vh-220px)] overflow-hidden">
          <div className="bg-component shadow-lg rounded-lg border border-slate-400 h-full flex flex-col p-2">
            {filteredAndSortedData.length === 0 ? (
              <div className="flex-1 flex items-center justify-center p-4">
                <div className="text-center">
                  <FiPackage className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-3 sm:mb-4" />
                  <p className="text-gray-500 text-sm sm:text-base">No deliveries found</p>
                  {searchQuery || statusFilter || scheduleFilter ? (
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
                    <p className="text-gray-400 text-xs sm:text-sm mt-2">
                      No delivery data available
                    </p>
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
                  onView: (row) => handleViewDelivery(row.d_id || row.id || row),
                  showEdit: true,
                  onEdit: (row) => handleAssignRider(row),
                  editLabel: 'Assign Rider',
                  editButtonClassName: 'bg-blue-600 hover:bg-blue-700 text-white',
                  editIcon: FiTruck,
                }}
              />
            )}
          </div>
        </div>
      </div>

      {isViewModalOpen && (
        <ViewDelivery
          deliveryId={viewingDeliveryId}
          isOpen={isViewModalOpen}
          onClose={() => {
            setIsViewModalOpen(false)
            setViewingDeliveryId(null)
          }}
          onRefresh={fetchDeliveries}
        />
      )}

      {isAssignRiderModalOpen && selectedDelivery && (
        <AssignRider
          delivery={selectedDelivery}
          isOpen={isAssignRiderModalOpen}
          onClose={() => {
            setIsAssignRiderModalOpen(false)
            setSelectedDelivery(null)
          }}
          onSuccess={() => {
            fetchDeliveries()
            setIsAssignRiderModalOpen(false)
            setSelectedDelivery(null)
          }}
        />
      )}
    </div>
  )
}

export default Delivery
