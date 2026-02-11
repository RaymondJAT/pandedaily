const { Rider } = require('../database/model/Rider')
const { Query, Transaction } = require('../database/utility/queries.util')

// GET ALL RIDERS
const getRiders = async (req, res) => {
  const { access_id } = req.context

  try {
    if (access_id !== 1) {
      return res.status(403).json({
        message: 'You are not allowed to access rider data.',
      })
    }

    const statement = `
      SELECT *
      FROM rider
      WHERE r_status != 'delete'
    `

    const data = await Query(statement, [], Rider.rider.prefix_)

    if (!data.length) {
      return res.status(404).json({ message: 'No riders found.' })
    }

    res.status(200).json({
      message: 'Riders retrieved successfully.',
      count: data.length,
      data,
    })
  } catch (error) {
    console.error('Error retrieving riders:', error)
    res.status(500).json({
      message: 'Error retrieving riders.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    })
  }
}

// GET RIDER BY ID
const getRiderById = async (req, res) => {
  const { id } = req.params
  const { access_id } = req.context

  if (!id || isNaN(Number(id))) {
    return res.status(400).json({ message: 'Valid Rider ID is required.' })
  }

  try {
    if (access_id !== 1) {
      return res.status(403).json({
        message: 'You are not allowed to access rider data.',
      })
    }

    const statement = `
      SELECT *
      FROM rider
      WHERE r_id = ? AND r_status != 'delete'
    `

    const data = await Query(statement, [id], Rider.rider.prefix_)

    if (!data.length) {
      return res.status(404).json({ message: 'Rider not found.' })
    }

    res.status(200).json({
      message: 'Rider retrieved successfully.',
      data: data[0],
    })
  } catch (error) {
    console.error('Error retrieving rider:', error)
    res.status(500).json({
      message: 'Error retrieving rider.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    })
  }
}

// CREATE NEW RIDER
const createRider = async (req, res) => {
  const { access_id } = req.context
  const { r_fullname, r_username, r_password } = req.body

  try {
    if (access_id !== 1) {
      return res.status(403).json({
        message: 'You are not allowed to create riders.',
      })
    }

    if (!r_fullname || !r_username || !r_password) {
      return res.status(400).json({
        message: 'Fullname, username, and password are required.',
      })
    }

    // Check if username already exists
    const existingUser = await Query(
      'SELECT r_id FROM rider WHERE r_username = ? AND r_status != "delete"',
      [r_username],
    )

    if (existingUser.length > 0) {
      return res.status(409).json({
        message: 'Username already exists.',
      })
    }

    const statement = `
      INSERT INTO rider (r_fullname, r_username, r_password, r_status) 
      VALUES (?, ?, ?, 'active')
    `

    const result = await Query(statement, [r_fullname, r_username, r_password])

    res.status(201).json({
      message: 'Rider created successfully.',
      rider_id: result.insertId,
    })
  } catch (error) {
    console.error('Error creating rider:', error)
    res.status(500).json({
      message: 'Error creating rider.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    })
  }
}

// UPDATE RIDER
const updateRider = async (req, res) => {
  const { id } = req.params
  const { r_fullname, r_username, r_status } = req.body
  const { access_id } = req.context

  if (!id || isNaN(Number(id))) {
    return res.status(400).json({ message: 'Valid Rider ID is required.' })
  }

  try {
    if (access_id !== 1) {
      return res.status(403).json({
        message: 'You are not allowed to update riders.',
      })
    }

    // Check if rider exists
    const riderExists = await Query(
      'SELECT r_id FROM rider WHERE r_id = ? AND r_status != "delete"',
      [id],
    )

    if (!riderExists.length) {
      return res.status(404).json({ message: 'Rider not found.' })
    }

    // Check if username already exists (excluding current rider)
    if (r_username) {
      const existingUser = await Query(
        'SELECT r_id FROM rider WHERE r_username = ? AND r_id != ? AND r_status != "delete"',
        [r_username, id],
      )

      if (existingUser.length > 0) {
        return res.status(409).json({
          message: 'Username already exists.',
        })
      }
    }

    // Build dynamic update query
    const updates = []
    const values = []

    if (r_fullname !== undefined) {
      updates.push('r_fullname = ?')
      values.push(r_fullname)
    }

    if (r_username !== undefined) {
      updates.push('r_username = ?')
      values.push(r_username)
    }

    if (r_status !== undefined) {
      if (!['active', 'inactive', 'delete'].includes(r_status)) {
        return res.status(400).json({
          message: 'Valid status is required. Must be: active, inactive, or delete.',
        })
      }
      updates.push('r_status = ?')
      values.push(r_status)
    }

    if (updates.length === 0) {
      return res.status(400).json({
        message: 'No fields to update.',
      })
    }

    values.push(id)

    const statement = `
      UPDATE rider 
      SET ${updates.join(', ')} 
      WHERE r_id = ?
    `

    await Query(statement, values)

    res.status(200).json({
      message: 'Rider updated successfully.',
      rider_id: id,
    })
  } catch (error) {
    console.error('Error updating rider:', error)
    res.status(500).json({
      message: 'Error updating rider.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    })
  }
}

// GET RIDER ACTIVITY HISTORY
const getRiderActivityHistory = async (req, res) => {
  const { id } = req.params
  const { access_id } = req.context

  if (!id || isNaN(Number(id))) {
    return res.status(400).json({ message: 'Valid Rider ID is required.' })
  }

  try {
    if (access_id !== 1) {
      return res.status(403).json({
        message: 'You are not allowed to access rider activity data.',
      })
    }

    const statement = `
      SELECT 
        ra.ra_id AS id,
        ra.ra_rider_id AS rider_id,
        ra.ra_delivery_id AS delivery_id,
        ra.ra_status AS status,
        ra.ra_date AS date
      FROM rider_activity ra
      WHERE ra.ra_rider_id = ?
      ORDER BY ra.ra_date DESC
    `

    const data = await Query(statement, [id])

    res.status(200).json({
      message: 'Rider activity history retrieved successfully.',
      count: data.length,
      data,
    })
  } catch (error) {
    console.error('Error retrieving rider activity history:', error)
    res.status(500).json({
      message: 'Error retrieving rider activity history.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    })
  }
}

// GET ALL RIDER ACTIVITIES
const getAllRiderActivities = async (req, res) => {
  const { access_id } = req.context

  try {
    if (access_id !== 1) {
      return res.status(403).json({
        message: 'You are not allowed to access all rider activities.',
      })
    }

    const statement = `
      SELECT 
        ra.ra_id AS id,
        ra.ra_rider_id AS rider_id,
        r.r_fullname AS rider_name,
        ra.ra_delivery_id AS delivery_id,
        ra.ra_status AS status,
        ra.ra_date AS date
      FROM rider_activity ra
      INNER JOIN rider r ON ra.ra_rider_id = r.r_id
      WHERE r.r_status != 'delete'
      ORDER BY ra.ra_date DESC
    `

    const data = await Query(statement)

    res.status(200).json({
      message: 'All rider activities retrieved successfully.',
      count: data.length,
      data,
    })
  } catch (error) {
    console.error('Error retrieving all rider activities:', error)
    res.status(500).json({
      message: 'Error retrieving all rider activities.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    })
  }
}

// CREATE RIDER ACTIVITY
const createRiderActivity = async (req, res) => {
  const { ra_rider_id, ra_delivery_id, ra_status } = req.body
  const { access_id } = req.context

  if (!ra_rider_id || !ra_delivery_id || !ra_status) {
    return res.status(400).json({
      message: 'Rider ID, Delivery ID, and Status are required.',
    })
  }

  if (!['ASSIGNED', 'PICKED-UP', 'DELIVERED', 'FAILED'].includes(ra_status)) {
    return res.status(400).json({
      message: 'Valid status is required. Must be: ASSIGNED, PICKED-UP, DELIVERED, or FAILED.',
    })
  }

  try {
    if (access_id !== 1) {
      return res.status(403).json({
        message: 'You are not allowed to create rider activities.',
      })
    }

    // Check if rider exists and is active
    const riderCheck = await Query(
      'SELECT r_status FROM rider WHERE r_id = ? AND r_status != "delete"',
      [ra_rider_id],
    )

    if (!riderCheck.length) {
      return res.status(404).json({ message: 'Rider not found.' })
    }

    if (riderCheck[0].r_status !== 'active') {
      return res.status(400).json({
        message: 'Cannot assign delivery to inactive rider.',
      })
    }

    const statement = `
      INSERT INTO rider_activity (ra_rider_id, ra_delivery_id, ra_status, ra_date) 
      VALUES (?, ?, ?, NOW())
    `

    const result = await Query(statement, [ra_rider_id, ra_delivery_id, ra_status])

    res.status(201).json({
      message: 'Rider activity created successfully.',
      activity_id: result.insertId,
    })
  } catch (error) {
    console.error('Error creating rider activity:', error)
    res.status(500).json({
      message: 'Error creating rider activity.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    })
  }
}

// UPDATE RIDER ACTIVITY
const updateRiderActivity = async (req, res) => {
  const { id } = req.params
  const { ra_status } = req.body
  const { access_id } = req.context

  if (!id || isNaN(Number(id))) {
    return res.status(400).json({ message: 'Valid Activity ID is required.' })
  }

  if (!ra_status || !['ASSIGNED', 'PICKED-UP', 'DELIVERED', 'FAILED'].includes(ra_status)) {
    return res.status(400).json({
      message: 'Valid status is required. Must be: ASSIGNED, PICKED-UP, DELIVERED, or FAILED.',
    })
  }

  try {
    if (access_id !== 1) {
      return res.status(403).json({
        message: 'You are not allowed to update rider activities.',
      })
    }

    // Check if activity exists
    const activityExists = await Query('SELECT ra_id FROM rider_activity WHERE ra_id = ?', [id])

    if (!activityExists.length) {
      return res.status(404).json({ message: 'Activity not found.' })
    }

    const statement = `
      UPDATE rider_activity 
      SET ra_status = ?, ra_date = NOW() 
      WHERE ra_id = ?
    `

    await Query(statement, [ra_status, id])

    res.status(200).json({
      message: 'Rider activity updated successfully.',
      activity_id: id,
    })
  } catch (error) {
    console.error('Error updating rider activity:', error)
    res.status(500).json({
      message: 'Error updating rider activity.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    })
  }
}

module.exports = {
  getRiders,
  getRiderById,
  createRider,
  updateRider,
  getRiderActivityHistory,
  getAllRiderActivities,
  createRiderActivity,
  updateRiderActivity,
}
