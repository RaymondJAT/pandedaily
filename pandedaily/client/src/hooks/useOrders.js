import { useState, useEffect } from 'react'
import { getOrders, getOrderItem } from '../services/api'

export const useOrders = (user) => {
  const [orders, setOrders] = useState([])
  const [filteredOrders, setFilteredOrders] = useState([])
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null)
  const [filterStatus, setFilterStatus] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [loadingDetails, setLoadingDetails] = useState(false)

  // Fetch orders
  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true)
      try {
        const response = await getOrders()

        let ordersData = []
        if (response?.data && Array.isArray(response.data)) {
          ordersData = response.data
        } else if (Array.isArray(response)) {
          ordersData = response
        } else if (response?.orders && Array.isArray(response.orders)) {
          ordersData = response.orders
        }

        ordersData = ordersData
          .map((order) => ({
            or_id: order.id,
            or_customer_id: order.customer_id,
            or_total: parseFloat(order.total) || 0,
            or_payment_type: order.payment_type,
            or_payment_reference: order.payment_reference,
            or_details: order.details,
            or_status: order.status,
            or_createddate: order.createddate || order.or_createddate,
            customer_name: order.customer_name,
          }))
          .filter((order) => order?.or_id != null)

        setOrders(ordersData)
        setFilteredOrders(ordersData)
        if (ordersData.length > 0) {
          setSelectedOrder(ordersData[0])
        }
      } catch (error) {
        console.error('Error fetching orders:', error)
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchOrders()
    }
  }, [user])

  // Fetch order details when selected order changes
  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!selectedOrder?.or_id) {
        return
      }

      setLoadingDetails(true)
      try {
        const response = await getOrderItem(selectedOrder.or_id)
        setSelectedOrderDetails(response)
      } catch (error) {
        console.error('Error fetching order details:', error)
      } finally {
        setLoadingDetails(false)
      }
    }

    fetchOrderDetails()
  }, [selectedOrder])

  // Filter orders
  useEffect(() => {
    let filtered = orders
    if (filterStatus !== 'all') {
      filtered = filtered.filter((order) => order?.or_status === filterStatus)
    }
    if (searchQuery) {
      filtered = filtered.filter((order) =>
        order?.or_id?.toString().toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }
    setFilteredOrders(filtered)

    if (selectedOrder && !filtered.find((order) => order?.or_id === selectedOrder?.or_id)) {
      setSelectedOrder(filtered.length > 0 ? filtered[0] : null)
      setSelectedOrderDetails(null)
    }
  }, [filterStatus, searchQuery, orders, selectedOrder])

  return {
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
  }
}
