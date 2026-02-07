import { useMemo, useState } from 'react'
import PlatformTable from '../../components/PlatformTable'
import { FiPlus } from 'react-icons/fi'

const accessColumns = [
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
      const date = new Date(value)
      const formattedDate = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      })
      return <span className="text-gray-700">{formattedDate}</span>
    },
  },
]

const createAccessData = (count) => {
  const accessNames = [
    'Administrator',
    'Finance Manager',
    'Team Leader',
    'Employee',
    'View Only',
    'Auditor',
    'Supervisor',
    'HR Manager',
    'IT Admin',
    'Operations Lead',
    'Sales Manager',
    'Customer Support',
    'Quality Assurance',
    'Project Manager',
    'Data Analyst',
  ]

  const statuses = ['Active', 'Inactive', 'Pending']

  const generateRandomDate = () => {
    const start = new Date()
    start.setFullYear(start.getFullYear() - 2)
    const end = new Date()

    const randomDate = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))

    // Format as YYYY-MM-DD HH:MM:SS
    const pad = (num) => num.toString().padStart(2, '0')
    const year = randomDate.getFullYear()
    const month = pad(randomDate.getMonth() + 1)
    const day = pad(randomDate.getDate())
    const hours = pad(randomDate.getHours())
    const minutes = pad(randomDate.getMinutes())
    const seconds = pad(randomDate.getSeconds())

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
  }

  return Array.from({ length: count }, (_, i) => {
    const status = statuses[i % statuses.length]
    const permissions = Math.floor(Math.random() * 20) + 5

    return {
      id: i + 1,
      accessName: accessNames[i % accessNames.length],
      status: status,
      createdAt: generateRandomDate(),
      updatedAt: generateRandomDate(),
      permissions: permissions,
      lastModified: generateRandomDate(),
      createdBy: `Admin ${Math.floor(Math.random() * 5) + 1}`,
    }
  })
}

const Access = () => {
  const [sortKey, setSortKey] = useState('id')
  const [sortDirection, setSortDirection] = useState('desc')
  const [statusFilter, setStatusFilter] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRows, setSelectedRows] = useState([])
  const [selectAll, setSelectAll] = useState(false)

  const accessData = useMemo(() => {
    const data = createAccessData(25)
    return Array.isArray(data) ? data : []
  }, [])

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
          item.id.toString().includes(query) ||
          item.accessName.toLowerCase().includes(query) ||
          item.createdBy.toLowerCase().includes(query),
      )
    }

    // Sorting
    return filtered.sort((a, b) => {
      if (sortKey === 'createdAt' || sortKey === 'updatedAt' || sortKey === 'lastModified') {
        const dateA = new Date(a[sortKey])
        const dateB = new Date(b[sortKey])
        if (dateA < dateB) return sortDirection === 'asc' ? -1 : 1
        if (dateA > dateB) return sortDirection === 'asc' ? 1 : -1
        return 0
      }

      if (['userCount', 'permissions'].includes(sortKey)) {
        if (a[sortKey] < b[sortKey]) return sortDirection === 'asc' ? -1 : 1
        if (a[sortKey] > b[sortKey]) return sortDirection === 'asc' ? 1 : -1
        return 0
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

  const handleSelectAll = (isSelected, allIds) => {
    setSelectAll(isSelected)
    setSelectedRows(isSelected ? allIds : [])
  }

  const handleAddAccess = () => {
    console.log('Add Access clicked')
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
              showCheckboxes={true}
              selectedRows={selectedRows}
              onSelectionChange={handleSelectionChange}
              selectAll={selectAll}
              onSelectAll={handleSelectAll}
              onEdit={(row) => console.log('Edit access:', row)}
              actionButtonProps={{
                editLabel: 'Edit',
                showEdit: true,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Access
