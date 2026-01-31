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

module.exports = {
  Login,
  CheckSession,
  Logout,
}
