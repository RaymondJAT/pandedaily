const express = require('express')
const {
  getDelivery,
  getDeliveryActivities,
  getDeliveryById,
  getDeliveryActivitiesById,
  addDelivery,
  addDeliveryImages,
  updateDeliveryStatus,
  assignRider,
} = require('../controller/delivery.controller')

const deliveryRouter = express.Router()

// GET
deliveryRouter.get('/', getDelivery)
deliveryRouter.get('/activities', getDeliveryActivities)
deliveryRouter.get('/:id/activities', getDeliveryActivitiesById)
deliveryRouter.get('/:id', getDeliveryById)

// POST
deliveryRouter.post('/', addDelivery)
deliveryRouter.post('/:id/images', addDeliveryImages)

// PUT
deliveryRouter.put('/:id/status', updateDeliveryStatus)
deliveryRouter.put('/:id/assign', assignRider)

module.exports = { deliveryRouter }
