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
const addAccess = async (req, res) => {
  const { name, status = 1 } = req.body

  try {
    if (!name) {
      return res.status(400).json({
        message: 'Access name is required.',
      })
    }

    const statement = `INSERT INTO master_access(ma_name, ma_status) VALUES(?, ?)`
    const data = await Insert(statement, [name, status])

    res.status(200).json({
      message: 'Access data added successfully.',
      data,
    })
  } catch (error) {
    console.error('Error adding access data:', error)
    res.status(500).json({
      message: 'Error adding access data.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    })
  }
}

// UPDATE
const updateAccess = async (req, res) => {
  const { id } = req.params
  const { name, status } = req.body

  try {
    if (!id) {
      return res.status(400).json({
        message: 'Access ID is required.',
      })
    }

    if (!name && !status) {
      return res.status(400).json({
        message: 'At least one field (name or status) is required for update.',
      })
    }

    let formattedStatus
    if (status) {
      const validStatuses = ['ACTIVE', 'INACTIVE', 'DELETED']
      if (!validStatuses.includes(status.toUpperCase())) {
        return res.status(400).json({
          message: 'Status must be one of: ACTIVE, INACTIVE, or DELETED',
          validStatuses,
        })
      }
      formattedStatus = status.toUpperCase()
    }

    const checkStatement = `SELECT ma_id FROM master_access WHERE ma_id = ?`
    const recordExists = await Query(checkStatement, [id])

    if (recordExists.length === 0) {
      return res.status(404).json({
        message: 'Access record not found.',
      })
    }

    let statement
    let params = []

    if (name && formattedStatus) {
      statement = `UPDATE master_access SET ma_name = ?, ma_status = ? WHERE ma_id = ?`
      params = [name, formattedStatus, id]
    } else if (name) {
      statement = `UPDATE master_access SET ma_name = ? WHERE ma_id = ?`
      params = [name, id]
    } else if (formattedStatus) {
      statement = `UPDATE master_access SET ma_status = ? WHERE ma_id = ?`
      params = [formattedStatus, id]
    }

    const data = await Query(statement, params)

    res.status(200).json({
      message: 'Access data updated successfully.',
      data,
      updatedFields: {
        ...(name && { name }),
        ...(formattedStatus && { status: formattedStatus }),
      },
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
