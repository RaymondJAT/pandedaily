const { Order } = require('../database/model/Order')
const { Query } = require('../database/utility/queries.util')
const { Transaction } = require('../database/utility/queries.util')

// GET ALL
const getOrders = async (req, res) => {
  const userId = req.context.id
  const accessId = req.context.access_id

  try {
    let statement = 'SELECT * FROM orders'
    const params = []

    if (accessId !== 1) {
      statement += ' WHERE or_customer_id = ?'
      params.push(userId)
    }

    const data = await Query(statement, params, Order.orders.prefix_)

    if (!data.length) {
      return res.status(404).json({ message: 'No orders found.' })
    }

    res.status(200).json({
      message: 'Orders retrieved successfully.',
      count: data.length,
      data,
    })
  } catch (error) {
    console.error('Error retrieving orders:', error)
    res.status(500).json({ message: 'Error retrieving orders.' })
  }
}

const getOrderItem = async (req, res) => {
  const { id } = req.params
  const customerId = req.context.id

  if (!id || isNaN(Number(id))) {
    return res.status(400).json({ message: 'Valid order ID is required.' })
  }

  try {
    const order = await Query(`SELECT or_id FROM orders WHERE or_id = ? AND or_customer_id = ?`, [
      id,
      customerId,
    ])

    if (!order.length) {
      return res.status(403).json({ message: 'You are not allowed to access this order.' })
    }

    // ORDER ITEMS
    const items = await Query(
      `SELECT * FROM order_item WHERE oi_order_id = ?`,
      [id],
      Order.order_item.prefix_,
    )

    res.status(200).json({
      message: 'Order items retrieved successfully.',
      count: items.length,
      data: items,
    })
  } catch (error) {
    console.error('Error retrieving order items:', error)
    res.status(500).json({ message: 'Error retrieving order items.' })
  }
}

// CREATE
const addOrder = async (req, res) => {
  const { customer_id, payment_type, payment_reference, details, status, items } = req.body

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'Order items must be a non-empty array.' })
  }

  const total = items.reduce((sum, item) => sum + Number(item.quantity) * Number(item.price), 0)

  try {
    const queries = []

    // INSERT ORDER
    queries.push({
      sql: `
        INSERT INTO orders
        (or_customer_id, or_total, or_payment_type, or_payment_reference, or_details, or_status)
        VALUES (?, ?, ?, ?, ?, ?)
      `,
      values: [customer_id, total, payment_type, payment_reference, details, status],
    })

    // INSERT ORDER ITEMS
    for (const item of items) {
      queries.push({
        sql: `
          INSERT INTO order_item
          (oi_order_id, oi_product_id, oi_quantity, oi_price)
          VALUES (LAST_INSERT_ID(), ?, ?, ?)
        `,
        values: [item.product_id, item.quantity, item.price],
      })
    }

    await Transaction(queries)

    res.status(200).json({
      message: 'Order created successfully.',
      total,
      items_count: items.length,
    })
  } catch (error) {
    console.error('Order transaction failed:', error)
    res.status(500).json({ message: 'Failed to create order.' })
  }
}

module.exports = {
  getOrders,
  getOrderItem,
  addOrder,
}
