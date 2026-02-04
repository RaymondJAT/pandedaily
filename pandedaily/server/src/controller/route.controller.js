const { Master } = require('../database/model/Master')
const { Query } = require('../database/utility/queries.util')

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
  const { access_id, route_name, status } = req.body

  if (!Number.isInteger(+id)) {
    return res.status(400).json({ message: 'Valid route ID is required.' })
  }

  if (![access_id, route_name, status].some((v) => v !== undefined)) {
    return res.status(400).json({
      message: 'At least one field (access_id, route_name, or status) is required.',
    })
  }

  try {
    const [route] = await Query(`SELECT mr_id FROM master_route WHERE mr_id = ?`, [id])

    if (!route) {
      return res.status(404).json({ message: 'Route record not found.' })
    }

    const updates = []
    const params = []
    const updatedFields = {}

    if (access_id !== undefined) {
      if (!Number.isInteger(+access_id)) {
        return res.status(400).json({ message: 'access_id must be a valid number.' })
      }

      const [access] = await Query(`SELECT ma_id FROM master_access WHERE ma_id = ?`, [access_id])

      if (!access) {
        return res.status(404).json({ message: 'Access ID not found.' })
      }

      updates.push('mr_access_id = ?')
      params.push(+access_id)
      updatedFields.access_id = +access_id
    }

    // route_name
    if (route_name !== undefined) {
      const name = route_name.trim()
      if (!name) {
        return res.status(400).json({ message: 'route_name cannot be empty.' })
      }

      updates.push('mr_route_name = ?')
      params.push(name)
      updatedFields.route_name = name
    }

    // status
    if (status !== undefined) {
      const validStatuses = ['FULL', 'VIEW', 'NO-ACCESS']
      const value = status.trim().toUpperCase()

      if (!validStatuses.includes(value)) {
        return res.status(400).json({
          message: `Status must be one of: ${validStatuses.join(', ')}`,
          validStatuses,
        })
      }

      updates.push('mr_status = ?')
      params.push(value)
      updatedFields.status = value
    }

    params.push(id)

    await Query(`UPDATE master_route SET ${updates.join(', ')} WHERE mr_id = ?`, params)

    res.status(200).json({
      message: 'Route updated successfully.',
      updatedFields,
    })
  } catch (error) {
    console.error('Error updating route:', error)

    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        message: 'Route with this name already exists for the given access.',
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
