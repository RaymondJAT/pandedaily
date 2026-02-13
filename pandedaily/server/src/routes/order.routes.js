const express = require('express')
const {
  getOrders,
  getOrderItem,
  addOrder,
  approvalOrder,
} = require('../controller/order.controller')

const orderRouter = express.Router()

// GET
orderRouter.get('/', getOrders)
orderRouter.get('/:id/item', getOrderItem)

// POST
orderRouter.post('/', addOrder)

// PUT
orderRouter.put('/:id', approvalOrder)

module.exports = { orderRouter }
