import { useState, useEffect, useMemo, useCallback } from 'react'
import PlatformTable from '../../components/PlatformTable'
import { FiPlus, FiRefreshCw } from 'react-icons/fi'
import { getUsers } from '../../services/api'
import { userColumns } from '../../mapping/userColumns'
import AddUser from '../../components/dashboard modal/AddUser'
import EditUser from '../../components/dashboard modal/EditUser'

const Users = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [sortKey, setSortKey] = useState('mu_id')
  const [sortDirection, setSortDirection] = useState('desc')
  const [statusFilter, setStatusFilter] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRows, setSelectedRows] = useState([])
  const [selectAll, setSelectAll] = useState(false)

  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingUser, setEditingUser] = useState(null)

  const columnsWithRender = useMemo(() => {
    return userColumns.map((col) => {
      switch (col.key) {
        case 'mu_id':
          return {
            ...col,
            render: (value) => {
              if (value === undefined || value === null) {
                return <span className="font-mono font-semibold text-gray-400">N/A</span>
              }
              return (
                <span className="font-mono font-semibold text-blue-700">
                  {value.toString().padStart(3, '0')}
                </span>
              )
            },
          }

        case 'mu_fullname':
          return {
            ...col,
            render: (value) => <span className="font-medium text-gray-800">{value || 'N/A'}</span>,
          }

        case 'mu_username':
          return {
            ...col,
            render: (value) => <span className="text-gray-700">{value || 'N/A'}</span>,
          }

        case 'access_name':
          return {
            ...col,
            render: (value) => {
              const levelColors = {
                Administrator: 'bg-purple-100 text-purple-800 border border-purple-200',
                Manager: 'bg-blue-100 text-blue-800 border border-blue-200',
                Supervisor: 'bg-green-100 text-green-800 border border-green-200',
                User: 'bg-gray-100 text-gray-800 border border-gray-200',
                Viewer: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
              }
              return (
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    levelColors[value] || 'bg-gray-100 text-gray-800 border border-gray-200'
                  }`}
                >
                  {value || 'N/A'}
                </span>
              )
            },
          }

        case 'mu_status':
          return {
            ...col,
            render: (value) => {
              const statusConfig = {
                active: {
                  color: 'bg-green-100 text-green-800',
                  border: 'border-green-200',
                  label: 'Active',
                },
                inactive: {
                  color: 'bg-red-100 text-red-800',
                  border: 'border-red-200',
                  label: 'Inactive',
                },
                delete: {
                  color: 'bg-gray-100 text-gray-800',
                  border: 'border-gray-200',
                  label: 'Deleted',
                },
              }

              const config = statusConfig[value] || {
                color: 'bg-amber-100 text-amber-800',
                border: 'border-amber-200',
                label: value || 'Pending',
              }

              return (
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold border ${config.color} ${config.border}`}
                >
                  {config.label}
                </span>
              )
            },
          }

        default:
          return col
      }
    })
  }, [])

  // Fetch users from API
  const fetchUsers = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await getUsers()

      const data = response.data || response

      if (Array.isArray(data)) {
        const transformedData = data.map((user, index) => ({
          mu_id: user.mu_id || user.id || index + 1,
          mu_fullname: user.mu_fullname || user.fullname || 'Unknown',
          mu_username: user.mu_username || user.username || 'N/A',
          mu_email: user.mu_email || user.email || '',
          mu_status: (user.mu_status || user.status || 'pending').toLowerCase(),
          access_level: 'User',
          ...user,
        }))

        setUsers(transformedData)
      } else {
        console.error('Invalid data format:', data)
        setError('Invalid data format received from server. Expected an array.')
        setUsers([])
      }
    } catch (err) {
      console.error('Error fetching users:', err)
      setError(err.message || 'Failed to fetch users. Please try again.')
      setUsers([])
    } finally {
      setLoading(false)
    }
  }, [])

  // Initial fetch
  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  // Handle user added/updated successfully
  const handleUserUpdated = () => {
    fetchUsers()
  }

  // Handle edit user
  const handleEditUser = (user) => {
    console.log('Editing user:', user)
    setEditingUser(user)
    setShowEditModal(true)
  }

  // Get unique values for filter dropdowns
  const uniqueStatuses = useMemo(() => {
    if (!Array.isArray(users)) return []
    return Array.from(new Set(users.map((item) => item.mu_status))).filter(Boolean)
  }, [users])

  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    if (!Array.isArray(users)) return []

    let filtered = [...users]

    // status filter
    if (statusFilter) {
      filtered = filtered.filter((item) => item.mu_status === statusFilter.toLowerCase())
    }

    // search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (item) =>
          (item.mu_id && item.mu_id.toString().includes(query)) ||
          (item.mu_fullname && item.mu_fullname.toLowerCase().includes(query)) ||
          (item.mu_username && item.mu_username.toLowerCase().includes(query)) ||
          (item.mu_email && item.mu_email.toLowerCase().includes(query)),
      )
    }

    // Sorting with null-safe comparison
    return filtered.sort((a, b) => {
      if (sortKey === 'mu_id') {
        const aId = a[sortKey] || 0
        const bId = b[sortKey] || 0
        return sortDirection === 'asc' ? aId - bId : bId - aId
      }

      const aValue = a[sortKey] || ''
      const bValue = b[sortKey] || ''

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
      return 0
    })
  }, [users, sortKey, sortDirection, statusFilter, searchQuery])

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

  const handleAddUser = () => {
    setShowAddModal(true)
  }

  const handleRefresh = () => {
    fetchUsers()
  }

  const formatStatusForDisplay = (status) => {
    const statusMap = {
      active: 'Active',
      inactive: 'Inactive',
      delete: 'Deleted',
    }
    return (
      statusMap[status] || (status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Unknown')
    )
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#9C4A15] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading users...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-2xl mb-2">⚠️</div>
          <p className="text-red-600 font-medium mb-2">Error loading users</p>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchUsers}
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
                <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
                <p className="text-gray-600">Manage system users and their access levels</p>
              </div>
            </div>
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
                    {formatStatusForDisplay(status)}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center">
              <input
                type="text"
                placeholder="Search by name, username, or email..."
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
            <div className="flex justify-between items-center mb-2">
              <div className="flex gap-2">
                <button
                  onClick={handleAddUser}
                  className="px-4 py-2 bg-[#9C4A15] hover:bg-[#8a3f12] text-[#F5EFE7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9C4A15] focus:ring-offset-2 text-sm flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <FiPlus className="w-4 h-4" />
                  <span>Add User</span>
                </button>
              </div>

              {selectedRows.length > 0 && (
                <div className="text-sm text-gray-600">
                  {selectedRows.length} user{selectedRows.length !== 1 ? 's' : ''} selected
                </div>
              )}
            </div>

            {filteredAndSortedData.length === 0 ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-gray-500 text-lg">No users found</p>
                  {searchQuery || statusFilter ? (
                    <p className="text-gray-400 text-sm mt-2">
                      Try adjusting your filters or search query
                    </p>
                  ) : (
                    <button
                      onClick={handleAddUser}
                      className="mt-4 px-4 py-2 bg-[#9C4A15] hover:bg-[#8a3f12] text-[#F5EFE7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9C4A15] focus:ring-offset-2 text-sm"
                    >
                      Add your first user
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
                maxHeight="calc(100% - 60px)"
                title={null}
                responsive={true}
                containerClassName="h-full"
                selectedRows={selectedRows}
                onSelectionChange={handleSelectionChange}
                selectAll={selectAll}
                onSelectAll={handleSelectAll}
                onEdit={handleEditUser} // Pass handleEditUser function
                actionButtonProps={{
                  editLabel: 'Edit',
                  showEdit: true,
                }}
              />
            )}
          </div>
        </div>
      </div>

      {/* Add User Modal */}
      <AddUser
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onUserAdded={handleUserUpdated}
      />

      {/* Edit User Modal */}
      <EditUser
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false)
          setEditingUser(null)
        }}
        userData={editingUser}
        onUserUpdated={handleUserUpdated}
      />
    </div>
  )
}

export default Users
