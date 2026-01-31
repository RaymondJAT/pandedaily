const express = require('express')
const { getRoute, addRoute, updateRoute } = require('../controller/route.controller')

const routeRouter = express.Router()

// GET
routeRouter.get('/', getRoute)

// POST
routeRouter.post('/', addRoute)

// PUT
routeRouter.put('/:id', updateRoute)

module.exports = { routeRouter }
