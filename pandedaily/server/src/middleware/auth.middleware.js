'use strict'

const jwt = require('jsonwebtoken')
const { Query } = require('../database/utility/queries.util')
const { SQLQueryBuilder } = require('../utils/helper.util')
const { Master } = require('../database/model/Master')
const { logger } = require('../utils/logger.util')
const { EncryptString } = require('../utils/cryptography.util')
require('dotenv').config()

const SQL = new SQLQueryBuilder()

const auth = async (req, res, next) => {
  try {
    let token = req.session.jwt

    // console.log(req.headers)
    if (!token && req.headers['authorization']) {
      token = req.headers['authorization'].split(' ')[1]
    }

    if (!token) {
      return res.status(401).json({ message: 'Unauthorized: Please login.' })
    }

    const decodedUser = jwt.verify(token, process.env._SECRET_KEY)
    // console.log(decodedUser)

    req.context = {
      ...decodedUser,
    }

    return next()
  } catch (err) {
    logger.error('Auth Middleware Error', err)
    return res.status(401).json({ message: 'Authentication failed.' })
  }
}

module.exports = { auth }
