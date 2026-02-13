const express = require('express')
const {
  getRiders,
  getRiderById,
  createRider,
  updateRider,
  getRiderActivityById,
  getAllRiderActivities,
} = require('../controller/rider.controller')

const riderRouter = express.Router()

// GET
riderRouter.get('/', getRiders)
riderRouter.get('/:id', getRiderById)

riderRouter.get('/activity', getRiderActivityById)
riderRouter.get('/activity/all', getAllRiderActivities)

// POST
riderRouter.post('/', createRider)

// PUT
riderRouter.put('/:id', updateRider)

module.exports = { riderRouter }
