const express = require('express')
const {
  getDelivery,
  getDeliveryById,
  addDelivery,
  updateDelivery,
} = require('../controller/delivery.controller')

const deliveryRouter = express.Router()

// GET
deliveryRouter.get('/', getDelivery)
deliveryRouter.get('/:id', getDeliveryById)

// POST
deliveryRouter.post('/', addDelivery)

// PUT
deliveryRouter.put('/:id', updateDelivery)

module.exports = { deliveryRouter }
