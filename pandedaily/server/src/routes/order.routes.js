const express = require('express')
const {
  getOrders,
  getOrderItem,
  addOrder,
  addOrderItem,
} = require('../controller/order.controller')

const orderRouter = express.Router()

// GET
orderRouter.get('/', getOrders)
orderRouter.get('/item', getOrderItem)

// POST
orderRouter.post('/', addOrder)
orderRouter.post('/item', addOrderItem)

module.exports = { orderRouter }
