const { Master } = require('../database/model/Master')
const { Query, Insert } = require('../database/utility/queries.util')

// READ
const getAccess = async (req, res) => {
  try {
    const statement = `SELECT * FROM master_access`

    const data = await Query(statement, [], Master.master_access.prefix_)
    res.status(200).json({ message: 'Access data retrieved.', data })
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving user data.' })
  }
}

// CREATE
const addAccess = async (req, res_) => {
  try {
    const { name, status = 1 } = req.body
    const statement = `INSERT INTO master_access(ma_name, ma_status) VALUES(?, ?)`
    const data = await Query(statement, [name, status])
    res_.status(200).json({
      message: 'Access data added successfully.',
      data,
    })
  } catch (error) {
    console.error('Error adding access data:', error)
    res_.status(500).json({
      message: 'Error adding access data.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    })
  }
}

// UPDATE
const updateAccess = async (req, res) => {
  const { id } = req.params
  const { name, status } = req.body

  if (!Number.isInteger(+id)) {
    return res.status(400).json({ message: 'Valid access ID is required.' })
  }

  if (![name, status].some((v) => v !== undefined)) {
    return res.status(400).json({
      message: 'At least one field (name or status) is required.',
    })
  }

  try {
    const [access] = await Query(`SELECT ma_id FROM master_access WHERE ma_id = ?`, [id])

    if (!access) {
      return res.status(404).json({ message: 'Access record not found.' })
    }

    const updates = []
    const params = []
    const updatedFields = {}

    if (name !== undefined) {
      const trimmed = name.trim()
      if (!trimmed) {
        return res.status(400).json({ message: 'Name cannot be empty.' })
      }

      updates.push('ma_name = ?')
      params.push(trimmed)
      updatedFields.name = trimmed
    }

    if (status !== undefined) {
      const validStatuses = ['ACTIVE', 'INACTIVE', 'DELETED']
      const value = status.toUpperCase()

      if (!validStatuses.includes(value)) {
        return res.status(400).json({
          message: 'Status must be one of: ACTIVE, INACTIVE, DELETED',
          validStatuses,
        })
      }

      updates.push('ma_status = ?')
      params.push(value)
      updatedFields.status = value
    }

    params.push(id)

    await Query(`UPDATE master_access SET ${updates.join(', ')} WHERE ma_id = ?`, params)

    res.status(200).json({
      message: 'Access data updated successfully.',
      updatedFields,
    })
  } catch (error) {
    console.error('Error updating access data:', error)

    res.status(500).json({
      message: 'Error updating access data.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    })
  }
}

module.exports = {
  getAccess,
  addAccess,
  updateAccess,
}
