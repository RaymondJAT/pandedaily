const express = require('express')
const { getCustomer, getCustomerById } = require('../controller/customer.controller')

const customerRouter = express.Router()

// GET
customerRouter.get('/', getCustomer)
customerRouter.get('/:id', getCustomerById)

module.exports = { customerRouter }
