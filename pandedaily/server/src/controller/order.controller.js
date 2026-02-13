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

    statement += ' ORDER BY o.or_createddate DESC'

    const data = await Query(statement, params, Order.orders.prefix_)

    return res.status(200).json({
      message: 'Orders retrieved successfully.',
      count: data.length,
      data: data || [],
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
  const accessId = req.context.access_id

  if (!id || isNaN(Number(id))) {
    return res.status(400).json({ message: 'Valid order ID is required.' })
  }

  try {
    let whereClause = 'o.or_id = ?'
    const params = [id]

    if (accessId !== 1) {
      whereClause += ' AND o.or_customer_id = ?'
      params.push(customerId)
    }

    // Get order with customer information
    const order = await Query(
      `
      SELECT 
        o.or_id,
        o.or_createddate,
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
      WHERE ${whereClause}
    `,
      params,
    )

    if (!order.length) {
      return res.status(403).json({ message: 'You are not allowed to access this order.' })
    }

    // ORDER ITEMS
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
  const {
    customer_id,
    payment_type,
    payment_reference,
    details,
    status = 'PAID',
    delivery_schedules,
    items,
  } = req.body

  const validStatuses = ['PAID', 'APPROVED', 'REJECTED', 'OUT-FOR-DELIVERY', 'COMPLETE']
  const validTimeSlots = ['MORNING', 'EVENING']

  // Basic validation
  if (!customer_id) {
    return res.status(400).json({ message: 'Customer ID is required.' })
  }

  if (!validStatuses.includes(status)) {
    return res.status(400).json({
      message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
    })
  }

  if (!Array.isArray(delivery_schedules) || delivery_schedules.length === 0) {
    return res.status(400).json({
      message: 'At least one delivery schedule is required.',
    })
  }

  // Validate delivery schedules
  for (const schedule of delivery_schedules) {
    if (
      !schedule.name ||
      !schedule.date ||
      !schedule.start_time ||
      !schedule.end_time ||
      !schedule.cutoff
    ) {
      return res.status(400).json({
        message: 'Each delivery schedule must have name, date, start_time, end_time, and cutoff.',
      })
    }
  }

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({
      message: 'Order items must be a non-empty array.',
    })
  }

  for (const item of items) {
    if (!item.product_id || !item.quantity || !item.price || Number(item.quantity) <= 0) {
      return res.status(400).json({
        message: 'Each item must have product_id, quantity > 0, and price.',
      })
    }
  }

  const total = items.reduce((sum, item) => sum + Number(item.quantity) * Number(item.price), 0)

  try {
    // Check inventory
    const inventoryMap = {}

    for (const item of items) {
      const rows = await Query(
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

      const row = rows[0]

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

    // Build transaction
    const queries = []

    queries.push({
      sql: `
        INSERT INTO orders
        (or_customer_id, or_total, or_payment_type, 
         or_payment_reference, or_details, or_status, or_createddate)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      values: [
        customer_id,
        total,
        payment_type,
        payment_reference,
        details,
        status,
        new Date().toISOString().slice(0, 19).replace('T', ' '),
      ],
    })

    // Execute first to get order ID
    const result = await Transaction(queries, true)
    const orderId =
      result.insertId || result.order_id || (await Query('SELECT LAST_INSERT_ID() as id'))[0].id

    // Second transaction
    const followUpQueries = []

    // INSERT DELIVERY SCHEDULES
    for (const schedule of delivery_schedules) {
      const now = new Date().toISOString().slice(0, 19).replace('T', ' ')

      followUpQueries.push({
        sql: `
          INSERT INTO delivery_schedule
          (ds_order_id, ds_name, ds_date, ds_start_time, ds_end_time, ds_status, ds_createddate, ds_cutoff)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `,
        values: [
          orderId,
          schedule.name,
          schedule.date,
          schedule.start_time,
          schedule.end_time,
          'PENDING',
          now,
          schedule.cutoff,
        ],
      })
    }

    // process order items and inventory
    for (const item of items) {
      const inventory = inventoryMap[item.product_id]
      const previousStock = inventory.i_current_stock
      const newStock = previousStock - item.quantity

      // Order item
      followUpQueries.push({
        sql: `
          INSERT INTO order_item
          (oi_order_id, oi_product_id, oi_quantity, oi_price)
          VALUES (?, ?, ?, ?)
        `,
        values: [orderId, item.product_id, item.quantity, item.price],
      })

      // Inventory update
      followUpQueries.push({
        sql: `
          UPDATE inventory
          SET i_previous_stock = ?, i_current_stock = ?
          WHERE i_id = ?
        `,
        values: [previousStock, newStock, inventory.i_id],
      })

      // Inventory history
      followUpQueries.push({
        sql: `
          INSERT INTO inventory_history
          (ih_inventory_id, ih_date, ih_stock_before, ih_stock_after, ih_status)
          VALUES (?, NOW(), ?, ?, 'sold')
        `,
        values: [inventory.i_id, previousStock, newStock],
      })
    }

    await Transaction(followUpQueries)

    // Get the created delivery schedules to return
    const createdSchedules = await Query(
      `SELECT ds_id, ds_name, ds_date, ds_status 
       FROM delivery_schedule 
       WHERE ds_order_id = ?`,
      [orderId],
    )

    res.status(201).json({
      message: 'Order created successfully.',
      order_id: orderId,
      total,
      items_count: items.length,
      delivery_schedules_count: delivery_schedules.length,
      delivery_schedules: createdSchedules,
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
