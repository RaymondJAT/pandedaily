import { useState, useEffect, useMemo, useCallback } from 'react'
import PlatformTable from '../../components/PlatformTable'
import { FiPlus, FiRefreshCw, FiLock, FiX } from 'react-icons/fi'
import { getAccess } from '../../services/api'
import { accessColumns } from '../../mapping/accessColumns'
import AddAccess from '../../components/dashboard modal/AddAccess'
import EditAccess from '../../components/dashboard modal/EditAccess'
import EditRoutes from '../../components/dashboard modal/EditRoutes'

const Access = () => {
  const [accessData, setAccessData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [sortKey, setSortKey] = useState('id')
  const [sortDirection, setSortDirection] = useState('desc')
  const [statusFilter, setStatusFilter] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRows, setSelectedRows] = useState([])
  const [selectAll, setSelectAll] = useState(false)

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showRoutesModal, setShowRoutesModal] = useState(false)
  const [editingAccess, setEditingAccess] = useState(null)
  const [configuringAccess, setConfiguringAccess] = useState(null)

  // Fetch access levels from API
  const fetchAccessData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await getAccess()
      const data = response.data || response

      if (Array.isArray(data)) {
        const transformedData = data.map((access) => ({
          id: access.ma_id || access.id,
          accessName: access.ma_name || access.name || 'Unknown',
          status: access.ma_status || access.status || 'Active',
          createdAt: access.ma_createddate || access.createddate || new Date().toISOString(),
          ...access,
        }))

        setAccessData(transformedData)
      } else {
        console.error('Invalid data format:', data)
        setError('Invalid data format received from server. Expected an array.')
        setAccessData([])
      }
    } catch (err) {
      console.error('Error fetching access levels:', err)
      setError(err.message || 'Failed to fetch access levels. Please try again.')
      setAccessData([])
    } finally {
      setLoading(false)
    }
  }, [])

  // Initial fetch
  useEffect(() => {
    fetchAccessData()
  }, [fetchAccessData])

  const handleRefresh = () => {
    fetchAccessData()
  }

  const handleAddAccess = () => {
    setShowAddModal(true)
  }

  const handleAccessAdded = () => {
    fetchAccessData()
  }

  const handleEditAccess = (row) => {
    setEditingAccess(row)
    setShowEditModal(true)
  }

  // Add handler for configure button
  const handleConfigureRoutes = (row) => {
    setConfiguringAccess(row)
    setShowRoutesModal(true)
  }

  // Add handler for when routes are updated
  const handleRoutesUpdated = () => {
    // message.success('Routes updated successfully')
  }

  const handleAccessUpdated = () => {
    fetchAccessData()
  }

  const columnsWithRender = useMemo(() => {
    return accessColumns.map((col) => {
      const baseColumn = {
        ...col,
        headerClassName: 'text-center',
        cellClassName: 'text-center align-middle',
      }

      switch (col.key) {
        case 'id':
          return {
            ...baseColumn,
            render: (value) => {
              if (value === undefined || value === null) {
                return <span className="font-mono font-semibold text-gray-400">N/A</span>
              }
              return (
                <div className="flex justify-center">
                  <span className="font-mono font-semibold text-blue-700 text-xs sm:text-sm">
                    A{value.toString().padStart(3, '0')}
                  </span>
                </div>
              )
            },
          }

        case 'accessName':
          return {
            ...baseColumn,
            render: (value) => (
              <div className="flex justify-center items-center gap-1 sm:gap-3">
                <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-[#F5EFE7] flex items-center justify-center border border-[#9C4A15]/20">
                  <FiLock className="w-3 h-3 sm:w-4 sm:h-4 text-[#9C4A15]" />
                </div>
                <span className="font-medium text-gray-800 text-xs sm:text-sm">
                  {value || 'N/A'}
                </span>
              </div>
            ),
          }

        case 'status':
          return {
            ...baseColumn,
            render: (value) => {
              const statusConfig = {
                Active: {
                  color: 'bg-green-100 text-green-800',
                  border: 'border-green-200',
                },
                Inactive: {
                  color: 'bg-red-100 text-red-800',
                  border: 'border-red-200',
                },
                Deleted: {
                  color: 'bg-gray-100 text-gray-800',
                  border: 'border-gray-200',
                },
                Pending: {
                  color: 'bg-amber-100 text-amber-800',
                  border: 'border-amber-200',
                },
              }

              const config = statusConfig[value] || statusConfig['Pending']

              return (
                <div className="flex justify-center">
                  <span
                    className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold border ${config.color} ${config.border}`}
                  >
                    {value || 'Unknown'}
                  </span>
                </div>
              )
            },
          }

        case 'createdAt':
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
                })

                return (
                  <div className="flex justify-center items-center gap-2">
                    <div className="flex flex-col items-center">
                      <span className="text-gray-700 text-[10px] sm:text-xs">{formattedDate}</span>
                      <span className="text-gray-500 text-[8px] sm:text-[10px]">
                        {formattedTime}
                      </span>
                    </div>
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

        default:
          return baseColumn
      }
    })
  }, [])

  // Get unique values for filter dropdowns
  const uniqueStatuses = useMemo(() => {
    if (!Array.isArray(accessData)) return []
    return Array.from(new Set(accessData.map((item) => item.status))).filter(
      (status) => status !== undefined,
    )
  }, [accessData])

  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    if (!Array.isArray(accessData)) return []

    let filtered = [...accessData]

    // Status filter
    if (statusFilter !== '') {
      filtered = filtered.filter((item) => item.status === statusFilter)
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (item) =>
          (item.id && item.id.toString().includes(query)) ||
          (item.accessName && item.accessName.toLowerCase().includes(query)) ||
          (item.status && item.status.toLowerCase().includes(query)),
      )
    }

    // Sorting with null-safe comparison
    return filtered.sort((a, b) => {
      if (sortKey === 'id') {
        const aId = a[sortKey] || 0
        const bId = b[sortKey] || 0
        return sortDirection === 'asc' ? aId - bId : bId - aId
      }

      if (sortKey === 'createdAt') {
        const aDate = a[sortKey] ? new Date(a[sortKey]).getTime() : 0
        const bDate = b[sortKey] ? new Date(b[sortKey]).getTime() : 0
        return sortDirection === 'asc' ? aDate - bDate : bDate - aDate
      }

      if (sortKey === 'status') {
        const statusOrder = { Active: 1, Inactive: 2, Deleted: 3, Pending: 4 }
        const aValue = statusOrder[a[sortKey]] || 5
        const bValue = statusOrder[b[sortKey]] || 5
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue
      }

      const aValue = (a[sortKey] || '').toString().toLowerCase()
      const bValue = (b[sortKey] || '').toString().toLowerCase()

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
      return 0
    })
  }, [accessData, sortKey, sortDirection, statusFilter, searchQuery])

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
    setSearchQuery('')
  }

  // Loading state
  if (loading) {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-[#9C4A15] mx-auto"></div>
          <p className="mt-3 sm:mt-4 text-sm sm:text-base text-gray-600">
            Loading access levels...
          </p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-xl sm:text-2xl mb-2">⚠️</div>
          <p className="text-red-600 font-medium text-sm sm:text-base mb-2">
            Error loading access levels
          </p>
          <p className="text-gray-600 text-xs sm:text-sm mb-4 wrap-break-words">{error}</p>
          <button
            onClick={handleRefresh}
            className="px-3 sm:px-4 py-1.5 sm:py-2 bg-[#9C4A15] hover:bg-[#8a3f12] text-[#F5EFE7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9C4A15] focus:ring-offset-2 text-xs sm:text-sm flex items-center gap-2 transition-colors cursor-pointer mx-auto"
          >
            <FiRefreshCw className="w-3 h-3 sm:w-4 sm:h-4" />
            Retry
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
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800">
                  Access Management
                </h1>
                <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">
                  Manage system access levels and permissions
                </p>
              </div>
            </div>
            {/* Mobile description */}
            <p className="text-xs text-gray-600 mt-1 sm:hidden">
              Manage access levels and permissions
            </p>
          </div>

          {/* Filters and search - Always visible on all screens */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center px-3 sm:px-4 pb-3 gap-3">
            <div className="flex flex-wrap gap-2 w-full md:w-auto">
              <select
                className="px-3 py-2 border border-slate-400 rounded-lg focus:outline-none focus:ring-2 text-sm w-full md:w-auto"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Status</option>
                {uniqueStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:flex-none">
                <input
                  type="text"
                  placeholder="Search by ID, name, or status..."
                  className="w-full md:w-64 px-3 py-2 border border-slate-400 rounded-lg focus:outline-none focus:ring-2 text-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              {(statusFilter || searchQuery) && (
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

        {/* Table container - Optimized for mobile */}
        <div className="h-[calc(100vh-250px)] sm:h-[calc(100vh-280px)] lg:h-[calc(100vh-250px)] xl:h-[calc(100vh-220px)] overflow-hidden">
          <div className="bg-component shadow-lg rounded-lg border border-slate-400 h-full flex flex-col p-2">
            {/* Action buttons above table */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-2">
              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  onClick={handleAddAccess}
                  className="px-3 sm:px-4 py-1.5 sm:py-2 bg-[#9C4A15] hover:bg-[#8a3f12] text-[#F5EFE7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9C4A15] focus:ring-offset-2 text-xs sm:text-sm flex items-center gap-2 transition-colors cursor-pointer flex-1 sm:flex-none justify-center"
                >
                  <FiPlus className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>Add Access</span>
                </button>
              </div>

              {selectedRows.length > 0 && (
                <div className="text-xs sm:text-sm text-gray-600 bg-blue-50 px-2 sm:px-3 py-1 rounded-full">
                  {selectedRows.length} access level{selectedRows.length !== 1 ? 's' : ''} selected
                </div>
              )}
            </div>

            {filteredAndSortedData.length === 0 ? (
              <div className="flex-1 flex items-center justify-center p-4">
                <div className="text-center">
                  <p className="text-gray-500 text-sm sm:text-base">No access levels found</p>
                  {searchQuery || statusFilter ? (
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
                      No access data available
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
                onEdit={handleEditAccess}
                onConfigure={handleConfigureRoutes}
                actionButtonProps={{
                  editLabel: 'Edit',
                  showEdit: true,
                  showConfigure: true,
                }}
              />
            )}
          </div>
        </div>
      </div>

      {/* Add Access Modal */}
      <AddAccess
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAccessAdded={handleAccessAdded}
      />

      {/* Edit Access Modal */}
      <EditAccess
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false)
          setEditingAccess(null)
        }}
        accessData={editingAccess}
        onAccessUpdated={handleAccessUpdated}
      />

      {/* Add Routes Modal */}
      <EditRoutes
        isOpen={showRoutesModal}
        onClose={() => {
          setShowRoutesModal(false)
          setConfiguringAccess(null)
        }}
        accessData={configuringAccess}
        onRoutesUpdated={handleRoutesUpdated}
      />
    </div>
  )
}

export default Access
