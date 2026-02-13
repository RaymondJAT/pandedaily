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
        ds.ds_id as schedule_id,
        ds.ds_name as schedule_name,
        ds.ds_date as schedule_date,
        ds.ds_start_time,
        ds.ds_end_time,
        ds.ds_status as schedule_status,
        ds.ds_cutoff,
        o.or_id as order_id,
        o.or_customer_id,
        o.or_total,
        o.or_status as order_status,
        o.or_createddate as order_date,
        c.c_fullname as customer_name,
        c.c_address as customer_address,
        c.c_contact as customer_contact,
        r.r_fullname as rider_name,
        r.r_contact as rider_contact,
        r.r_status as rider_status
      FROM delivery d
      INNER JOIN delivery_schedule ds ON d.d_delivery_schedule_id = ds.ds_id
      INNER JOIN orders o ON ds.ds_order_id = o.or_id
      INNER JOIN customer c ON o.or_customer_id = c.c_id
      LEFT JOIN rider r ON d.d_rider_id = r.r_id
      ORDER BY d.d_createddate DESC
    `

    const data = await Query(statement, [], Delivery.delivery.prefix_)

    res.status(200).json({
      message: 'Deliveries retrieved successfully.',
      count: data.length,
      data: data || [],
    })
  } catch (error) {
    console.error('Error retrieving deliveries:', error)
    res.status(500).json({ message: 'Error retrieving deliveries.' })
  }
}

const getDeliveryActivities = async (req, res) => {
  const { access_id } = req.context

  try {
    if (access_id !== 1) {
      return res.status(403).json({
        message: 'You are not allowed to access delivery activity data.',
      })
    }

    const statement = `
      SELECT 
        da.da_id AS id,
        da.da_delivery_id AS delivery_id,
        da.da_status AS status,
        da.da_remarks AS remarks,
        da.da_createddate AS createddate,
        d.d_delivery_schedule_id AS schedule_id,
        ds.ds_name AS schedule_name,
        ds.ds_order_id AS order_id,
        o.or_customer_id AS customer_id,
        c.c_fullname AS customer_name,
        r.r_fullname AS rider_name,
        (
          SELECT JSON_ARRAYAGG(
            JSON_OBJECT(
              'image_id', di.di_id,
              'type', di.di_type,
              'image', di.di_image,
              'createddate', di.di_createddate
            )
          )
          FROM delivery_image di
          WHERE di.di_delivery_activity_id = da.da_id
        ) AS images
      FROM delivery_activity da
      INNER JOIN delivery d ON da.da_delivery_id = d.d_id
      INNER JOIN delivery_schedule ds ON d.d_delivery_schedule_id = ds.ds_id
      INNER JOIN orders o ON ds.ds_order_id = o.or_id
      INNER JOIN customer c ON o.or_customer_id = c.c_id
      LEFT JOIN rider r ON d.d_rider_id = r.r_id
      ORDER BY da.da_createddate DESC
    `

    const data = await Query(statement)

    // Parse JSON arrays
    const parsedData = data.map((row) => ({
      ...row,
      images: row.images ? JSON.parse(row.images) : [],
    }))

    res.status(200).json({
      message: 'All delivery activities retrieved successfully.',
      count: data.length,
      data: parsedData,
    })
  } catch (error) {
    console.error('Error retrieving delivery activities:', error)
    res.status(500).json({
      message: 'Error retrieving delivery activities.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    })
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

    // Get delivery with schedule, order, customer, and rider info
    const deliveryStatement = `
      SELECT 
        d.*,
        ds.ds_id as schedule_id,
        ds.ds_name as schedule_name,
        ds.ds_date as schedule_date,
        ds.ds_start_time,
        ds.ds_end_time,
        ds.ds_status as schedule_status,
        ds.ds_cutoff,
        ds.ds_createddate as schedule_createddate,
        o.or_id as order_id,
        o.or_customer_id,
        o.or_total,
        o.or_status as order_status,
        o.or_payment_type,
        o.or_payment_reference,
        o.or_details,
        o.or_createddate as order_date,
        c.c_fullname as customer_name,
        c.c_email as customer_email,
        c.c_contact as customer_contact,
        c.c_address as customer_address,
        r.r_fullname as rider_name,
        r.r_contact as rider_contact,
        r.r_status as rider_status
      FROM delivery d
      INNER JOIN delivery_schedule ds ON d.d_delivery_schedule_id = ds.ds_id
      INNER JOIN orders o ON ds.ds_order_id = o.or_id
      INNER JOIN customer c ON o.or_customer_id = c.c_id
      LEFT JOIN rider r ON d.d_rider_id = r.r_id
      WHERE d.d_id = ?
    `

    const deliveryData = await Query(deliveryStatement, [id], Delivery.delivery.prefix_)

    if (!deliveryData.length) {
      return res.status(404).json({ message: 'No delivery found.' })
    }

    // Get delivery activity history (audit trail) with images
    const activityStatement = `
      SELECT 
        da.*,
        di.di_id as image_id,
        di.di_type as image_type,
        di.di_image,
        di.di_createddate as image_createddate
      FROM delivery_activity da
      LEFT JOIN delivery_image di ON da.da_id = di.di_delivery_activity_id
      WHERE da.da_delivery_id = ?
      ORDER BY da.da_createddate DESC
    `
    const activities = await Query(activityStatement, [id])

    // Group activities with their images
    const activitiesWithImages = activities.reduce((acc, row) => {
      const existingActivity = acc.find((a) => a.da_id === row.da_id)

      if (!existingActivity) {
        acc.push({
          da_id: row.da_id,
          da_delivery_id: row.da_delivery_id,
          da_status: row.da_status,
          da_remarks: row.da_remarks,
          da_createddate: row.da_createddate,
          images: row.di_id
            ? [
                {
                  di_id: row.di_id,
                  di_type: row.di_type,
                  di_image: row.di_image,
                  di_createddate: row.di_createddate,
                },
              ]
            : [],
        })
      } else if (row.di_id) {
        existingActivity.images.push({
          di_id: row.di_id,
          di_type: row.di_type,
          di_image: row.di_image,
          di_createddate: row.di_createddate,
        })
      }

      return acc
    }, [])

    res.status(200).json({
      message: 'Delivery retrieved successfully.',
      data: {
        ...deliveryData[0],
        activities: activitiesWithImages,
      },
    })
  } catch (error) {
    console.error('Error retrieving delivery:', error)
    res.status(500).json({ message: 'Error retrieving delivery.' })
  }
}

const getDeliveryActivitiesById = async (req, res) => {
  const { id } = req.params
  const { access_id } = req.context

  if (!id || isNaN(Number(id))) {
    return res.status(400).json({
      message: 'Valid Delivery ID is required.',
    })
  }

  try {
    if (access_id !== 1) {
      return res.status(403).json({
        message: 'You are not allowed to access delivery activity data.',
      })
    }

    const statement = `
      SELECT 
        da.da_id AS id,
        da.da_delivery_id AS delivery_id,
        da.da_status AS status,
        da.da_remarks AS remarks,
        da.da_createddate AS createddate,
        (
          SELECT JSON_ARRAYAGG(
            JSON_OBJECT(
              'image_id', di.di_id,
              'type', di.di_type,
              'image', di.di_image,
              'createddate', di.di_createddate
            )
          )
          FROM delivery_image di
          WHERE di.di_delivery_activity_id = da.da_id
        ) AS images
      FROM delivery_activity da
      WHERE da.da_delivery_id = ?
      ORDER BY da.da_createddate DESC
    `

    const data = await Query(statement, [id], Delivery.delivery_activity?.prefix_)

    if (!data.length) {
      return res.status(404).json({
        message: 'No delivery activities found for this delivery.',
      })
    }

    // Parse JSON arrays
    const parsedData = data.map((row) => ({
      ...row,
      images: row.images ? JSON.parse(row.images) : [],
    }))

    res.status(200).json({
      message: 'Delivery activities retrieved successfully.',
      count: data.length,
      data: parsedData,
    })
  } catch (error) {
    console.error('Error retrieving delivery activities:', error)
    res.status(500).json({
      message: 'Error retrieving delivery activities.',
    })
  }
}

// CREATE
const addDelivery = async (req, res) => {
  const { delivery_schedule_id, rider_id } = req.body

  if (!delivery_schedule_id || !rider_id) {
    return res.status(400).json({
      message: 'delivery_schedule_id and rider_id are required.',
    })
  }

  try {
    // Check schedule exists and get order info
    const scheduleCheck = await Query(
      `
      SELECT 
        ds.ds_id,
        ds.ds_status,
        ds.ds_order_id,
        o.or_status
      FROM delivery_schedule ds
      INNER JOIN orders o ON ds.ds_order_id = o.or_id
      WHERE ds.ds_id = ?
      `,
      [delivery_schedule_id],
    )

    if (!scheduleCheck.length) {
      return res.status(404).json({ message: 'Delivery schedule not found.' })
    }

    const schedule = scheduleCheck[0]

    // Order must be APPROVED or PAID
    if (!['APPROVED', 'PAID'].includes(schedule.or_status)) {
      return res.status(400).json({
        message: `Cannot create delivery. Order must be APPROVED or PAID. Current: ${schedule.or_status}`,
      })
    }

    // Schedule must be PENDING
    if (schedule.ds_status !== 'PENDING') {
      return res.status(400).json({
        message: `Delivery schedule must be PENDING. Current: ${schedule.ds_status}`,
      })
    }

    // Validate rider
    const riderCheck = await Query(
      `SELECT r_id, r_status 
       FROM rider 
       WHERE r_id = ? AND r_status != 'DELETED'`,
      [rider_id],
    )

    if (!riderCheck.length) {
      return res.status(404).json({ message: 'Rider not found.' })
    }

    if (riderCheck[0].r_status !== 'ACTIVE') {
      return res.status(400).json({
        message: 'Cannot assign delivery to inactive rider.',
      })
    }

    // Ensure no delivery already exists for this schedule
    const existingDelivery = await Query(
      `SELECT d_id FROM delivery WHERE d_delivery_schedule_id = ?`,
      [delivery_schedule_id],
    )

    if (existingDelivery.length > 0) {
      return res.status(409).json({
        message: 'This schedule already has a delivery assigned.',
      })
    }

    const now = new Date().toISOString().slice(0, 19).replace('T', ' ')

    // FIX: Insert delivery first using Query to get insertId
    const deliveryResult = await Query(
      `
      INSERT INTO delivery
      (d_delivery_schedule_id, d_rider_id, d_status, d_createddate)
      VALUES (?, ?, 'PENDING', ?)
      `,
      [delivery_schedule_id, rider_id, now],
    )

    const deliveryId = deliveryResult.insertId

    // FIX: Separate transaction for updates only
    const queries = []

    // Update schedule status
    queries.push({
      sql: `
        UPDATE delivery_schedule
        SET ds_status = 'ASSIGNED'
        WHERE ds_id = ?
      `,
      values: [delivery_schedule_id],
    })

    // Update order status
    queries.push({
      sql: `
        UPDATE orders
        SET or_status = 'OUT-FOR-DELIVERY'
        WHERE or_id = ?
      `,
      values: [schedule.ds_order_id],
    })

    // Execute transaction for updates
    if (queries.length > 0) {
      await Transaction(queries)
    }

    // delivery activity
    await Query(
      `
      INSERT INTO delivery_activity
      (da_delivery_id, da_status, da_createddate)
      VALUES (?, 'PENDING', ?)
      `,
      [deliveryId, now],
    )

    res.status(201).json({
      message: 'Delivery created successfully.',
      delivery_id: deliveryId,
      delivery_schedule_id,
      order_id: schedule.ds_order_id,
      order_status: 'OUT-FOR-DELIVERY',
      status: 'PENDING',
    })
  } catch (error) {
    console.error('Error creating delivery:', error)
    res.status(500).json({
      message: 'Failed to create delivery.',
    })
  }
}

// UPDATE DELIVERY STATUS
const updateDeliveryStatus = async (req, res) => {
  const { id } = req.params
  const { status, remarks, images } = req.body

  const validStatuses = ['PENDING', 'FOR-PICK-UP', 'OUT-FOR-DELIVERY', 'COMPLETE']

  // Map delivery status to schedule status
  const scheduleStatusMap = {
    PENDING: 'ASSIGNED',
    'FOR-PICK-UP': 'ASSIGNED',
    'OUT-FOR-DELIVERY': 'OUT-FOR-DELIVERY',
    COMPLETE: 'COMPLETE',
  }

  // Map delivery status to order status
  const orderStatusMap = {
    PENDING: 'OUT-FOR-DELIVERY',
    'FOR-PICK-UP': 'OUT-FOR-DELIVERY',
    'OUT-FOR-DELIVERY': 'OUT-FOR-DELIVERY',
    COMPLETE: 'COMPLETE',
  }

  if (!status) {
    return res.status(400).json({ message: 'Status is required.' })
  }

  if (!validStatuses.includes(status)) {
    return res.status(400).json({
      message: `Invalid status. Must be: ${validStatuses.join(', ')}`,
    })
  }

  try {
    // Get current delivery info with schedule and order
    const currentDelivery = await Query(
      `
      SELECT 
        d.d_id,
        d.d_status,
        d.d_delivery_schedule_id,
        ds.ds_order_id,
        ds.ds_status as schedule_status,
        o.or_status as order_status
      FROM delivery d
      INNER JOIN delivery_schedule ds ON d.d_delivery_schedule_id = ds.ds_id
      INNER JOIN orders o ON ds.ds_order_id = o.or_id
      WHERE d.d_id = ?
      `,
      [id],
    )

    if (!currentDelivery.length) {
      return res.status(404).json({ message: 'Delivery not found.' })
    }

    const delivery = currentDelivery[0]
    const previousStatus = delivery.d_status

    // Don't allow updating to same status
    if (previousStatus === status) {
      return res.status(400).json({
        message: `Delivery is already ${status}.`,
      })
    }

    // Validate status transition
    if (previousStatus === 'COMPLETE') {
      return res.status(400).json({
        message: 'Cannot update a completed delivery.',
      })
    }

    const now = new Date().toISOString().slice(0, 19).replace('T', ' ')
    const queries = []

    // Update delivery status
    queries.push({
      sql: `
        UPDATE delivery
        SET d_status = ?
        WHERE d_id = ?
      `,
      values: [status, id],
    })

    // Update schedule status
    queries.push({
      sql: `
        UPDATE delivery_schedule
        SET ds_status = ?
        WHERE ds_id = ?
      `,
      values: [scheduleStatusMap[status], delivery.d_delivery_schedule_id],
    })

    // Update order status if needed
    if (orderStatusMap[status] && orderStatusMap[status] !== delivery.order_status) {
      queries.push({
        sql: `
          UPDATE orders
          SET or_status = ?
          WHERE or_id = ?
        `,
        values: [orderStatusMap[status], delivery.ds_order_id],
      })
    }

    // Execute first part of transaction
    await Transaction(queries)

    // delivery activity
    const activityQuery = `
      INSERT INTO delivery_activity
      (da_delivery_id, da_status, da_remarks, da_createddate)
      VALUES (?, ?, ?, ?)
    `
    const activityResult = await Query(activityQuery, [id, status, remarks || null, now])
    const activityId = activityResult.insertId

    // Add images if provided
    if (images && Array.isArray(images) && images.length > 0) {
      for (const image of images) {
        if (!image.type || !['PICK-UP', 'DELIVERED'].includes(image.type)) {
          return res.status(400).json({
            message: 'Image type must be either PICK-UP or DELIVERED.',
          })
        }

        await Query(
          `
          INSERT INTO delivery_image
          (di_delivery_activity_id, di_type, di_image, di_createddate)
          VALUES (?, ?, ?, ?)
          `,
          [activityId, image.type, image.data, now],
        )
      }
    }

    res.status(200).json({
      message: 'Delivery status updated successfully.',
      data: {
        delivery_id: id,
        previous_status: previousStatus,
        current_status: status,
        schedule_status: scheduleStatusMap[status],
        order_status: orderStatusMap[status],
        activity_id: activityId,
      },
    })
  } catch (error) {
    console.error('Error updating delivery status:', error)
    res.status(500).json({
      message: 'Failed to update delivery status.',
    })
  }
}

// ADD IMAGES TO EXISTING DELIVERY ACTIVITY
const addDeliveryImages = async (req, res) => {
  const { activityId } = req.params
  const { images } = req.body

  if (!images || !Array.isArray(images) || images.length === 0) {
    return res.status(400).json({
      message: 'At least one image is required.',
    })
  }

  try {
    // Check if activity exists
    const activityCheck = await Query('SELECT da_id FROM delivery_activity WHERE da_id = ?', [
      activityId,
    ])

    if (!activityCheck.length) {
      return res.status(404).json({ message: 'Delivery activity not found.' })
    }

    const now = new Date().toISOString().slice(0, 19).replace('T', ' ')
    const imageIds = []

    for (const image of images) {
      if (!image.type || !['PICK-UP', 'DELIVERED'].includes(image.type)) {
        return res.status(400).json({
          message: 'Image type must be either PICK-UP or DELIVERED.',
        })
      }

      const result = await Query(
        `
        INSERT INTO delivery_image
        (di_delivery_activity_id, di_type, di_image, di_createddate)
        VALUES (?, ?, ?, ?)
        `,
        [activityId, image.type, image.data, now],
      )

      imageIds.push(result.insertId)
    }

    res.status(201).json({
      message: 'Images added successfully.',
      activity_id: activityId,
      image_ids: imageIds,
      count: imageIds.length,
    })
  } catch (error) {
    console.error('Error adding delivery images:', error)
    res.status(500).json({
      message: 'Failed to add delivery images.',
    })
  }
}

module.exports = {
  getDelivery,
  getDeliveryActivities,
  getDeliveryById,
  getDeliveryActivitiesById,
  addDelivery,
  updateDeliveryStatus,
  addDeliveryImages,
}
