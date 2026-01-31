const express = require('express')
const { getCustomer } = require('../controller/customer.controller')

const customerRouter = express.Router()

// GET
customerRouter.get('/', getCustomer)

module.exports = { customerRouter }
