const { Delivery } = require('../database/model/Delivery')
const { Query, Transaction } = require('../database/utility/queries.util')

// GET ALL
const getDelivery = async (req, res) => {
  const { access_id, id: userId } = req.context

  try {
    let statement = `
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
    `
    const params = []

    if (access_id === 3) {
      const userQuery = await Query(`SELECT mu_username FROM master_user WHERE mu_id = ?`, [userId])

      if (userQuery.length > 0) {
        const username = userQuery[0].mu_username

        const riderQuery = await Query(`SELECT r_id FROM rider WHERE r_username = ?`, [username])

        if (riderQuery.length > 0) {
          statement += ` WHERE d.d_rider_id = ?`
          params.push(riderQuery[0].r_id)
        } else {
          return res.status(200).json({
            message: 'No rider profile found for this user.',
            count: 0,
            data: [],
          })
        }
      } else {
        return res.status(200).json({
          message: 'User not found.',
          count: 0,
          data: [],
        })
      }
    }

    statement += ` ORDER BY d.d_createddate DESC`

    const data = await Query(statement, params, Delivery.delivery.prefix_)

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
    // Only admin can access delivery activities
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
  const { access_id, id: userId } = req.context

  try {
    let deliveryStatement = `
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

    const params = [id]

    if (access_id === 3) {
      // Get the rider record for this user
      const userQuery = await Query(`SELECT mu_username FROM master_user WHERE mu_id = ?`, [userId])

      if (userQuery.length > 0) {
        const username = userQuery[0].mu_username

        // Try to find rider by username
        const riderQuery = await Query(`SELECT r_id FROM rider WHERE r_username = ?`, [username])

        if (riderQuery.length > 0) {
          deliveryStatement += ` AND d.d_rider_id = ?`
          params.push(riderQuery[0].r_id)
        } else {
          return res.status(403).json({
            message: 'You are not allowed to access this delivery.',
          })
        }
      } else {
        return res.status(403).json({
          message: 'User not found.',
        })
      }
    }

    const deliveryData = await Query(deliveryStatement, params, Delivery.delivery.prefix_)

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
  const { access_id } = req.context

  // Only admin can create deliveries
  if (access_id !== 1) {
    return res.status(403).json({
      message: 'You are not allowed to create deliveries.',
    })
  }

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
       WHERE r_id = ? AND r_status != 'DELETE'`,
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

    // Insert delivery first using Query to get insertId
    const deliveryResult = await Query(
      `
      INSERT INTO delivery
      (d_delivery_schedule_id, d_rider_id, d_status, d_createddate)
      VALUES (?, ?, 'FOR-PICK-UP', ?)
      `,
      [delivery_schedule_id, rider_id, now],
    )

    const deliveryId = deliveryResult.insertId

    // Separate transaction for updates only
    const queries = []

    // Update schedule status
    queries.push({
      sql: `
        UPDATE delivery_schedule
        SET ds_status = 'FOR-PICK-UP'
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

    // delivery activity - now FOR-PICK-UP since rider is assigned
    await Query(
      `
      INSERT INTO delivery_activity
      (da_delivery_id, da_status, da_remarks, da_createddate)
      VALUES (?, 'FOR-PICK-UP', 'Delivery created with rider assigned', ?)
      `,
      [deliveryId, now],
    )

    res.status(201).json({
      message: 'Delivery created and rider assigned successfully.',
      delivery_id: deliveryId,
      delivery_schedule_id,
      order_id: schedule.ds_order_id,
      order_status: 'OUT-FOR-DELIVERY',
      status: 'FOR-PICK-UP',
      rider_id,
    })
  } catch (error) {
    console.error('Error creating delivery:', error)
    res.status(500).json({
      message: 'Failed to create delivery.',
    })
  }
}

// ADD IMAGE
const addDeliveryImages = async (req, res) => {
  const { activityId } = req.params
  const { images } = req.body
  const { access_id, id: userId } = req.context

  if (!images || !Array.isArray(images) || images.length === 0) {
    return res.status(400).json({
      message: 'At least one image is required.',
    })
  }

  try {
    // Check if activity exists and get delivery info
    const activityCheck = await Query(
      `SELECT da.da_id, da.da_delivery_id, d.d_rider_id 
       FROM delivery_activity da
       INNER JOIN delivery d ON da.da_delivery_id = d.d_id
       WHERE da.da_id = ?`,
      [activityId],
    )

    if (!activityCheck.length) {
      return res.status(404).json({ message: 'Delivery activity not found.' })
    }

    const activity = activityCheck[0]

    // Check permissions
    if (access_id === 3) {
      // If rider, check if this is their delivery
      const userQuery = await Query(`SELECT mu_username FROM master_user WHERE mu_id = ?`, [userId])

      if (userQuery.length > 0) {
        const username = userQuery[0].mu_username

        // Try to find rider by username
        const riderQuery = await Query(`SELECT r_id FROM rider WHERE r_username = ?`, [username])

        if (riderQuery.length === 0 || riderQuery[0].r_id !== activity.d_rider_id) {
          return res.status(403).json({
            message: 'You are not allowed to add images to this delivery.',
          })
        }
      } else {
        return res.status(403).json({
          message: 'You are not allowed to add images to this delivery.',
        })
      }
    } else if (access_id !== 1) {
      return res.status(403).json({
        message: 'You are not allowed to add delivery images.',
      })
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

// ASSIGN RIDER TO EXISTING DELIVERY - Only Admin
const assignRider = async (req, res) => {
  const { id } = req.params
  const { rider_id } = req.body
  const { access_id } = req.context

  // Only admin can assign riders
  if (access_id !== 1) {
    return res.status(403).json({
      message: 'You are not allowed to assign riders.',
    })
  }

  if (!id || isNaN(Number(id))) {
    return res.status(400).json({ message: 'Valid delivery ID is required.' })
  }

  if (!rider_id) {
    return res.status(400).json({ message: 'rider_id is required.' })
  }

  try {
    // Get current delivery info
    const currentDelivery = await Query(
      `
      SELECT 
        d.d_id,
        d.d_status,
        d.d_delivery_schedule_id,
        d.d_rider_id,
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

    // Check if rider already assigned
    if (delivery.d_rider_id) {
      return res.status(400).json({
        message: 'Rider already assigned to this delivery.',
      })
    }

    // Validate rider
    const riderCheck = await Query(
      `SELECT r_id, r_status 
       FROM rider 
       WHERE r_id = ? AND r_status != 'DELETE'`,
      [rider_id],
    )

    if (!riderCheck.length) {
      return res.status(404).json({ message: 'Rider not found.' })
    }

    if (riderCheck[0].r_status !== 'ACTIVE') {
      return res.status(400).json({
        message: 'Cannot assign inactive rider.',
      })
    }

    const now = new Date().toISOString().slice(0, 19).replace('T', ' ')
    const queries = []

    // Update delivery with rider and change status to FOR-PICK-UP
    queries.push({
      sql: `
        UPDATE delivery
        SET d_rider_id = ?, d_status = 'FOR-PICK-UP'
        WHERE d_id = ?
      `,
      values: [rider_id, id],
    })

    // Update schedule status to FOR-PICK-UP
    if (delivery.schedule_status !== 'FOR-PICK-UP') {
      console.log(`Updating schedule from ${delivery.schedule_status} to FOR-PICK-UP`)
      queries.push({
        sql: `
          UPDATE delivery_schedule
          SET ds_status = ?
          WHERE ds_id = ?
        `,
        values: ['FOR-PICK-UP', delivery.d_delivery_schedule_id],
      })
    }

    // Update order status to FOR-PICK-UP
    if (delivery.order_status !== 'FOR-PICK-UP') {
      queries.push({
        sql: `
          UPDATE orders
          SET or_status = ?
          WHERE or_id = ?
        `,
        values: ['FOR-PICK-UP', delivery.ds_order_id],
      })
    }

    // Add delivery activity to the same transaction
    queries.push({
      sql: `
        INSERT INTO delivery_activity
        (da_delivery_id, da_status, da_remarks, da_createddate)
        VALUES (?, 'FOR-PICK-UP', 'Rider assigned', ?)
      `,
      values: [id, now],
    })

    // Execute all queries in a single transaction
    await Transaction(queries)

    // Update rider activity
    try {
      await Query(
        `
        INSERT INTO rider_activity
        (ra_rider_id, ra_delivery_id, ra_status, ra_date)
        VALUES (?, ?, 'FOR-PICK-UP', ?)
        `,
        [rider_id, id, now],
      )
    } catch (riderActivityError) {
      console.log('Note: Could not update rider_activity:', riderActivityError.message)
    }

    res.status(200).json({
      message: 'Rider assigned successfully.',
      delivery_id: id,
      rider_id,
      status: 'FOR-PICK-UP',
    })
  } catch (error) {
    console.error('Error assigning rider:', error)
    res.status(500).json({
      message: 'Failed to assign rider.',
    })
  }
}

// UPDATE
const updateDeliveryStatus = async (req, res) => {
  const { id } = req.params
  const { status, remarks, images } = req.body
  const { access_id, id: userId } = req.context

  const validStatuses = ['PENDING', 'FOR-PICK-UP', 'OUT-FOR-DELIVERY', 'COMPLETE']

  // Map delivery status to schedule status
  const scheduleStatusMap = {
    PENDING: 'PENDING',
    'FOR-PICK-UP': 'FOR-PICK-UP',
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
        d.d_rider_id,
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

    // Admin or the assigned Rider
    if (access_id === 3) {
      // If rider, check if this is their delivery
      const userQuery = await Query(`SELECT mu_username FROM master_user WHERE mu_id = ?`, [userId])

      if (userQuery.length > 0) {
        const username = userQuery[0].mu_username

        // Try to find rider by username
        const riderQuery = await Query(`SELECT r_id FROM rider WHERE r_username = ?`, [username])

        if (riderQuery.length === 0 || riderQuery[0].r_id !== delivery.d_rider_id) {
          return res.status(403).json({
            message: 'You are not allowed to update this delivery.',
          })
        }
      } else {
        return res.status(403).json({
          message: 'You are not allowed to update this delivery.',
        })
      }
    } else if (access_id !== 1) {
      return res.status(403).json({
        message: 'You are not allowed to update deliveries.',
      })
    }

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

    // If moving to FOR-PICK-UP, ensure rider is assigned
    if (status === 'FOR-PICK-UP' && !delivery.d_rider_id) {
      return res.status(400).json({
        message: 'Cannot set to FOR-PICK-UP. No rider assigned.',
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

    // Update schedule status using the fixed map
    const newScheduleStatus = scheduleStatusMap[status]
    console.log(`Updating schedule from ${delivery.schedule_status} to ${newScheduleStatus}`)
    queries.push({
      sql: `
        UPDATE delivery_schedule
        SET ds_status = ?
        WHERE ds_id = ?
      `,
      values: [newScheduleStatus, delivery.d_delivery_schedule_id],
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

    // Update rider activity if rider is assigned
    if (delivery.d_rider_id) {
      try {
        await Query(
          `
          INSERT INTO rider_activity
          (ra_rider_id, ra_delivery_id, ra_status, ra_date)
          VALUES (?, ?, ?, ?)
          `,
          [delivery.d_rider_id, id, status, now],
        )
      } catch (riderActivityError) {
        console.log('Note: Could not update rider_activity:', riderActivityError.message)
      }
    }

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
        schedule_status: newScheduleStatus,
        order_status: orderStatusMap[status] || delivery.order_status,
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

module.exports = {
  getDelivery,
  getDeliveryActivities,
  getDeliveryById,
  getDeliveryActivitiesById,
  addDelivery,
  assignRider,
  updateDeliveryStatus,
  addDeliveryImages,
}
