import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import { useOrders } from '../../hooks/useOrders'
import { fadeInUp, fadeIn, staggerContainer } from '../../utils/animations'
import PageHeader from '../../components/order/PageHeader'
import OrderList from '../../components/myorder/OrderList'
import OrderDetails from '../../components/myorder/OrderDetails'
import OrderFilters from '../../components/myorder/OrderFilters'
import EmptyOrderState from '../../components/myorder/EmptyOrderState'

const MyOrder = () => {
  const { user } = useAuth()
  const {
    orders,
    filteredOrders,
    selectedOrder,
    selectedOrderDetails,
    filterStatus,
    searchQuery,
    loading,
    loadingDetails,
    setFilterStatus,
    setSearchQuery,
    setSelectedOrder,
  } = useOrders(user)

  const [showFilters, setShowFilters] = useState(false)

  if (loading) {
    return (
      <section
        className="min-h-screen py-8 md:py-12 font-[titleFont]"
        style={{ backgroundColor: '#F5EFE7' }}
      >
        <div className="container mx-auto px-4 flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#9C4A15]"></div>
        </div>
      </section>
    )
  }

  return (
    <section
      className="min-h-screen py-8 md:py-12 font-[titleFont]"
      style={{ backgroundColor: '#F5EFE7' }}
    >
      <div className="container mx-auto px-4">
        <PageHeader
          title="My Orders"
          subtitle="Track and manage your orders"
          fadeInUp={fadeInUp}
          alignment="center"
        />

        <motion.div
          className="mx-auto"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, amount: 0.1 }}
          variants={staggerContainer}
        >
          {/* Filters */}
          <OrderFilters
            filterStatus={filterStatus}
            searchQuery={searchQuery}
            onFilterChange={setFilterStatus}
            onSearchChange={setSearchQuery}
            showFilters={showFilters}
            onToggleFilters={() => setShowFilters(!showFilters)}
          />

          {filteredOrders.length === 0 ? (
            <EmptyOrderState />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Orders List */}
              <motion.div variants={fadeIn} className="lg:col-span-1">
                <h2 className="text-xl md:text-2xl font-light mb-6" style={{ color: '#2A1803' }}>
                  Your Orders
                </h2>

                <OrderList
                  orders={filteredOrders}
                  selectedOrder={selectedOrder}
                  onSelectOrder={setSelectedOrder}
                />
              </motion.div>

              {/* Order Details */}
              <motion.div variants={fadeIn} transition={{ delay: 0.1 }} className="lg:col-span-2">
                <h2 className="text-xl md:text-2xl font-light mb-6" style={{ color: '#2A1803' }}>
                  Order Details
                </h2>

                <OrderDetails
                  selectedOrder={selectedOrder}
                  selectedOrderDetails={selectedOrderDetails}
                  loading={loadingDetails}
                />
              </motion.div>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  )
}

export default MyOrder
