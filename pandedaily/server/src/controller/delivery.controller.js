const { Delivery } = require('../database/model/Delivery')
const { Query, Transaction } = require('../database/utility/queries.util')

// GET ALL
const getDelivery = async (req, res) => {
  const { access_id } = req.context

  try {
    if (access_id !== 1) {
      return res.status(403).json({
        message: 'You are not allowed to access delivery data.',
      })
    }

    const statement = `
      SELECT 
        d.*,
        o.or_customer_id,
        c.c_fullname as customer_name,
        o.or_status as order_status,
        r.r_fullname as rider_name,
        r.r_status as rider_status
      FROM delivery d
      INNER JOIN orders o ON d.d_order_id = o.or_id
      INNER JOIN customer c ON o.or_customer_id = c.c_id
      LEFT JOIN rider r ON d.d_rider_id = r.r_id
      WHERE r.r_status != 'DELETED' OR r.r_status IS NULL
      ORDER BY d.d_date DESC
    `

    const data = await Query(statement, [], Delivery.delivery.prefix_)

    if (!data.length) {
      return res.status(404).json({ message: 'No deliveries found.' })
    }

    res.status(200).json({
      message: 'Deliveries retrieved successfully.',
      count: data.length,
      data,
    })
  } catch (error) {
    console.error('Error retrieving deliveries:', error)
    res.status(500).json({ message: 'Error retrieving deliveries.' })
  }
}

// GET BY ID
const getDeliveryById = async (req, res) => {
  const { id } = req.params
  const { access_id } = req.context

  try {
    if (access_id !== 1) {
      return res.status(403).json({
        message: 'You are not allowed to access delivery data.',
      })
    }

    // Get delivery with order and rider info
    const deliveryStatement = `
      SELECT 
        d.*,
        o.or_customer_id,
        c.c_fullname as customer_name,
        o.or_delivery_address,
        o.or_status as order_status,
        r.r_fullname as rider_name,
        r.r_status as rider_status
      FROM delivery d
      INNER JOIN orders o ON d.d_order_id = o.or_id
      INNER JOIN customer c ON o.or_customer_id = c.c_id
      LEFT JOIN rider r ON d.d_rider_id = r.r_id
      WHERE d.d_id = ?
    `

    const deliveryData = await Query(deliveryStatement, [id], Delivery.delivery.prefix_)

    if (!deliveryData.length) {
      return res.status(404).json({ message: 'No delivery found.' })
    }

    // Get delivery activity history
    const activityStatement = `
  SELECT *
  FROM delivery_activity
  WHERE da_delivery_id = ?
  ORDER BY da_date DESC  
`
    const activities = await Query(activityStatement, [id])

    // Get rider activity for this delivery
    const riderActivityStatement = `
      SELECT *
      FROM rider_activity
      WHERE ra_delivery_id = ?
      ORDER BY ra_date DESC
    `
    const riderActivities = await Query(riderActivityStatement, [id])

    res.status(200).json({
      message: 'Delivery retrieved successfully.',
      data: {
        ...deliveryData[0],
        activities: activities,
        rider_activities: riderActivities,
      },
    })
  } catch (error) {
    console.error('Error retrieving delivery:', error)
    res.status(500).json({ message: 'Error retrieving delivery.' })
  }
}

// CREATE
const addDelivery = async (req, res) => {
  const { order_id, rider_id, date } = req.body

  if (!order_id || !rider_id || !date) {
    return res.status(400).json({ message: 'Delivery data is required.' })
  }

  try {
    // CONNECT TO ORDER
    const orderCheck = await Query(
      `SELECT or_id, or_status 
       FROM orders 
       WHERE or_id = ?`,
      [order_id],
    )

    if (!orderCheck.length) {
      return res.status(404).json({ message: 'Order not found.' })
    }

    if (orderCheck[0].or_status !== 'PAID') {
      return res.status(400).json({
        message: `Cannot create delivery. Order status must be PAID, current: ${orderCheck[0].or_status}`,
      })
    }

    // Validate rider exists and is ACTIVE
    const riderCheck = await Query(
      'SELECT r_id, r_status FROM rider WHERE r_id = ? AND r_status != "DELETED"',
      [rider_id],
    )

    if (!riderCheck.length) {
      return res.status(404).json({ message: 'Rider not found.' })
    }

    if (riderCheck[0].r_status !== 'ACTIVE') {
      return res.status(400).json({
        message: 'Cannot assign delivery to inactive rider. Rider must be ACTIVE.',
      })
    }

    // Check if order already has delivery
    const existingDelivery = await Query('SELECT d_id FROM delivery WHERE d_order_id = ?', [
      order_id,
    ])

    if (existingDelivery.length > 0) {
      return res.status(409).json({
        message: 'This order already has a delivery assigned.',
      })
    }

    const queries = []

    // Insert delivery
    queries.push({
      sql: `
        INSERT INTO delivery
        (d_order_id, d_rider_id, d_date, d_status)
        VALUES (?, ?, ?, 'PENDING')
      `,
      values: [order_id, rider_id, date],
    })

    // Log delivery activity
    queries.push({
      sql: `
        INSERT INTO delivery_activity
        (da_delivery_id, da_status, da_date)
        VALUES (LAST_INSERT_ID(), 'PENDING', NOW())
      `,
      values: [],
    })

    // Log rider activity with CORRECT status
    queries.push({
      sql: `
        INSERT INTO rider_activity
        (ra_rider_id, ra_delivery_id, ra_status, ra_date)
        VALUES (?, LAST_INSERT_ID(), 'ASSIGNED', NOW())
      `,
      values: [rider_id],
    })

    // Update order status to ON-DELIVERY
    queries.push({
      sql: `
        UPDATE orders
        SET or_status = 'ON-DELIVERY'
        WHERE or_id = ?
      `,
      values: [order_id],
    })

    await Transaction(queries)

    res.status(201).json({
      message: 'Delivery created successfully.',
      order_status: 'ON-DELIVERY',
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      message: 'Failed to create delivery.',
    })
  }
}

