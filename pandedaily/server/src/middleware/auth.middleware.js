'use strict'

const jwt = require('jsonwebtoken')
require('dotenv').config()
const { logger } = require('../util/logger.util')

const auth = async (req, res, next) => {
  const token = req.session.jwt

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized: No authentication token found.' })
  }

  if (!process.env._SECRET_KEY) {
    logger.error('JWT Secret key not found in environment variables.')
    return res.status(500).json({ message: 'Server configuration error.' })
  }

  try {
    const decoded = jwt.verify(token, process.env._SECRET_KEY)
    req.context = {
      usercode: decoded.usercode,
      accesstype: decoded.accesstype,
      branchid: decoded.branchid,
      employeeid: decoded.employeeid,
    }

    req.session.usercode = decoded.usercode
    req.session.accesstype = decoded.accesstype
    req.session.branchid = decoded.branchid
    req.session.employeeid = decoded.employeeid

    return next()
  } catch (err) {
    logger.error('JWT Verification Failed')
    req.session.destroy(() => {})

    return res.status(401).json({ message: 'Unauthorized: Invalid or expired token.' })
  }
}

module.exports = {
  auth,
}
