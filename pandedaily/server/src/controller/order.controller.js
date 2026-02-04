const { Order } = require('../database/model/Order')
const { Query } = require('../database/utility/queries.util')

// GET ALL
const getOrders = async (req, res) => {
  try {
    const statement = `SELECT * FROM orders`

    const data = await Query(statement, [], Order.orders.prefix_)
    res.status(200).json({ message: 'Order data retrieved.', data })
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving order data.' })
  }
}

const getOrderItem = async (req, res) => {
  try {
    const statement = `SELECT * FROM order_item`

    const data = await Query(statement, [], Order.order_item.prefix_)
    res.status(200).json({ message: 'Order item data retrieved.', data })
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving order item data.' })
  }
}

// CREATE
const addOrder = async (req, res) => {
  const { customer_id, payment_type, payment_reference, details, status, items } = req.body

  if (!items?.length) {
    return res.status(400).json({
      message: 'Order items are required.',
    })
  }

  const total = items.reduce((sum, item) => sum + item.quantity * item.price, 0)

  try {
    const orderResult = await Query(
      `INSERT INTO orders
       (or_customer_id, or_total, or_payment_type, or_payment_reference, or_details, or_status)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [customer_id, total, payment_type, payment_reference, details, status],
    )

    res.status(200).json({
      message: 'Order added successfully.',
      order_id: orderResult.insertId,
      total,
    })
  } catch (error) {
    console.error('Error adding order:', error)
    res.status(500).json({ message: 'Error adding order data.' })
  }
}

const addOrderItem = async (req, res) => {
  const { order_id, product_id, quantity, price } = req.body

  try {
    const statement = `INSERT INTO order_item(oi_order_id, oi_product_id, oi_quantity, oi_price) VALUES(?, ?, ?, ?)`
    const data = await Query(statement, [order_id, product_id, quantity, price])

    res.status(200).json({
      message: 'Order item data added successfully.',
      data,
      insertedId: data.insertId,
    })
  } catch (error) {
    console.error('Error adding order item data:', error)
    console.error('Error SQL:', error.sql)
    console.error('Error parameters:', [order_id, product_id, quantity, price])

    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Order item with this order_id already exists.' })
    }

    res.status(500).json({ message: 'Error adding order item data.' })
  }
}

module.exports = {
  getOrders,
  getOrderItem,
  addOrder,
  addOrderItem,
}
