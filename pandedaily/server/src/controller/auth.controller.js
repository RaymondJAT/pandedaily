const { Query } = require('../database/utility/queries.util')
const { EncryptString, DecryptString } = require('../utils/cryptography.util')
require('dotenv').config()
const jwt = require('jsonwebtoken')

/**
 * Login user account.
 * Method: POST
 * @param { username, password } body
 * @returns {json}
 */
const Login = async (req, res) => {
  const { username, password } = req.body

  try {
    const [result] = await Query(
      `SELECT mu_id AS id, mu_fullname AS fullname, mu_access_id AS access_id, mu_username AS userName FROM master_user WHERE mu_username = ? AND  mu_password = ?`,
      [username, EncryptString(password)],
    )

    if (!result) {
      return res.status(401).json({ message: 'Invalid username or password.' })
    }
    const { id, fullname, access_id, userName } = result

    const jwtPayload = {
      id,
      fullname,
      access_id,
      userName,
    }

    const jwtToken = jwt.sign(jwtPayload, process.env._SECRET_KEY, {
      expiresIn: '30d',
    })

    req.session.jwt = jwtToken
    req.session.id = id
    req.session.fullname = fullname
    req.session.access_id = access_id
    req.session.username = userName

    return res.status(200).json({
      message: 'Login successful',
      token: jwtToken,
      user: jwtPayload,
    })
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: 'Server error' })
  }
}

/**
 * Checks if the JWT stored in the session is valid.
 * Method: GET
 * @param {req} req
 * @returns {json} User details if authenticated, or 401 if not.
 */
const CheckSession = async (req, res) => {
  let token = req.session.jwt

  if (!token) {
    const authHeader = req.headers['authorization']
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1]
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'No active session found.' })
  }

  try {
    const decoded = jwt.verify(token, process.env._SECRET_KEY)

    const { id, fullname, access_id, username } = decoded

    return res.status(200).json({
      id,
      fullname,
      access_id,
      username,
    })
  } catch (err) {
    logger.warn('Invalid or expired JWT detected during session check.', err)

    try {
      if (req.session) {
        req.session.destroy(() => {})
      }
    } catch (destroyErr) {
      logger.error('Error during session cleanup:', destroyErr)
    }

    return res.status(401).json({ message: 'Session expired or invalid.' })
  }
}

/**
 * Destroys the session.
 * Method: POST
 */
const Logout = async (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Cannot destroy session')
    }

    res.sendStatus(204)
  })
}

// CUSTOMER
const registerCustomer = async (req, res) => {
  const { fullname, email, customer_type, address, latitude, longitude, password } = req.body

  try {
    if (!fullname || !email || !customer_type || !address || !latitude || !longitude || !password) {
      return res.status(400).json({
        message:
          'Fullname, email, customer_type, address, latitude, longitude, and password are required.',
      })
    }

    const statement = `INSERT INTO customer(c_fullname, c_email, c_customer_type, c_address, c_latitude, c_longitude, c_password) VALUES(?, ?, ?, ?, ?, ?, ?)`
    const data = await Query(statement, [
      fullname,
      email,
      customer_type,
      address,
      latitude,
      longitude,
      EncryptString(password),
    ])

    res.status(201).json({
      message: 'Customer data added successfully.',
      data,
      insertedId: data.insertId,
    })
  } catch (error) {
    console.error('Error adding customer data:', error)
    console.error('Error SQL:', error.sql)
    console.error('Error parameters:', [
      fullname,
      email,
      customer_type,
      address,
      latitude,
      longitude,
      password,
    ])

    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        message: 'Customer with this email already exists.',
      })
    }

    res.status(500).json({
      message: 'Error adding customer data.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    })
  }
}

// UPDATE CUSTOMER
const editRegisteredCustomer = async (req, res) => {
  const { id } = req.params
  const { fullname, email, customer_type, address, latitude, longitude, password } = req.body

  if (!Number.isInteger(+id)) {
    return res.status(400).json({ message: 'Valid customer ID is required.' })
  }

  if (
    ![fullname, email, customer_type, address, latitude, longitude, password].some(
      (v) => v !== undefined,
    )
  ) {
    return res.status(400).json({
      message:
        'At least one field (fullname, email, customer_type, address, latitude, longitude, or password) is required.',
    })
  }

  try {
    const [customer] = await Query(`SELECT c_id FROM customer WHERE c_id = ?`, [id])

    if (!customer) {
      return res.status(404).json({ message: 'Customer record not found.' })
    }

    const updates = []
    const params = []
    const updatedFields = {}

    const fieldMap = {
      fullname: 'c_fullname',
      email: 'c_email',
      customer_type: 'c_customer_type',
      address: 'c_address',
      latitude: 'c_latitude',
      longitude: 'c_longitude',
    }

    for (const [field, column] of Object.entries(fieldMap)) {
      if (req.body[field] === undefined) continue

      let value = req.body[field]

      if (field === 'customer_type') {
        const validCustomerTypes = ['REGISTERED', 'GUEST']
        value = value.toUpperCase()

        if (!validCustomerTypes.includes(value)) {
          return res.status(400).json({
            message: 'Invalid customer type',
            validCustomerTypes,
          })
        }
      }

      updates.push(`${column} = ?`)
      params.push(value)
      updatedFields[field] = value
    }

    if (password !== undefined) {
      if (typeof password !== 'string' || password.length < 8) {
        return res.status(400).json({
          message: 'Password must be at least 8 characters long.',
        })
      }

      updates.push('c_password = ?')
      params.push(EncryptString(password))
      updatedFields.password = '[ENCRYPTED]'
    }

    params.push(id)

    await Query(`UPDATE customer SET ${updates.join(', ')} WHERE c_id = ?`, params)

    res.status(200).json({
      message: 'Customer updated successfully.',
      updatedFields,
    })
  } catch (error) {
    console.error('Error updating customer:', error)

    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        message: 'Customer with this email already exists.',
      })
    }

    res.status(500).json({
      message: 'Error updating customer.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    })
  }
}

module.exports = {
  Login,
  CheckSession,
  Logout,
  registerCustomer,
  editRegisteredCustomer,
}
