const { Order } = require('../database/model/Order')
const { Query, Transaction } = require('../database/utility/queries.util')

// GET ALL
const getOrders = async (req, res) => {
  const userId = req.context.id
  const accessId = req.context.access_id

  try {
    let statement = `
      SELECT 
        o.*,
        c.c_fullname as customer_name
      FROM orders o
      LEFT JOIN customer c ON o.or_customer_id = c.c_id
    `
    const params = []

    if (accessId !== 1) {
      statement += ' WHERE o.or_customer_id = ?'
      params.push(userId)
    }

    statement += ' ORDER BY o.or_date DESC'

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

// GET ORDER ITEMS WITH CUSTOMER NAME
const getOrderItem = async (req, res) => {
  const { id } = req.params
  const customerId = req.context.id

  if (!id || isNaN(Number(id))) {
    return res.status(400).json({ message: 'Valid order ID is required.' })
  }

  try {
    // Get order with customer information
    const order = await Query(
      `
      SELECT 
        o.or_id,
        o.or_date,
        o.or_total,
        o.or_status,
        o.or_payment_type,
        o.or_payment_reference,
        o.or_details,
        c.c_id,
        c.c_fullname as customer_name,
        c.c_email as customer_email
      FROM orders o
      LEFT JOIN customer c ON o.or_customer_id = c.c_id
      WHERE o.or_id = ? AND o.or_customer_id = ?
    `,
      [id, customerId],
    )

    if (!order.length) {
      return res.status(403).json({ message: 'You are not allowed to access this order.' })
    }

    // ORDER ITEMS with product information
    const items = await Query(
      `SELECT 
        oi.*,
        p.p_name as product_name,
        p.p_category_id,
        pc.pc_name as category_name
       FROM order_item oi
       LEFT JOIN product p ON oi.oi_product_id = p.p_id
       LEFT JOIN product_category pc ON p.p_category_id = pc.pc_id
       WHERE oi.oi_order_id = ?
       ORDER BY oi.oi_id`,
      [id],
      Order.order_item.prefix_,
    )

    res.status(200).json({
      message: 'Order details retrieved successfully.',
      order: order[0],
      items: {
        count: items.length,
        data: items,
      },
    })
  } catch (error) {
    console.error('Error retrieving order items:', error)
    res.status(500).json({ message: 'Error retrieving order items.' })
  }
}

// CREATE
const addOrder = async (req, res) => {
  const { customer_id, payment_type, payment_reference, details, status = 'PAID', items } = req.body

  const validStatuses = ['PAID', 'ON-DELIVERY', 'COMPLETE']
  if (!validStatuses.includes(status)) {
    return res.status(400).json({
      message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
    })
  }

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({
      message: 'Order items must be a non-empty array.',
    })
  }

  for (const item of items) {
    if (!item.product_id || !item.quantity || !item.price || item.quantity <= 0) {
      return res.status(400).json({
        message: 'Each item must have product_id, quantity > 0, and price.',
      })
    }
  }

  const total = items.reduce((sum, item) => sum + Number(item.quantity) * Number(item.price), 0)

  try {
    // PRE-CHECK INVENTORY
    const inventoryMap = {}

    for (const item of items) {
      const [row] = await Query(
        `
        SELECT 
          i.i_id,
          i.i_current_stock,
          p.p_name,
          p.p_status
        FROM inventory i
        INNER JOIN product p ON i.i_product_id = p.p_id
        WHERE i.i_product_id = ?
        `,
        [item.product_id],
      )

      if (!row) {
        return res.status(404).json({
          message: `Product ID ${item.product_id} not found.`,
        })
      }

      if (row.p_status !== 'AVAILABLE') {
        return res.status(400).json({
          message: `Product "${row.p_name}" is not available.`,
        })
      }

      if (row.i_current_stock < item.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for "${row.p_name}". Available: ${row.i_current_stock}`,
        })
      }

      inventoryMap[item.product_id] = row
    }

    //  BUILD TRANSACTION QUERIES
    const queries = []

    // INSERT ORDER
    queries.push({
      sql: `
        INSERT INTO orders
        (or_date, or_customer_id, or_total, or_payment_type, or_payment_reference, or_details, or_status)
        VALUES (NOW(), ?, ?, ?, ?, ?, ?)
      `,
      values: [customer_id, total, payment_type, payment_reference, details, status],
    })

    // PROCESS ITEMS
    for (const item of items) {
      const inventory = inventoryMap[item.product_id]
      const previousStock = inventory.i_current_stock
      const newStock = previousStock - item.quantity

      // ORDER ITEM
      queries.push({
        sql: `
          INSERT INTO order_item
          (oi_order_id, oi_product_id, oi_quantity, oi_price)
          VALUES (LAST_INSERT_ID(), ?, ?, ?)
        `,
        values: [item.product_id, item.quantity, item.price],
      })

      // INVENTORY UPDATE
      queries.push({
        sql: `
          UPDATE inventory
          SET i_previous_stock = ?, i_current_stock = ?
          WHERE i_id = ?
        `,
        values: [previousStock, newStock, inventory.i_id],
      })

      // INVENTORY HISTORY
      queries.push({
        sql: `
          INSERT INTO inventory_history
          (ih_inventory_id, ih_date, ih_stock_before, ih_stock_after, ih_status)
          VALUES (?, NOW(), ?, ?, 'sold')
        `,
        values: [inventory.i_id, previousStock, newStock],
      })
    }

    //  EXECUTE TRANSACTIONS
    await Transaction(queries)

    // FETCH ORDER ID
    const [orderRow] = await Query('SELECT LAST_INSERT_ID() AS order_id')

    res.status(200).json({
      message: 'Order created successfully and inventory updated.',
      order_id: orderRow.order_id,
      total,
      items_count: items.length,
      status,
    })
  } catch (error) {
    console.error('Order transaction failed:', error)

    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({
        message: 'Invalid customer_id or product reference.',
      })
    }

    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        message: 'Duplicate order entry.',
      })
    }

    res.status(500).json({
      message: 'Failed to create order.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    })
  }
}

module.exports = {
  getOrders,
  getOrderItem,
  addOrder,
}
