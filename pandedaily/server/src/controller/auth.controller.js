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

  if (!username || !password) {
    return res.status(400).json({
      message: 'Username and password are required',
    })
  }

  try {
    // Check in master_user table
    const [adminUser] = await Query(
      `SELECT 
        mu_id AS id, 
        mu_fullname AS fullname, 
        mu_access_id AS access_id, 
        mu_username AS username,
        ma.ma_name AS role_name,
        'admin' AS user_type
       FROM master_user mu
       INNER JOIN master_access ma ON mu.mu_access_id = ma.ma_id
       WHERE mu.mu_username = ? 
         AND mu.mu_password = ?
         AND mu.mu_status = 'active'
         AND ma.ma_status = 'active'`,
      [username, EncryptString(password)],
    )

    if (adminUser) {
      const jwtPayload = {
        id: adminUser.id,
        fullname: adminUser.fullname,
        username: adminUser.username,
        access_id: adminUser.access_id,
        role_name: adminUser.role_name,
        user_type: 'admin',
      }

      const jwtToken = jwt.sign(jwtPayload, process.env._SECRET_KEY, {
        expiresIn: '30d',
      })

      console.log('RESULT:', jwtToken)

      return res.status(200).json({
        message: 'Login successful',
        token: jwtToken,
        user: jwtPayload,
      })
    }

    // Check in customer table
    const [customer] = await Query(
      `SELECT 
        c_id AS id,
        c_fullname AS fullname,
        c_contact AS contact,
        c_email AS email,
        c_address AS address,
        c_username AS username,
        c_is_registered AS is_registered,
        'customer' AS user_type
       FROM customer 
       WHERE c_username = ? 
         AND c_password = ?
         AND c_is_registered = true`,
      [username, EncryptString(password)],
    )

    if (customer) {
      const jwtPayload = {
        id: customer.id,
        fullname: customer.fullname,
        contact: customer.contact,
        email: customer.email,
        address: customer.address,
        username: customer.username,
        is_registered: customer.is_registered,
        user_type: 'customer',
      }

      const jwtToken = jwt.sign(jwtPayload, process.env._SECRET_KEY, {
        expiresIn: '30d',
      })

      return res.status(200).json({
        message: 'Login successful',
        token: jwtToken,
        user: jwtPayload,
      })
    }

    return res.status(401).json({
      message: 'Invalid username or password',
    })
  } catch (error) {
    console.error('Login error:', error)
    return res.status(500).json({
      message: 'Server error. Please try again later.',
    })
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
  req.session.jwt = null

  try {
    res.clearCookie('token')

    return res.status(200).json({
      success: true,
      message: 'Logout successful',
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Logout error:', error)
    return res.status(500).json({
      success: false,
      message: 'Logout failed. Please try again.',
    })
  }
}

// CUSTOMER
const registerCustomer = async (req, res) => {
  const { fullname, contact, email, address, latitude, longitude, username, password } = req.body

  try {
    // Validate required fields
    if (
      !fullname ||
      !contact ||
      !email ||
      !address ||
      !latitude ||
      !longitude ||
      !username ||
      !password
    ) {
      return res.status(400).json({
        message:
          'Fullname, contact, email, address, latitude, longitude, username and password are required.',
      })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: 'Invalid email format.',
      })
    }

    // Validate phone format
    const phoneRegex = /^(09|\+639)\d{9}$/
    const cleanedContact = contact.replace(/\s/g, '')
    if (!phoneRegex.test(cleanedContact)) {
      return res.status(400).json({
        message: 'Invalid phone number format. Use 09XXXXXXXXX or +639XXXXXXXXX',
      })
    }

    // Validate numeric values
    const lat = parseFloat(latitude)
    const lng = parseFloat(longitude)
    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({
        message: 'Latitude and longitude must be valid numbers.',
      })
    }

    // Validate password strength (minimum 8 characters)
    if (password.length < 5) {
      return res.status(400).json({
        message: 'Password must be at least 8 characters long.',
      })
    }

    // Validate username (alphanumeric, underscore, hyphen)
    const usernameRegex = /^[a-zA-Z0-9_-]{3,30}$/
    if (!usernameRegex.test(username)) {
      return res.status(400).json({
        message:
          'Username must be 3-30 characters and contain only letters, numbers, underscore, or hyphen.',
      })
    }

    // Check if username already exists
    const checkUsernameQuery = `SELECT c_id FROM customer WHERE c_username = ?`
    const existingUsername = await Query(checkUsernameQuery, [username])
    if (existingUsername.length > 0) {
      return res.status(409).json({
        message: 'Username already taken.',
      })
    }

    // Check if email already exists
    const checkEmailQuery = `SELECT c_id FROM customer WHERE c_email = ?`
    const existingEmail = await Query(checkEmailQuery, [email])
    if (existingEmail.length > 0) {
      return res.status(409).json({
        message: 'Email already registered.',
      })
    }

    // Check if contact already exists
    const checkContactQuery = `SELECT c_id FROM customer WHERE c_contact = ?`
    const existingContact = await Query(checkContactQuery, [cleanedContact])
    if (existingContact.length > 0) {
      return res.status(409).json({
        message: 'Contact number already registered.',
      })
    }

    // Insert customer with is_registered = 1 (true)
    const statement = `INSERT INTO customer(c_fullname, c_contact, c_email, c_address, c_latitude, c_longitude, c_username, c_password, c_is_registered) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)`
    const data = await Query(statement, [
      fullname.trim(),
      cleanedContact,
      email.toLowerCase().trim(),
      address.trim(),
      lat,
      lng,
      username.trim(),
      EncryptString(password),
      1, // Always registered for signup
    ])

    // Create a clean response without sensitive data
    const customerData = {
      id: data.insertId,
      fullname: fullname.trim(),
      contact: cleanedContact,
      email: email.toLowerCase().trim(),
      address: address.trim(),
      username: username.trim(),
      is_registered: true,
      created_at: new Date().toISOString(),
    }

    res.status(201).json({
      success: true,
      message: 'Customer registered successfully.',
      customer: customerData,
    })
  } catch (error) {
    console.error('Error registering customer:', error)

    // Don't log sensitive data
    console.error('Error SQL:', error.sql)

    // Handle specific database errors
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        success: false,
        message:
          'Registration failed. One of the fields (email, username, or contact) already exists.',
      })
    }

    res.status(500).json({
      success: false,
      message: 'An error occurred during registration. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    })
  }
}

// UPDATE CUSTOMER
const editRegisteredCustomer = async (req, res) => {
  const { id } = req.params
  const { fullname, email, is_registered, address, latitude, longitude, password } = req.body

  if (!Number.isInteger(+id)) {
    return res.status(400).json({ message: 'Valid customer ID is required.' })
  }

  if (
    ![fullname, email, is_registered, address, latitude, longitude, password].some(
      (v) => v !== undefined,
    )
  ) {
    return res.status(400).json({
      message:
        'At least one field (fullname, email, is_registered, address, latitude, longitude, or password) is required.',
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
      is_registered: 'c_is_registered',
      address: 'c_address',
      latitude: 'c_latitude',
      longitude: 'c_longitude',
    }

    for (const [field, column] of Object.entries(fieldMap)) {
      if (req.body[field] === undefined) continue

      let value = req.body[field]

      if (field === 'is_registered') {
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
