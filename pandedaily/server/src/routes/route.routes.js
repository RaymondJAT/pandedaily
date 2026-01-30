const express = require('express')
const { validateField, validateSchema } = require('../middleware/validateSchema.middleware')
const { MasterRouteSchema, MasterRouteField } = require('../schemas/master-route.schema')
const { getRoute, addRoute, updateRoute } = require('../controller/route.controller')
const Joi = require('joi')

const routeRouter = express.Router()

// GET
routeRouter.get('/', getRoute)

// POST
routeRouter.post('/', addRoute)

// PUT
routeRouter.put('/:id', updateRoute)

module.exports = { routeRouter }
