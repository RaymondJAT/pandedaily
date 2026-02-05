const express = require('express')
const { getOrders, getOrderItem, addOrder } = require('../controller/order.controller')

const orderRouter = express.Router()

// GET
orderRouter.get('/', getOrders)
orderRouter.get('/:id/item', getOrderItem)

// POST
orderRouter.post('/', addOrder)

module.exports = { orderRouter }
