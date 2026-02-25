import { useState, useEffect, useMemo, useCallback } from 'react'
import PlatformTable from '../../components/PlatformTable'
import { FiPlus, FiRefreshCw, FiGlobe } from 'react-icons/fi'
import { getRoutes, createRoute } from '../../services/api'
import { routeColumns } from '../../mapping/routeColumns'
import AddRoute from '../../components/dashboard modal/AddRoute'
import { message } from 'antd'

const RoutePage = () => {
  const [routeData, setRouteData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [sortKey, setSortKey] = useState('id')
  const [sortDirection, setSortDirection] = useState('asc')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRows, setSelectedRows] = useState([])
  const [selectAll, setSelectAll] = useState(false)

  const [showAddModal, setShowAddModal] = useState(false)

  const fetchRouteData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await getRoutes()
      const data = response.data || response

      if (Array.isArray(data)) {
        const transformedData = data.map((route) => ({
          id: route.mr_id || route.id,
          routeName: route.mr_route_name || route.route_name || route.name,
          createdAt: route.mr_created_at || route.created_at || new Date().toISOString(),
          ...route,
        }))

        setRouteData(transformedData)
      } else {
        console.error('Invalid data format:', data)
        setError('Invalid data format received from server. Expected an array.')
        setRouteData([])
      }
    } catch (err) {
      console.error('Error fetching routes:', err)
      setError(err.message || 'Failed to fetch routes. Please try again.')
      setRouteData([])
    } finally {
      setLoading(false)
    }
  }, [])

  // Initial fetch
  useEffect(() => {
    fetchRouteData()
  }, [fetchRouteData])

  const handleRefresh = () => {
    fetchRouteData()
    message.success('Routes refreshed')
  }

  const handleAddRoute = () => {
    setShowAddModal(true)
  }

  const handleRouteAdded = () => {
    message.success('Route added successfully')
    fetchRouteData()
  }

  const columnsWithRender = useMemo(() => {
    return routeColumns.map((col) => {
      const baseColumn = {
        ...col,
        headerClassName: 'text-center',
        cellClassName: 'text-center align-middle',
      }

      // Special handling for id column to match Access page style
      if (col.key === 'id') {
        return {
          ...baseColumn,
          render: (value) => {
            if (value === undefined || value === null) {
              return <span className="font-mono font-semibold text-gray-400">N/A</span>
            }
            return (
              <div className="flex justify-center">
                <span className="font-mono font-semibold text-blue-700">
                  R{value.toString().padStart(3, '0')}
                </span>
              </div>
            )
          },
        }
      }

      // Special handling for createdAt column to match Access page style
      if (col.key === 'createdAt') {
        return {
          ...baseColumn,
          render: (value) => {
            if (!value)
              return (
                <div className="flex justify-center">
                  <span className="text-gray-400">N/A</span>
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
                    <span className="text-gray-700 text-sm">{formattedDate}</span>
                    <span className="text-gray-500 text-xs">{formattedTime}</span>
                  </div>
                </div>
              )
            } catch (err) {
              return (
                <div className="flex justify-center">
                  <span className="text-gray-400">Invalid date</span>
                </div>
              )
            }
          },
        }
      }

      // Add icon for routeName column to match access style
      if (col.key === 'routeName') {
        return {
          ...baseColumn,
          render: (value) => (
            <div className="flex justify-center items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#F5EFE7] flex items-center justify-center border border-[#9C4A15]/20">
                <FiGlobe className="w-4 h-4 text-[#9C4A15]" />
              </div>
              <span className="font-medium text-gray-800">{value || 'N/A'}</span>
            </div>
          ),
        }
      }

      return baseColumn
    })
  }, [])

  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    if (!Array.isArray(routeData)) return []

    let filtered = [...routeData]

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (item) =>
          (item.id && item.id.toString().includes(query)) ||
          (item.routeName && item.routeName.toLowerCase().includes(query)),
      )
    }

    // Sorting
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

      const aValue = (a[sortKey] || '').toString().toLowerCase()
      const bValue = (b[sortKey] || '').toString().toLowerCase()

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
      return 0
    })
  }, [routeData, sortKey, sortDirection, searchQuery])

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

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#9C4A15] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading routes...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-2xl mb-2">⚠️</div>
          <p className="text-red-600 font-medium mb-2">Error loading routes</p>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={handleRefresh}
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
                <h1 className="text-2xl font-bold text-gray-800">Route Management</h1>
                <p className="text-gray-600">Define available routes in the system</p>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center px-4 pb-2 gap-3">
            <div className="flex-1"></div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Search by route name or ID..."
                className="px-4 py-2 border border-slate-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9C4A15] text-sm w-full md:w-80"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Table container */}
        <div className="h-[calc(100vh-280px)] lg:h-[calc(100vh-250px)] xl:h-[calc(100vh-220px)] overflow-hidden">
          <div className="bg-component shadow-lg rounded-lg border border-slate-400 h-full flex flex-col p-2">
            <div className="flex justify-between items-center mb-2">
              <div className="flex gap-2">
                <button
                  onClick={handleAddRoute}
                  className="px-4 py-2 bg-[#9C4A15] hover:bg-[#8a3f12] text-[#F5EFE7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9C4A15] focus:ring-offset-2 text-sm flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <FiPlus className="w-4 h-4" />
                  <span>Add Route</span>
                </button>
              </div>
            </div>

            {filteredAndSortedData.length === 0 ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <FiGlobe className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">No routes found</p>
                  <p className="text-gray-400 text-sm mt-2">
                    {searchQuery
                      ? 'Try adjusting your search query'
                      : 'Click "Add Route" to create your first route'}
                  </p>
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
                showActions={false}
                actionButtonProps={{
                  showDelete: false,
                  showEdit: false,
                  showView: false,
                }}
              />
            )}
          </div>
        </div>
      </div>

      {/* Add Route Modal */}
      <AddRoute
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onRouteAdded={handleRouteAdded}
      />
    </div>
  )
}

export default RoutePage
