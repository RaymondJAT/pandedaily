const { Master } = require('../database/model/Master')
const { Query } = require('../database/utility/queries.util')

// READ
const getRoute = async (req, res) => {
  try {
    const statement = `SELECT * FROM master_route`

    const data = await Query(statement, [], Master.master_route.prefix_)
    res.status(200).json({ message: 'Route data retrieved.', data })
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving route data.' })
  }
}

// CREATE
const addRoute = async (req, res) => {
  const { route_name, status = 'NO-ACCESS' } = req.body

  console.log('Received create route request:', { route_name, status })

  if (!route_name) {
    return res.status(400).json({
      message: 'Route name is required.',
    })
  }

  try {
    // Check for duplicate route name
    const checkDuplicate = await Query(`SELECT mr_id FROM master_route WHERE mr_route_name = ?`, [
      route_name.trim(),
    ])

    if (checkDuplicate.length > 0) {
      return res.status(409).json({
        message: 'Route with this name already exists.',
      })
    }

    // Validate status
    const validStatuses = ['FULL', 'NO-ACCESS']
    const statusValue = status.toUpperCase()

    if (!validStatuses.includes(statusValue)) {
      return res.status(400).json({
        message: `Status must be one of: ${validStatuses.join(', ')}`,
        validStatuses,
      })
    }

    const statement = `
      INSERT INTO master_route (mr_access_id, mr_route_name, mr_status)
      VALUES (?, ?, ?)
    `
    const data = await Query(statement, [null, route_name.trim(), statusValue])
    console.log('Insert result:', data)

    res.status(201).json({
      message: 'Route data added successfully.',
      data: {
        mr_id: data.insertId,
        mr_route_name: route_name.trim(),
        mr_status: statusValue,
        mr_access_id: null,
      },
    })
  } catch (error) {
    console.error('Error adding route data:', error)
    console.error('Error SQL:', error.sql)
    console.error('Error parameters:', [route_name, status])

    res.status(500).json({
      message: 'Error adding route data.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    })
  }
}

// UPDATE
const updateRoute = async (req, res) => {
  const { id } = req.params
  const { route_name, status } = req.body

  if (!Number.isInteger(+id)) {
    return res.status(400).json({ message: 'Valid route ID is required.' })
  }

  if (![route_name, status].some((v) => v !== undefined)) {
    return res.status(400).json({
      message: 'At least one field (route_name or status) is required.',
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

    if (route_name !== undefined) {
      const name = route_name.trim()
      if (!name) {
        return res.status(400).json({ message: 'route_name cannot be empty.' })
      }

      // Check for duplicate route name
      const checkDuplicate = await Query(
        `SELECT mr_id FROM master_route WHERE mr_route_name = ? AND mr_id != ?`,
        [name, id],
      )

      if (checkDuplicate.length > 0) {
        return res.status(409).json({
          message: 'Route with this name already exists.',
        })
      }

      updates.push('mr_route_name = ?')
      params.push(name)
      updatedFields.route_name = name
    }

    if (status !== undefined) {
      const validStatuses = ['FULL', 'NO-ACCESS']
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
        message: 'Route with this name already exists.',
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
