const { Rider } = require('../database/model/Rider')
const { Query } = require('../database/utility/queries.util')

// GET ALL
const getRiders = async (req, res) => {
  const { access_id } = req.context

  try {
    if (access_id !== 1) {
      return res.status(403).json({
        message: 'You are not allowed to access rider data.',
      })
    }

    const statement = `
      SELECT r_id, r_fullname, r_username, r_status
      FROM rider
      WHERE r_status != 'DELETED'
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
      WHERE r.r_status != 'DELETED'
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

// GET BY ID
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
      SELECT r_id, r_fullname, r_username, r_status
      FROM rider
      WHERE r_id = ? AND r_status != 'DELETED'
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
      'SELECT r_id FROM rider WHERE r_username = ? AND r_status != "DELETED"',
      [r_username],
    )

    if (existingUser.length > 0) {
      return res.status(409).json({
        message: 'Username already exists.',
      })
    }

    const statement = `
      INSERT INTO rider (r_fullname, r_username, r_password, r_status) 
      VALUES (?, ?, ?, 'ACTIVE')
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
      'SELECT r_id FROM rider WHERE r_id = ? AND r_status != "DELETED"',
      [id],
    )

    if (!riderExists.length) {
      return res.status(404).json({ message: 'Rider not found.' })
    }

    // Check if username already exists
    if (r_username) {
      const existingUser = await Query(
        'SELECT r_id FROM rider WHERE r_username = ? AND r_id != ? AND r_status != "DELETED"',
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
      const validStatuses = ['ACTIVE', 'INACTIVE', 'DELETED']

      if (!validStatuses.includes(r_status)) {
        return res.status(400).json({
          message: `Valid status must be: ${validStatuses.join(', ')}`,
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

module.exports = {
  getRiders,
  getRiderById,
  createRider,
  updateRider,
  getRiderActivityHistory,
  getAllRiderActivities,
}
