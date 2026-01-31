const { Master } = require('../database/model/Master')
const { Query } = require('../database/utility/queries.util')
const { EncryptString, DecryptString } = require('../utils/cryptography.util')

// READ
const getUser = async (req, res) => {
  try {
    console.log(req.context)

    const statement = `SELECT * FROM master_user`

    const data = await Query(statement, [], Master.master_user.prefix_)

    res.status(200).json({ message: 'User data retrieved.', data })
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving user data.' })
  }
}

const getUserById = async (req, res) => {
  const { id } = req.params

  try {
    const statement = `SELECT * FROM master_user WHERE mu_id = ?`
    const data = await Query(statement, [id], Master.master_user.prefix_)
    res.status(200).json({ message: 'User data retrieved.', data })
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving user data.' })
  }
}

// CREATE
const addUser = async (req, res) => {
  const { fullname, access_id, email, username, status = 1 } = req.body
  let { password } = req.body

  try {
    if (!fullname || !access_id || !email || !username || !password) {
      return res.status(400).json({
        message: 'Fullname, access_id, email, username, and password are required.',
      })
    }

    const statement = `INSERT INTO master_user(mu_fullname, mu_access_id, mu_email, mu_username, mu_password, mu_status) VALUES(?, ?, ?, ?, ?, ?)`
    const data = await Query(statement, [
      fullname,
      access_id,
      email,
      username,
      EncryptString(password),
      status,
    ])

    res.status(201).json({
      message: 'User data added successfully.',
      data,
      insertedId: data.insertId,
    })
  } catch (error) {
    console.error('Error adding user data:', error)
    console.error('Error SQL:', error.sql)
    console.error('Error parameters:', [fullname, access_id, email, username, password, status])

    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        message: 'User with this email already exists.',
      })
    }

    res.status(500).json({
      message: 'Error adding user data.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    })
  }
}

// UPDATE
const updateUser = async (req, res) => {
  const { id } = req.params
  const { fullname, access_id, email, username, password, status } = req.body

  if (!id) {
    return res.status(400).json({ message: 'User ID is required.' })
  }

  if (![fullname, access_id, email, username, password, status].some(Boolean)) {
    return res.status(400).json({
      message:
        'At least one field (fullname, access_id, email, username, password, or status) is required.',
    })
  }

  try {
    const userExists = await Query(`SELECT mu_id FROM master_user WHERE mu_id = ?`, [id])

    if (!userExists.length) {
      return res.status(404).json({ message: 'User record not found.' })
    }

    const updates = []
    const params = []
    const updatedFields = {}

    const fieldMap = {
      fullname: 'mu_fullname',
      email: 'mu_email',
      username: 'mu_username',
      status: 'mu_status',
      access_id: 'mu_access_id',
      password: 'mu_password',
    }

    for (const [field, column] of Object.entries(fieldMap)) {
      if (!req.body[field]) continue

      let value = req.body[field]

      if (field === 'status') {
        const validStatuses = ['ACTIVE', 'INACTIVE', 'DELETED']
        value = value.toUpperCase()
        if (!validStatuses.includes(value)) {
          return res.status(400).json({
            message: 'Invalid status',
            validStatuses,
          })
        }
      }

      if (field === 'access_id') {
        const accessExists = await Query(`SELECT ma_id FROM master_access WHERE ma_id = ?`, [value])
        if (!accessExists.length) {
          return res.status(404).json({ message: 'Access ID not found.' })
        }
      }

      if (field === 'password') {
        value = EncryptString(value)
        updatedFields.password = '[ENCRYPTED]'
      } else {
        updatedFields[field] = value
      }

      updates.push(`${column} = ?`)
      params.push(value)
    }

    params.push(id)

    const statement = `
      UPDATE master_user
      SET ${updates.join(', ')}
      WHERE mu_id = ?
    `

    const data = await Query(statement, params)

    if (data.affectedRows === 0) {
      return res.status(404).json({
        message: 'User not found or no changes made.',
      })
    }

    res.status(200).json({
      message: 'User updated successfully.',
      data,
      updatedFields,
    })
  } catch (error) {
    console.error('Error updating user:', error)

    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        message: 'User with this email/username already exists.',
      })
    }

    res.status(500).json({
      message: 'Error updating user.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    })
  }
}

module.exports = {
  getUser,
  getUserById,
  addUser,
  updateUser,
}
