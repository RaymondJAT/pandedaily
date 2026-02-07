import { useState, useEffect, useMemo, useCallback } from 'react'
import PlatformTable from '../../components/PlatformTable'
import { FiPlus, FiRefreshCw } from 'react-icons/fi'
import { getAccess, deleteAccess } from '../../services/api'
import AddAccess from '../../components/dashboard modal/AddAccess'
import EditAccess from '../../components/dashboard modal/EditAccess' // Import the EditAccess modal

const Access = () => {
  const [accessData, setAccessData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [sortKey, setSortKey] = useState('id')
  const [sortDirection, setSortDirection] = useState('desc')
  const [statusFilter, setStatusFilter] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRows, setSelectedRows] = useState([])

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingAccess, setEditingAccess] = useState(null)

  // Fetch access levels from API
  const fetchAccessData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await getAccess()
      const data = response.data || response

      if (Array.isArray(data)) {
        // Transform API data to match your column structure
        const transformedData = data.map((access) => ({
          id: access.ma_id || access.id,
          accessName: access.ma_name || access.name || 'Unknown',
          status: access.ma_status || access.status || 'Active',
          createdAt: access.ma_created_at || access.created_at || new Date().toISOString(),
          // Add other fields if needed
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

  // Handle refresh
  const handleRefresh = () => {
    fetchAccessData()
  }

  // Handle add access - open modal
  const handleAddAccess = () => {
    setShowAddModal(true)
  }

  // Handle access added successfully
  const handleAccessAdded = () => {
    fetchAccessData() // Refresh the list
  }

  // Handle edit access - open modal
  const handleEditAccess = (row) => {
    console.log('Editing access:', row)
    setEditingAccess(row)
    setShowEditModal(true)
  }

  // Handle access updated successfully
  const handleAccessUpdated = () => {
    fetchAccessData() // Refresh the list
  }

  // Handle delete access
  const handleDeleteAccess = async (id) => {
    if (window.confirm('Are you sure you want to delete this access level?')) {
      try {
        await deleteAccess(id)
        fetchAccessData() // Refresh the list
      } catch (error) {
        console.error('Error deleting access:', error)
      }
    }
  }

  // Column definitions
  const accessColumns = useMemo(
    () => [
      {
        key: 'id',
        label: 'ID',
        sortable: true,
        width: '8%',
        align: 'center',
        render: (value) => (
          <span className="font-mono font-semibold text-blue-700">
            {value.toString().padStart(3, '0')}
          </span>
        ),
      },
      {
        key: 'accessName',
        label: 'Access Name',
        sortable: true,
        width: '25%',
        align: 'left',
        render: (value) => <span className="font-medium text-gray-800">{value}</span>,
      },
      {
        key: 'status',
        label: 'Status',
        sortable: true,
        width: '12%',
        align: 'center',
        render: (value) => {
          const statusConfig = {
            Active: { color: 'bg-green-100 text-green-800', border: 'border-green-200' },
            Inactive: { color: 'bg-red-100 text-red-800', border: 'border-red-200' },
            Pending: { color: 'bg-amber-100 text-amber-800', border: 'border-amber-200' },
          }

          const config = statusConfig[value] || statusConfig['Pending']

          return (
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold border ${config.color} ${config.border}`}
            >
              {value}
            </span>
          )
        },
      },
      {
        key: 'createdAt',
        label: 'Created At',
        sortable: true,
        width: '15%',
        align: 'center',
        render: (value) => {
          try {
            const date = new Date(value)
            const formattedDate = date.toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
            })
            return <span className="text-gray-700">{formattedDate}</span>
          } catch (error) {
            return <span className="text-gray-500">Invalid Date</span>
          }
        },
      },
    ],
    [],
  )

  // Get unique statuses for filter dropdown
  const uniqueStatuses = useMemo(() => {
    if (!Array.isArray(accessData)) return []
    return Array.from(new Set(accessData.map((item) => item.status))).filter(Boolean)
  }, [accessData])

  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    if (!Array.isArray(accessData)) return []

    let filtered = [...accessData]

    if (statusFilter) {
      filtered = filtered.filter((item) => item.status === statusFilter)
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (item) =>
          item.id.toString().includes(query) || item.accessName.toLowerCase().includes(query),
      )
    }

    // Sorting
    return filtered.sort((a, b) => {
      if (sortKey === 'createdAt') {
        try {
          const dateA = new Date(a[sortKey])
          const dateB = new Date(b[sortKey])
          if (dateA < dateB) return sortDirection === 'asc' ? -1 : 1
          if (dateA > dateB) return sortDirection === 'asc' ? 1 : -1
          return 0
        } catch (error) {
          return 0
        }
      }

      if (a[sortKey] < b[sortKey]) return sortDirection === 'asc' ? -1 : 1
      if (a[sortKey] > b[sortKey]) return sortDirection === 'asc' ? 1 : -1
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

  // Loading state
  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#9C4A15] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading access levels...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-2xl mb-2">⚠️</div>
          <p className="text-red-600 font-medium mb-2">Error loading access levels</p>
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
            <h1 className="text-2xl font-bold text-gray-800">Access Management</h1>
            <p className="text-gray-600">Manage system access levels and permissions</p>
          </div>

          {/* Filters and search */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center px-4 pb-2 gap-3">
            <div className="flex flex-wrap gap-2">
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
            </div>

            <div className="flex items-center">
              <input
                type="text"
                placeholder="Search by name, description, or created by..."
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
            {/* Action buttons above table */}
            <div className="flex justify-between items-center mb-2">
              <div className="flex gap-2">
                <button
                  onClick={handleAddAccess}
                  className="px-4 py-2 bg-[#9C4A15] hover:bg-[#8a3f12] text-[#F5EFE7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9C4A15] focus:ring-offset-2 text-sm flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <FiPlus className="w-4 h-4" />
                  <span>Add Access</span>
                </button>
              </div>
            </div>

            {filteredAndSortedData.length === 0 ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-gray-500 text-lg">No access levels found</p>
                  {searchQuery || statusFilter ? (
                    <p className="text-gray-400 text-sm mt-2">
                      Try adjusting your filters or search query
                    </p>
                  ) : (
                    <button
                      onClick={handleAddAccess}
                      className="mt-4 px-4 py-2 bg-[#9C4A15] hover:bg-[#8a3f12] text-[#F5EFE7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9C4A15] focus:ring-offset-2 text-sm"
                    >
                      Add your first access level
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <PlatformTable
                columns={accessColumns}
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
                onEdit={handleEditAccess} // Pass the edit handler
                actionButtonProps={{
                  editLabel: 'Edit',
                  showEdit: true,
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
    </div>
  )
}

export default Access
