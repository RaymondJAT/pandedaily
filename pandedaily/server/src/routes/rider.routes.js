const express = require('express')
const { getRiders } = require('../controller/rider.controller')

const riderRouter = express.Router()

// GET
riderRouter.get('/', getRiders)

module.exports = { riderRouter }
