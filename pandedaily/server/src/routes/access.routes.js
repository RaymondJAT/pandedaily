const express = require('express')
const { validateField } = require('../middleware/validateSchema.middleware')
const { MasterAccessSchema, MasterAccessField } = require('../schemas/master-access.schema')
const { getAccess } = require('../controller/access.controller')

const accessRouter = express.Router()

accessRouter.get('/', getAccess)

module.exports = { accessRouter }
