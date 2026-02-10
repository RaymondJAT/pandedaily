import { useState, useEffect, useMemo, useCallback } from 'react'
import PlatformTable from '../../components/PlatformTable'
import { FiUser, FiMail, FiPhone, FiMapPin, FiCalendar } from 'react-icons/fi'
import { customerColumns } from '../../mapping/customerColumns'
import { getCustomers } from '../../services/api'

const Customer = () => {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [sortKey, setSortKey] = useState('id')
  const [sortDirection, setSortDirection] = useState('desc')
  const [statusFilter, setStatusFilter] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRows, setSelectedRows] = useState([])
  const [selectAll, setSelectAll] = useState(false)

  const columnsWithRender = useMemo(() => {
    return customerColumns.map((col) => {
      // Base column with centered alignment
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
                  <span className="font-mono font-semibold text-blue-700">
                    {value.toString().padStart(3, '0')}
                  </span>
                </div>
              )
            },
          }

        case 'fullname':
          return {
            ...baseColumn,
            render: (value) => (
              <div className="flex justify-center items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#F5EFE7] flex items-center justify-center border border-[#9C4A15]/20">
                  <FiUser className="w-4 h-4 text-[#9C4A15]" />
                </div>
                <span className="font-medium text-gray-800">{value || 'N/A'}</span>
              </div>
            ),
          }

        case 'username':
          return {
            ...baseColumn,
            render: (value) => (
              <div className="flex justify-center">
                <span className="text-gray-700">{value || 'N/A'}</span>
              </div>
            ),
          }

        case 'email':
          return {
            ...baseColumn,
            render: (value) => (
              <div className="flex justify-center items-center gap-2">
                <FiMail className="w-4 h-4 text-gray-400" />
                <span className="text-gray-700 truncate">{value || 'N/A'}</span>
              </div>
            ),
          }

        case 'contact':
          return {
            ...baseColumn,
            render: (value) => (
              <div className="flex justify-center items-center gap-2">
                <FiPhone className="w-4 h-4 text-gray-400" />
                <span className="text-gray-700">{value || 'N/A'}</span>
              </div>
            ),
          }

        case 'address':
          return {
            ...baseColumn,
            render: (value) => (
              <div className="flex justify-center items-center gap-2">
                <FiMapPin className="w-4 h-4 text-gray-400" />
                <span className="text-gray-700 truncate" title={value}>
                  {value || 'N/A'}
                </span>
              </div>
            ),
          }

        case 'is_registered':
          return {
            ...baseColumn,
            render: (value) => {
              const isRegistered = value === 1 || value === true || value === '1'
              return (
                <div className="flex justify-center">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                      isRegistered
                        ? 'bg-green-100 text-green-800 border-green-200'
                        : 'bg-amber-100 text-amber-800 border-amber-200'
                    }`}
                  >
                    {isRegistered ? 'Registered' : 'Unregistered'}
                  </span>
                </div>
              )
            },
          }

        case 'createddate':
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

        default:
          return baseColumn
      }
    })
  }, [])

  // Fetch customers from API
  const fetchCustomers = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await getCustomers()

      const data = response.data || response

      if (Array.isArray(data)) {
        const transformedData = data.map((customer) => ({
          id: customer.id || 0,
          fullname: customer.fullname || 'Unknown',
          username: customer.username || 'N/A',
          email: customer.email || '',
          contact: customer.contact || customer.phone || 'N/A',
          address: customer.address || 'N/A',
          latitude: customer.latitude || '',
          longitude: customer.longitude || '',
          password: customer.password || '',
          is_registered: customer.is_registered || 0,
          createddate: customer.createddate || customer.created_date || customer.createdDate || '',
          ...customer,
        }))

        setCustomers(transformedData)
      } else {
        console.error('Invalid data format:', data)
        setError('Invalid data format received from server. Expected an array.')
        setCustomers([])
      }
    } catch (err) {
      console.error('Error fetching customers:', err)
      setError(err.message || 'Failed to fetch customers. Please try again.')
      setCustomers([])
    } finally {
      setLoading(false)
    }
  }, [])

  // Initial fetch
  useEffect(() => {
    fetchCustomers()
  }, [fetchCustomers])

  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    if (!Array.isArray(customers)) return []

    let filtered = [...customers]

    // Status filter
    if (statusFilter !== '') {
      const filterValue = statusFilter === '1'
      filtered = filtered.filter((item) => Boolean(item.is_registered) === filterValue)
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (item) =>
          (item.id && item.id.toString().includes(query)) ||
          (item.fullname && item.fullname.toLowerCase().includes(query)) ||
          (item.username && item.username.toLowerCase().includes(query)) ||
          (item.email && item.email.toLowerCase().includes(query)) ||
          (item.contact && item.contact.toLowerCase().includes(query)) ||
          (item.address && item.address.toLowerCase().includes(query)),
      )
    }

    // Sorting with null-safe comparison
    return filtered.sort((a, b) => {
      if (sortKey === 'id') {
        const aId = a[sortKey] || 0
        const bId = b[sortKey] || 0
        return sortDirection === 'asc' ? aId - bId : bId - aId
      }

      if (sortKey === 'createddate') {
        const aDate = a[sortKey] ? new Date(a[sortKey]).getTime() : 0
        const bDate = b[sortKey] ? new Date(b[sortKey]).getTime() : 0
        return sortDirection === 'asc' ? aDate - bDate : bDate - aDate
      }

      if (sortKey === 'is_registered') {
        const aValue = Boolean(a[sortKey]) ? 1 : 0
        const bValue = Boolean(b[sortKey]) ? 1 : 0
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue
      }

      const aValue = a[sortKey] || ''
      const bValue = b[sortKey] || ''

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
      return 0
    })
  }, [customers, sortKey, sortDirection, statusFilter, searchQuery])

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
          <p className="mt-4 text-gray-600">Loading customers...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-2xl mb-2">⚠️</div>
          <p className="text-red-600 font-medium mb-2">Error loading customers</p>
          <p className="text-gray-600 mb-4">{error}</p>
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
                <h1 className="text-2xl font-bold text-gray-800">Customer Management</h1>
                <p className="text-gray-600">View all customer accounts and their information</p>
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
                <option value="1">Registered</option>
                <option value="0">Unregistered</option>
              </select>
            </div>

            <div className="flex items-center">
              <input
                type="text"
                placeholder="Search by name, username, email, contact, or address..."
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
                  <p className="text-gray-500 text-lg">No customers found</p>
                  <p className="text-gray-400 text-sm mt-2">
                    {searchQuery || statusFilter
                      ? 'Try adjusting your filters or search query'
                      : 'No customer data available'}
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
                  showEdit: false,
                  showDelete: false,
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Customer
