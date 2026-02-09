import { useState, useEffect, useMemo, useCallback } from 'react'
import PlatformTable from '../../components/PlatformTable'
import { FiPlus, FiRefreshCw, FiPackage, FiTrendingUp, FiTrendingDown, FiBox } from 'react-icons/fi'
import { getInventory, getInventoryHistory } from '../../services/api'
import AddInventory from '../../components/dashboard modal/AddInventory'
import EditInventory from '../../components/dashboard modal/EditInventory'
import { inventoryColumns, historyColumns } from '../../mapping/inventoryColumns'

const Inventory = () => {
  const [inventory, setInventory] = useState([])
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [sortKey, setSortKey] = useState('date')
  const [sortDirection, setSortDirection] = useState('desc')
  const [statusFilter, setStatusFilter] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRows, setSelectedRows] = useState([])
  const [selectAll, setSelectAll] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingInventory, setEditingInventory] = useState(null)
  const [activeTab, setActiveTab] = useState('current')

  const columnsWithRender = useMemo(() => {
    const columns = activeTab === 'current' ? inventoryColumns : historyColumns

    return columns.map((col) => {
      const baseColumn = {
        ...col,
        align: 'center',
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
              const prefix = activeTab === 'current' ? 'I' : 'H'
              return (
                <div className="flex justify-center">
                  <span className="font-mono font-semibold text-blue-700">
                    {prefix}
                    {value.toString().padStart(3, '0')}
                  </span>
                </div>
              )
            },
          }

        case 'product_name':
          return {
            ...baseColumn,
            render: (value) => (
              <div className="flex justify-center items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#F5EFE7] flex items-center justify-center border border-[#9C4A15]/20">
                  <FiPackage className="w-4 h-4 text-[#9C4A15]" />
                </div>
                <span className="font-medium text-gray-800">{value || 'N/A'}</span>
              </div>
            ),
          }

        case 'current_stock':
        case 'stock_after':
          return {
            ...baseColumn,
            render: (value, record) => {
              const isLow = value <= 10
              const isOut = value === 0
              return (
                <div className="flex justify-center items-center gap-2">
                  <div className="relative">
                    <FiBox
                      className={`w-5 h-5 ${
                        isOut ? 'text-red-500' : isLow ? 'text-amber-500' : 'text-green-500'
                      }`}
                    />
                    {(isLow || isOut) && (
                      <div
                        className={`absolute -top-1 -right-1 w-2 h-2 rounded-full ${
                          isOut ? 'bg-red-500' : 'bg-amber-500'
                        }`}
                      ></div>
                    )}
                  </div>
                  <span
                    className={`font-semibold ${
                      isOut ? 'text-red-700' : isLow ? 'text-amber-700' : 'text-gray-800'
                    }`}
                  >
                    {value || 0}
                  </span>
                </div>
              )
            },
          }

        case 'previous_stock':
        case 'stock_before':
          return {
            ...baseColumn,
            render: (value) => (
              <div className="flex justify-center">
                <span className="font-medium text-gray-600">{value || 0}</span>
              </div>
            ),
          }

        case 'status':
          return {
            ...baseColumn,
            render: (value) => {
              const statusConfig = {
                SOLD: {
                  color: 'bg-blue-100 text-blue-800',
                  border: 'border-blue-200',
                  icon: <FiTrendingDown className="w-3 h-3 mr-1" />,
                  label: 'Sold',
                },
                REPLENISHMENT: {
                  color: 'bg-green-100 text-green-800',
                  border: 'border-green-200',
                  icon: <FiTrendingUp className="w-3 h-3 mr-1" />,
                  label: 'Replenished',
                },
                ADJUSTMENT: {
                  color: 'bg-amber-100 text-amber-800',
                  border: 'border-amber-200',
                  icon: <FiRefreshCw className="w-3 h-3 mr-1" />,
                  label: 'Adjusted',
                },
                NEW: {
                  color: 'bg-purple-100 text-purple-800',
                  border: 'border-purple-200',
                  icon: <FiPlus className="w-3 h-3 mr-1" />,
                  label: 'New',
                },
              }

              const config = statusConfig[value] || {
                color: 'bg-gray-100 text-gray-800',
                border: 'border-gray-200',
                icon: null,
                label: value || 'N/A',
              }

              return (
                <div className="flex justify-center">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold border ${config.color} ${config.border} flex items-center`}
                  >
                    {config.icon}
                    {config.label}
                  </span>
                </div>
              )
            },
          }

        case 'date':
          return {
            ...baseColumn,
            render: (value) => {
              if (!value) return <span className="text-gray-400">N/A</span>

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
                  <div className="text-center">
                    <div className="text-sm font-medium text-gray-800">{formattedDate}</div>
                    <div className="text-xs text-gray-500">{formattedTime}</div>
                  </div>
                </div>
              )
            },
          }

        case 'stock_change':
          return {
            ...baseColumn,
            render: (value, record) => {
              const change = (record.stock_after || 0) - (record.stock_before || 0)
              const isPositive = change > 0
              const isNegative = change < 0

              return (
                <div className="flex justify-center items-center gap-1">
                  {isPositive && <FiTrendingUp className="w-4 h-4 text-green-500" />}
                  {isNegative && <FiTrendingDown className="w-4 h-4 text-red-500" />}
                  {change === 0 && <span className="w-4 h-4 text-gray-400">–</span>}
                  <span
                    className={`font-semibold ${
                      isPositive ? 'text-green-700' : isNegative ? 'text-red-700' : 'text-gray-700'
                    }`}
                  >
                    {isPositive ? '+' : ''}
                    {change}
                  </span>
                </div>
              )
            },
          }

        default:
          return baseColumn
      }
    })
  }, [activeTab])

  // Fetch inventory data
  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      if (activeTab === 'current') {
        const response = await getInventory()
        const inventoryData = response.data || response

        if (Array.isArray(inventoryData)) {
          const transformedInventory = inventoryData.map((item) => ({
            id: item.id || item.i_id || 0,
            product_id: item.product_id || item.i_product_id || 0,
            product_name: item.product_name || item.p_name || 'Unknown',
            current_stock: parseInt(item.current_stock || item.i_current_stock || 0),
            previous_stock: parseInt(item.previous_stock || item.i_previous_stock || 0),
            status: item.status || 'NEW',
            date: item.date || item.i_date || new Date().toISOString(),
            ...item,
          }))
          setInventory(transformedInventory)
        } else {
          console.error('Invalid inventory data format:', inventoryData)
          setInventory([])
        }
      } else {
        const response = await getInventoryHistory()
        const historyData = response.data || response

        if (Array.isArray(historyData)) {
          const transformedHistory = historyData.map((item) => ({
            id: item.id || item.ih_id || 0,
            inventory_id: item.inventory_id || item.ih_inventory_id || 0,
            product_id: item.product_id || 0,
            product_name: item.product_name || 'Unknown',
            stock_before: parseInt(item.stock_before || item.ih_stock_before || 0),
            stock_after: parseInt(item.stock_after || item.ih_stock_after || 0),
            status: item.status || item.ih_status || 'ADJUSTMENT',
            date: item.date || item.ih_date || new Date().toISOString(),
            ...item,
          }))
          setHistory(transformedHistory)
        } else {
          console.error('Invalid history data format:', historyData)
          setHistory([])
        }
      }
    } catch (err) {
      console.error('Error fetching data:', err)
      setError(err.message || 'Failed to fetch data. Please try again.')
      setInventory([])
      setHistory([])
    } finally {
      setLoading(false)
    }
  }, [activeTab])

  // Initial fetch
  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Handle inventory added/updated successfully
  const handleInventoryUpdated = () => {
    fetchData()
  }

  // Handle edit inventory
  const handleEditInventory = (inventoryItem) => {
    setEditingInventory(inventoryItem)
    setShowEditModal(true)
  }

  // Get unique values for filter dropdowns
  const uniqueStatuses = useMemo(() => {
    const data = activeTab === 'current' ? inventory : history
    if (!Array.isArray(data)) return []
    return Array.from(new Set(data.map((item) => item.status)))
      .filter(Boolean)
      .sort()
  }, [inventory, history, activeTab])

  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    const data = activeTab === 'current' ? inventory : history
    if (!Array.isArray(data)) return []

    let filtered = [...data]

    // Status filter
    if (statusFilter) {
      filtered = filtered.filter((item) => item.status === statusFilter)
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (item) =>
          (item.id && item.id.toString().includes(query)) ||
          (item.product_name && item.product_name.toLowerCase().includes(query)) ||
          (item.product_id && item.product_id.toString().includes(query)) ||
          (item.current_stock && item.current_stock.toString().includes(query)) ||
          (item.previous_stock && item.previous_stock.toString().includes(query)) ||
          (item.stock_before && item.stock_before.toString().includes(query)) ||
          (item.stock_after && item.stock_after.toString().includes(query)) ||
          (item.status && item.status.toLowerCase().includes(query)),
      )
    }

    // Sorting with null-safe comparison
    return filtered.sort((a, b) => {
      if (sortKey === 'id' || sortKey === 'product_id' || sortKey === 'inventory_id') {
        const aId = a[sortKey] || 0
        const bId = b[sortKey] || 0
        return sortDirection === 'asc' ? aId - bId : bId - aId
      }

      if (
        sortKey === 'current_stock' ||
        sortKey === 'previous_stock' ||
        sortKey === 'stock_before' ||
        sortKey === 'stock_after'
      ) {
        const aValue = parseInt(a[sortKey]) || 0
        const bValue = parseInt(b[sortKey]) || 0
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue
      }

      if (sortKey === 'date') {
        const aDate = new Date(a[sortKey] || 0)
        const bDate = new Date(b[sortKey] || 0)
        return sortDirection === 'asc' ? aDate - bDate : bDate - aDate
      }

      const aValue = a[sortKey] || ''
      const bValue = b[sortKey] || ''

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
      return 0
    })
  }, [inventory, history, activeTab, sortKey, sortDirection, statusFilter, searchQuery])

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

  const handleAddInventory = () => {
    setShowAddModal(true)
  }

  const handleRefresh = () => {
    fetchData()
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#9C4A15] mx-auto"></div>
          <p className="mt-4 text-gray-600">
            Loading {activeTab === 'current' ? 'inventory' : 'history'}...
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-2xl mb-2">⚠️</div>
          <p className="text-red-600 font-medium mb-2">Error loading inventory data</p>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchData}
            className="px-4 py-2 bg-[#9C4A15] hover:bg-[#8a3f12] text-[#F5EFE7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9C4A15] focus:ring-offset-2 text-sm flex items-center gap-2 transition-colors cursor-pointer mx-auto"
          >
            <FiRefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 min-h-0 p-3">
        {/* Main header section */}
        <div className="bg-component shadow-lg rounded-lg border border-slate-400 mb-3">
          <div className="px-4 py-1">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Inventory Management</h1>
                <p className="text-gray-600">Track stock levels and inventory history</p>
              </div>

              {/* Tabs */}
              <div className="flex rounded-lg border border-slate-400 overflow-hidden">
                <button
                  onClick={() => setActiveTab('current')}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    activeTab === 'current'
                      ? 'bg-[#9C4A15] text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Current Inventory
                </button>
                <button
                  onClick={() => setActiveTab('history')}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    activeTab === 'history'
                      ? 'bg-[#9C4A15] text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  History
                </button>
              </div>
            </div>
          </div>

          {/* Filters and search */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center px-4 pb-2 gap-3">
            <div className="flex flex-wrap gap-2">
              {activeTab === 'history' && (
                <select
                  className="px-4 py-2 border border-slate-400 rounded-lg focus:outline-none focus:ring-2 text-sm"
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
              )}

              {activeTab === 'current' && (
                <button
                  onClick={handleAddInventory}
                  className="px-4 py-2 bg-[#9C4A15] hover:bg-[#8a3f12] text-[#F5EFE7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9C4A15] focus:ring-offset-2 text-sm flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <FiPlus className="w-4 h-4" />
                  <span>Add Inventory</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder={`Search by ${activeTab === 'current' ? 'product name or stock...' : 'product, status, or date...'}`}
                className="px-4 py-2 border border-slate-400 rounded-lg focus:outline-none focus:ring-2 text-sm w-full md:w-64"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Table container */}
        <div className="h-[calc(100vh-280px)] lg:h-[calc(100vh-250px)] xl:h-[calc(100vh-220px)] overflow-hidden">
          <div className="bg-component shadow-lg rounded-lg border border-slate-400 h-full flex flex-col p-2">
            {filteredAndSortedData.length === 0 ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-gray-500 text-lg">
                    No {activeTab === 'current' ? 'inventory' : 'history'} found
                  </p>
                  <p className="text-gray-400 text-sm mt-2">
                    {searchQuery || statusFilter
                      ? 'Try adjusting your filters or search query'
                      : activeTab === 'current'
                        ? 'Add your first inventory record to get started'
                        : 'No history records available'}
                  </p>
                  {activeTab === 'current' && !searchQuery && !statusFilter && (
                    <button
                      onClick={handleAddInventory}
                      className="mt-4 px-4 py-2 bg-[#9C4A15] hover:bg-[#8a3f12] text-[#F5EFE7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9C4A15] focus:ring-offset-2 text-sm"
                    >
                      Add inventory record
                    </button>
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
                maxHeight="calc(100% - 10px)"
                title={null}
                responsive={true}
                containerClassName="h-full"
                selectedRows={selectedRows}
                onSelectionChange={handleSelectionChange}
                selectAll={selectAll}
                onSelectAll={handleSelectAll}
                onEdit={activeTab === 'current' ? handleEditInventory : null}
                actionButtonProps={{
                  editLabel: activeTab === 'current' ? 'Update Stock' : null,
                  showEdit: activeTab === 'current',
                }}
                showActions={activeTab === 'current'}
              />
            )}
          </div>
        </div>
      </div>

      {/* Add Inventory Modal */}
      <AddInventory
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onInventoryAdded={handleInventoryUpdated}
      />

      {/* Edit Inventory Modal */}
      <EditInventory
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false)
          setEditingInventory(null)
        }}
        inventoryData={editingInventory}
        onInventoryUpdated={handleInventoryUpdated}
      />
    </div>
  )
}

export default Inventory
