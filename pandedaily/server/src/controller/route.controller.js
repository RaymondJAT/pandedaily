const { Master } = require('../database/model/Master')
const { Query, Insert, Update, Transaction } = require('../database/utility/queries.util')

// READ
const getRoute = async (req, res) => {
  try {
    const statement = `SELECT * FROM master_route`

    const data = await Query(statement, [], Master.master_route.prefix_)
    res.status(200).json({ message: 'Route data retrieved.', data })
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving user data.' })
  }
}

// CREATE
const addRoute = async (req, res) => {
  const { access_id, route_name, status = 1 } = req.body

  if (!access_id || !route_name) {
    return res.status(400).json({
      message: 'Access ID and route name are required.',
    })
  }

  try {
    const checkAccess = await Query(`SELECT ma_id FROM master_access WHERE ma_id = ?`, [access_id])

    if (checkAccess.length === 0) {
      return res.status(404).json({
        message: 'Access not found.',
      })
    }

    const statement = `
      INSERT INTO master_route (mr_access_id, mr_route_name, mr_status)
      VALUES (?, ?, ?)
    `
    const data = await Query(statement, [access_id, route_name, status])

    res.status(201).json({
      message: 'Route data added successfully.',
      data,
      insertedId: data.insertId,
    })
  } catch (error) {
    console.error('Error adding route data:', error)
    console.error('Error SQL:', error.sql)
    console.error('Error parameters:', [access_id, route_name, status])

    // Check for duplicate entry
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        message: 'Route with this name already exists for this access.',
      })
    }

    res.status(500).json({
      message: 'Error adding route data.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    })
  }
}

// UPDATE
const updateRoute = async (req, res) => {
  const { id } = req.params
  const { accessId, routeName, status } = req.body

  try {
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({
        message: 'Valid route ID is required.',
      })
    }

    if (!accessId && !routeName && !status) {
      return res.status(400).json({
        message: 'At least one field (accessId, routeName, or status) is required for update.',
      })
    }

    if (accessId && isNaN(parseInt(accessId))) {
      return res.status(400).json({
        message: 'accessId must be a valid number.',
      })
    }

    if (routeName && typeof routeName !== 'string') {
      return res.status(400).json({
        message: 'routeName must be a string.',
      })
    }

    if (status && typeof status !== 'string') {
      return res.status(400).json({
        message: 'status must be a string.',
      })
    }

    const recordExists = await Query(`SELECT mr_id FROM master_route WHERE mr_id = ?`, [id])

    if (recordExists.length === 0) {
      return res.status(404).json({
        message: 'Route record not found.',
      })
    }

    if (accessId) {
      const accessExists = await Query(`SELECT ma_id FROM master_access WHERE ma_id = ?`, [
        accessId,
      ])
      if (accessExists.length === 0) {
        return res.status(404).json({
          message: 'Access ID not found.',
        })
      }
    }

    const updates = []
    const params = []

    if (accessId) {
      updates.push('mr_access_id = ?')
      params.push(parseInt(accessId))
    }

    if (routeName) {
      const trimmedRouteName = routeName.trim()
      if (trimmedRouteName === '') {
        return res.status(400).json({
          message: 'routeName cannot be empty.',
        })
      }
      updates.push('mr_route_name = ?')
      params.push(trimmedRouteName)
    }

    if (status) {
      const validStatuses = ['FULL', 'VIEW', 'NO-ACCESS']
      const formattedStatus = status.trim().toUpperCase()

      if (!validStatuses.includes(formattedStatus)) {
        return res.status(400).json({
          message: `Status must be one of: ${validStatuses.join(', ')}`,
          validStatuses,
        })
      }

      updates.push('mr_status = ?')
      params.push(formattedStatus)
    }

    if (updates.length === 0) {
      return res.status(400).json({
        message: 'No valid fields to update.',
      })
    }

    params.push(id)

    const statement = `
      UPDATE master_route
      SET ${updates.join(', ')}
      WHERE mr_id = ?
    `

    const data = await Query(statement, params)

    if (data.affectedRows === 0) {
      return res.status(404).json({
        message: 'Route not found or no changes made.',
      })
    }

    res.status(200).json({
      message: 'Route updated successfully.',
      data,
      updatedFields: {
        ...(accessId && { accessId: parseInt(accessId) }),
        ...(routeName && { routeName: routeName.trim() }),
        ...(status && { status: status.trim().toUpperCase() }),
      },
    })
  } catch (error) {
    console.error('Error updating route:', error)

    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        message: 'Route with this name already exists for the given access.',
      })
    }

    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(404).json({
        message: 'Referenced access ID does not exist.',
      })
    }

    res.status(500).json({
      message: 'Error updating route.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    })
  }
}

module.exports = {
  getRoute,
  addRoute,
  updateRoute,
}
