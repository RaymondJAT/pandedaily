const { Product } = require('../database/model/Product')
const { Query } = require('../database/utility/queries.util')
const { EncryptString, DecryptString } = require('../utils/cryptography.util')
require('dotenv').config()
const jwt = require('jsonwebtoken')
const https = require('https')

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

    // Check in rider table
    const [rider] = await Query(
      `SELECT 
        r_id AS id,
        r_fullname AS fullname,
        r_username AS username,
        r_contact AS contact,
        r_status AS status,
        'rider' AS user_type
       FROM rider 
       WHERE r_username = ? 
         AND r_password = ?
         AND r_status = 'ACTIVE'`,
      [username, EncryptString(password)],
    )

    if (rider) {
      const jwtPayload = {
        id: rider.id,
        fullname: rider.fullname,
        username: rider.username,
        contact: rider.contact,
        status: rider.status,
        user_type: 'rider',
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

    // If no user found in any table
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
  try {
    // Clear the cookie if you're using httpOnly cookies
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    })

    // Optional: Clear any server-side session data if you're using sessions
    if (req.session) {
      req.session.destroy()
    }

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
  const { fullname, contact, email, address, username, password, latitude, longitude } = req.body

  try {
    // Validate required fields
    if (!fullname || !contact || !email || !address || !username || !password) {
      return res.status(400).json({
        message: 'Fullname, contact, email, address, username and password are required.',
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

    // Validate password strength
    if (password.length < 3) {
      return res.status(400).json({
        message: 'Password must be at least 3 characters long.',
      })
    }

    // Validate username
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

    let finalLatitude = latitude
    let finalLongitude = longitude

    const hasValidCoordinates =
      finalLatitude &&
      finalLongitude &&
      !isNaN(parseFloat(finalLatitude)) &&
      !isNaN(parseFloat(finalLongitude)) &&
      parseFloat(finalLatitude) !== 0 &&
      parseFloat(finalLongitude) !== 0

    if (!hasValidCoordinates) {
      // Fallback
      console.log('⚠️ No valid coordinates from frontend, geocoding address...')

      try {
        // Add delay to respect Nominatim's usage policy
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Encode the address for URL
        const encodedAddress = encodeURIComponent(address)

        // Create a promise-based HTTPS request
        const geocodeResult = await new Promise((resolve, reject) => {
          const options = {
            hostname: 'nominatim.openstreetmap.org',
            path: `/search?q=${encodedAddress}&format=json&limit=1&accept-language=en`,
            method: 'GET',
            headers: {
              'User-Agent': 'PandeDailyApp/1.0',
            },
          }

          const req = https.get(options, (response) => {
            let data = ''
            response.on('data', (chunk) => {
              data += chunk
            })
            response.on('end', () => {
              try {
                const parsedData = JSON.parse(data)
                resolve(parsedData)
              } catch (e) {
                reject(new Error('Failed to parse geocoding response'))
              }
            })
          })

          req.on('error', (error) => reject(error))
          req.end()
        })

        if (geocodeResult && geocodeResult.length > 0) {
          finalLatitude = parseFloat(geocodeResult[0].lat)
          finalLongitude = parseFloat(geocodeResult[0].lon)
          console.log('📍 Geocoded address:', geocodeResult[0].display_name)
        } else {
          return res.status(400).json({
            message:
              'Could not find coordinates for the provided address. Please provide a more specific address.',
          })
        }
      } catch (geocodeError) {
        console.error('❌ Geocoding error:', geocodeError)
        return res.status(400).json({
          message: 'Error processing address. Please check your address or try again later.',
        })
      }
    } else {
      console.log('✅ Using coordinates from map click:', {
        lat: finalLatitude,
        lng: finalLongitude,
      })
    }

    // Validate final coordinates
    if (isNaN(parseFloat(finalLatitude)) || isNaN(parseFloat(finalLongitude))) {
      return res.status(400).json({
        message: 'Could not determine coordinates from the provided information.',
      })
    }

    // Insert customer with is_registered = 1
    const statement = `INSERT INTO customer(c_fullname, c_contact, c_email, c_address, c_latitude, c_longitude, c_username, c_password, c_is_registered) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)`
    const data = await Query(statement, [
      fullname.trim(),
      cleanedContact,
      email.toLowerCase().trim(),
      address.trim(),
      parseFloat(finalLatitude), // ✅ Store the coordinates (from map click or fallback)
      parseFloat(finalLongitude), // ✅
      username.trim(),
      EncryptString(password),
      1,
    ])

    // Create a clean response without sensitive data
    const customerData = {
      id: data.insertId,
      fullname: fullname.trim(),
      contact: cleanedContact,
      email: email.toLowerCase().trim(),
      address: address.trim(),
      latitude: parseFloat(finalLatitude),
      longitude: parseFloat(finalLongitude),
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

// PRODUCT
const getProduct = async (req, res) => {
  try {
    const statement = `SELECT 
      p.p_id AS id, 
      p.p_name AS name, 
      p.p_category_id AS category_id,  
      pc.pc_name AS category_name, 
      p.p_price AS price, 
      p.p_cost AS cost, 
      p.p_status AS status, 
      pi.pi_image AS image 
    FROM product p
    INNER JOIN product_category pc ON p.p_category_id = pc.pc_id
    LEFT JOIN product_image pi ON p.p_id = pi.pi_product_id`

    const data = await Query(statement, [], Product.product.prefix_)
    res.status(200).json({ message: 'Product data retrieved.', data })
  } catch (error) {
    console.error('Error retrieving product data:', error)
    res.status(500).json({
      message: 'Error retrieving product data.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    })
  }
}

const getProductCategory = async (req, res) => {
  try {
    const statement = `SELECT * FROM product_category`

    const data = await Query(statement, [], Product.product_category.prefix_)
    res.status(200).json({ message: 'Product category data retrieved.', data })
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving product category data.' })
  }
}

module.exports = {
  Login,
  CheckSession,
  Logout,
  registerCustomer,
  editRegisteredCustomer,
  getProduct,
  getProductCategory,
}