// UPDATE
const updateDelivery = async (req, res) => {
  const { id } = req.params
  const { order_id, rider_id, date, status } = req.body

  const validStatuses = ['PENDING', 'FOR-PICK-UP', 'OUT-FOR-DELIVERY', 'COMPLETE']

  // Map delivery status to rider activity status
  const riderStatusMap = {
    PENDING: 'ASSIGNED',
    'FOR-PICK-UP': 'OUT-FOR-DELIVERY',
    'OUT-FOR-DELIVERY': 'OUT-FOR-DELIVERY',
    COMPLETE: 'DELIVERED',
  }

  // Map delivery status to order status
  const orderStatusMap = {
    PENDING: 'ON-DELIVERY',
    'FOR-PICK-UP': 'ON-DELIVERY',
    'OUT-FOR-DELIVERY': 'ON-DELIVERY',
    COMPLETE: 'COMPLETE',
  }

  if (!order_id || !rider_id || !date || !status) {
    return res.status(400).json({ message: 'Delivery data is required.' })
  }

  if (!validStatuses.includes(status)) {
    return res.status(400).json({
      message: `Invalid status. Must be: ${validStatuses.join(', ')}`,
    })
  }

  try {
    // Validate order exists
    const orderCheck = await Query('SELECT or_id FROM orders WHERE or_id = ?', [order_id])

    if (!orderCheck.length) {
      return res.status(404).json({ message: 'Order not found.' })
    }

    // Validate rider exists and is ACTIVE
    const riderCheck = await Query(
      'SELECT r_id, r_status FROM rider WHERE r_id = ? AND r_status != "DELETED"',
      [rider_id],
    )

    if (!riderCheck.length) {
      return res.status(404).json({ message: 'Rider not found.' })
    }

    if (riderCheck[0].r_status !== 'ACTIVE') {
      return res.status(400).json({
        message: 'Cannot assign delivery to inactive rider. Rider must be ACTIVE.',
      })
    }

    // Get current delivery status
    const currentDelivery = await Query('SELECT d_status FROM delivery WHERE d_id = ?', [id])

    const previousStatus = currentDelivery.length ? currentDelivery[0].d_status : null

    const queries = []

    // Update delivery
    queries.push({
      sql: `
        UPDATE delivery
        SET d_order_id = ?, d_rider_id = ?, d_date = ?, d_status = ?
        WHERE d_id = ?
      `,
      values: [order_id, rider_id, date, status, id],
    })

    // Log delivery activity
    queries.push({
      sql: `
    INSERT INTO delivery_activity
    (da_delivery_id, da_status, da_date)
    VALUES (?, ?, NOW())
  `,
      values: [id, status],
    })

    // Log rider activity with CORRECT mapped status
    queries.push({
      sql: `
        INSERT INTO rider_activity
        (ra_rider_id, ra_delivery_id, ra_status, ra_date)
        VALUES (?, ?, ?, NOW())
      `,
      values: [rider_id, id, riderStatusMap[status]],
    })

    // Update order status based on delivery status
    queries.push({
      sql: `
        UPDATE orders
        SET or_status = ?
        WHERE or_id = ?
      `,
      values: [orderStatusMap[status], order_id],
    })

    await Transaction(queries)

    res.status(200).json({
      message: 'Delivery updated successfully.',
      data: {
        delivery_id: id,
        previous_status: previousStatus,
        current_status: status,
        rider_activity_status: riderStatusMap[status],
        order_status: orderStatusMap[status],
      },
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      message: 'Failed to update delivery.',
    })
  }
}

module.exports = {
  getDelivery,
  getDeliveryById,
  addDelivery,
  updateDelivery,
}
