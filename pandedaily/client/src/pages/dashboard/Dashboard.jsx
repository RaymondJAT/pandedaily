import { useState } from 'react'
import Cards from '../../components/Cards'
import PlatformTable from '../../components/PlatformTable'
import {
  FiShoppingBag,
  FiClock,
  FiTruck,
  FiUser,
  FiMail,
  FiRefreshCw,
  FiMapPin,
} from 'react-icons/fi'
import { PiCoins } from 'react-icons/pi'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'

const Dashboard = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Sample data for the new card layout
  const [stats] = useState({
    ordersToday: 28,
    salesToday: 45600,
    pendingOrders: 15,
    activeDeliveries: 8,
    availableRiders: 12,
    newInquiries: 5,
  })

  // Sample sales overview data (last 7 days)
  const salesData = [
    { day: 'Mon', sales: 12500, orders: 18 },
    { day: 'Tue', sales: 15200, orders: 22 },
    { day: 'Wed', sales: 18900, orders: 25 },
    { day: 'Thu', sales: 16700, orders: 20 },
    { day: 'Fri', sales: 21000, orders: 28 },
    { day: 'Sat', sales: 24300, orders: 32 },
    { day: 'Sun', sales: 19800, orders: 24 },
  ]

  // Sample category distribution data
  const categoryData = [
    { name: 'Breads', value: 45 },
    { name: 'Pastries', value: 30 },
    { name: 'Cakes', value: 15 },
    { name: 'Cookies', value: 10 },
  ]

  const COLORS = ['#9C4A15', '#F5EFE7', '#D9D2C9', '#2A1803']

  // Sample recent orders with proper id field for PlatformTable
  const recentOrders = [
    {
      id: 'ORD-001',
      customer: 'John Doe',
      items: 'Pandesal (12 pcs), Spanish Bread (6 pcs)',
      amount: 1250,
      status: 'COMPLETED',
      time: '10:30 AM',
    },
    {
      id: 'ORD-002',
      customer: 'Jane Smith',
      items: 'Ensaymada (6 pcs), Cinnamon Roll (4 pcs)',
      amount: 890,
      status: 'PENDING',
      time: '10:15 AM',
    },
    {
      id: 'ORD-003',
      customer: 'Bob Johnson',
      items: 'Birthday Cake (1), Cheese Bread (12 pcs)',
      amount: 2100,
      status: 'PROCESSING',
      time: '9:45 AM',
    },
    {
      id: 'ORD-004',
      customer: 'Alice Brown',
      items: 'Pandesal (24 pcs)',
      amount: 560,
      status: 'COMPLETED',
      time: '9:20 AM',
    },
    {
      id: 'ORD-005',
      customer: 'Charlie Wilson',
      items: 'Assorted Pastries (20 pcs)',
      amount: 3450,
      status: 'PENDING',
      time: '8:50 AM',
    },
  ]

  // Sample pending deliveries with proper id field for PlatformTable
  const pendingDeliveries = [
    {
      id: 'DEL-001',
      orderId: 'ORD-002',
      customer: 'Jane Smith',
      address: '123 Main St, Barangay San Jose',
      rider: 'Mike Reyes',
      status: 'ASSIGNED',
      scheduled: '11:00 AM',
    },
    {
      id: 'DEL-003',
      orderId: 'ORD-005',
      customer: 'Charlie Wilson',
      address: '456 Oak Ave, Barangay San Juan',
      rider: 'Unassigned',
      status: 'PENDING',
      scheduled: '2:00 PM',
    },
    {
      id: 'DEL-004',
      orderId: 'ORD-006',
      customer: 'Diana Prince',
      address: '789 Pine St, Barangay San Pedro',
      rider: 'Anna Santos',
      status: 'ASSIGNED',
      scheduled: '1:30 PM',
    },
  ]

  // Define columns for Recent Orders table (matching Users style)
  const orderColumns = [
    {
      key: 'id',
      label: 'Order ID',
      sortable: true,
      align: 'center',
      render: (value) => (
        <div className="flex justify-center">
          <span className="font-mono font-semibold text-blue-700 text-xs sm:text-sm">{value}</span>
        </div>
      ),
    },
    {
      key: 'customer',
      label: 'Customer',
      sortable: true,
      align: 'center',
      render: (value, row) => (
        <div className="flex justify-center items-center gap-1 sm:gap-2">
          <FiUser className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
          <span className="font-medium text-gray-800 text-xs sm:text-sm truncate max-w-20 sm:max-w-30">
            {value}
          </span>
        </div>
      ),
    },
    {
      key: 'items',
      label: 'Items',
      sortable: true,
      align: 'center',
      className: 'hidden sm:table-cell',
      render: (value, row) => (
        <div className="flex flex-col items-center">
          <span className="text-gray-600 text-xs sm:text-sm truncate max-w-37.5" title={value}>
            {value}
          </span>
          <span className="text-gray-400 text-[10px]">{row.time}</span>
        </div>
      ),
    },
    {
      key: 'amount',
      label: 'Amount',
      sortable: true,
      align: 'center',
      render: (value) => (
        <div className="flex justify-center">
          <span className="font-semibold text-green-700 text-xs sm:text-sm">
            ₱{value.toLocaleString()}
          </span>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      align: 'center',
      render: (value) => {
        const statusConfig = {
          COMPLETED: 'bg-green-100 text-green-800 border-green-200',
          PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          PROCESSING: 'bg-blue-100 text-blue-800 border-blue-200',
        }
        return (
          <div className="flex justify-center">
            <span
              className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold border ${statusConfig[value] || 'bg-gray-100 text-gray-800 border-gray-200'}`}
            >
              {value}
            </span>
          </div>
        )
      },
    },
  ]

  // Define columns for Pending Deliveries table (matching Users style)
  const deliveryColumns = [
    {
      key: 'id',
      label: 'Delivery ID',
      sortable: true,
      align: 'center',
      render: (value) => (
        <div className="flex justify-center">
          <span className="font-mono font-semibold text-blue-700 text-xs sm:text-sm">{value}</span>
        </div>
      ),
    },
    {
      key: 'customer',
      label: 'Customer',
      sortable: true,
      align: 'center',
      render: (value, row) => (
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-1 sm:gap-2">
            <FiUser className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
            <span className="font-medium text-gray-800 text-xs sm:text-sm truncate max-w-20 sm:max-w-30">
              {value}
            </span>
          </div>
          <span className="text-gray-500 text-[10px]">{row.scheduled}</span>
        </div>
      ),
    },
    {
      key: 'address',
      label: 'Address',
      sortable: true,
      align: 'center',
      className: 'hidden md:table-cell',
      render: (value) => (
        <div className="flex justify-center items-center gap-1 sm:gap-2">
          <FiMapPin className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
          <span className="text-gray-600 text-xs sm:text-sm truncate max-w-37.5" title={value}>
            {value}
          </span>
        </div>
      ),
    },
    {
      key: 'rider',
      label: 'Rider',
      sortable: true,
      align: 'center',
      render: (value) => (
        <div className="flex justify-center items-center gap-1 sm:gap-2">
          <FiTruck className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
          <span
            className={`text-xs sm:text-sm ${value === 'Unassigned' ? 'text-gray-400 italic' : 'text-gray-700'}`}
          >
            {value}
          </span>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      align: 'center',
      render: (value) => {
        const statusConfig = {
          ASSIGNED: 'bg-purple-100 text-purple-800 border-purple-200',
          PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        }
        return (
          <div className="flex justify-center">
            <span
              className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold border ${statusConfig[value] || 'bg-gray-100 text-gray-800 border-gray-200'}`}
            >
              {value}
            </span>
          </div>
        )
      },
    },
  ]

  // Simulate refresh function
  const handleRefresh = () => {
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
    }, 1000)
  }

  // Prepare card data with peso sign where applicable
  const cardData = [
    {
      title: 'Orders Today',
      count: stats.ordersToday,
      Icon: FiShoppingBag,
      color: 'rose',
    },
    {
      title: 'Sales Today',
      count: stats.salesToday,
      Icon: PiCoins,
      color: 'rose',
      isCurrency: true,
    },
    {
      title: 'Pending Orders',
      count: stats.pendingOrders,
      Icon: FiClock,
      color: 'rose',
    },
    {
      title: 'Active Deliveries',
      count: stats.activeDeliveries,
      Icon: FiTruck,
      color: 'rose',
    },
    {
      title: 'Available Riders',
      count: stats.availableRiders,
      Icon: FiUser,
      color: 'rose',
    },
    {
      title: 'New Inquiries',
      count: stats.newInquiries,
      Icon: FiMail,
      color: 'rose',
    },
  ]

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-[#9C4A15] mx-auto"></div>
          <p className="mt-3 sm:mt-4 text-sm sm:text-base text-gray-600">Loading dashboard...</p>
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
            Error loading dashboard
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
      <div className="flex-1 min-h-0 p-2 sm:p-3 overflow-auto">
        {/* Welcome Section */}
        <div className="bg-component shadow-lg rounded-lg border border-slate-400 mb-3">
          <div className="px-3 sm:px-4 py-2 sm:py-1">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800">
                  Dashboard Overview
                </h1>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">
                  Welcome back! Here's how your business is performing today.
                </p>
              </div>
            </div>
          </div>
        </div>

        <Cards cardData={cardData} />

        {/* Charts Section - 70/30 split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mt-3">
          {/* Sales Overview Chart Container - 70% width on large screens */}
          <div className="lg:col-span-8 h-80 sm:h-96 overflow-hidden">
            <div className="bg-component shadow-lg rounded-lg border border-slate-400 h-full flex flex-col p-3">
              <div className="mb-3">
                <h3 className="text-sm sm:text-base font-semibold text-gray-800">Sales Overview</h3>
              </div>
              <div className="flex-1 min-h-0 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={salesData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                    <YAxis yAxisId="left" width={45} tick={{ fontSize: 12 }} />
                    <YAxis yAxisId="right" orientation="right" width={45} tick={{ fontSize: 12 }} />
                    <Tooltip
                      formatter={(value, name) => {
                        if (name === 'sales') return [`₱${value.toLocaleString()}`, 'Sales']
                        return [value, 'Orders']
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="sales"
                      stroke="#9C4A15"
                      name="Sales (₱)"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      activeDot={{ r: 5 }}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="orders"
                      stroke="#2A1803"
                      name="Orders"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Category Distribution Chart Container - 30% width on large screens */}
          <div className="lg:col-span-4 h-80 sm:h-96 overflow-hidden">
            <div className="bg-component shadow-lg rounded-lg border border-slate-400 h-full flex flex-col p-3">
              <div className="mb-3">
                <h3 className="text-sm sm:text-base font-semibold text-gray-800">
                  Sales by Category
                </h3>
              </div>
              <div className="flex-1 min-h-0 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => {
                        // Only show labels on larger screens
                        if (window.innerWidth < 1024) return null
                        return `${name} ${(percent * 100).toFixed(0)}%`
                      }}
                      outerRadius="70%"
                      innerRadius="30%"
                      fill="#8884d8"
                      dataKey="value"
                      paddingAngle={2}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* Tables Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-3">
          {/* Recent Orders Table Container */}
          <div className="h-80 sm:h-96 overflow-hidden">
            <div className="bg-component shadow-lg rounded-lg border border-slate-400 h-full flex flex-col p-2">
              <div className="px-2 py-1 mb-2">
                <h2 className="text-sm sm:text-base font-semibold text-gray-800">Recent Orders</h2>
              </div>
              <PlatformTable
                columns={orderColumns}
                data={recentOrders}
                maxHeight="calc(100% - 60px)"
                responsive={true}
                showActions={false}
                containerClassName="h-full"
              />
            </div>
          </div>

          {/* Pending Deliveries Table Container */}
          <div className="h-80 sm:h-96 overflow-hidden">
            <div className="bg-component shadow-lg rounded-lg border border-slate-400 h-full flex flex-col p-2">
              <div className="px-2 py-1 mb-2">
                <h2 className="text-sm sm:text-base font-semibold text-gray-800">
                  Pending Deliveries
                </h2>
              </div>
              <PlatformTable
                columns={deliveryColumns}
                data={pendingDeliveries}
                maxHeight="calc(100% - 60px)"
                responsive={true}
                showActions={false}
                containerClassName="h-full"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
