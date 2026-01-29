const express = require('express')
const { validateField } = require('../middleware/validateSchema.middleware')
const { MasterAccessSchema, MasterAccessField } = require('../schemas/master-access.schema')
const { getAccess, addAccess, updateAccess } = require('../controller/access.controller')

const accessRouter = express.Router()

// GET
accessRouter.get('/', getAccess)

// POST
accessRouter.post(
  '/',
  validateField(MasterAccessSchema, [MasterAccessField.Name, MasterAccessField.Status]),
  addAccess,
)

// PUT
accessRouter.put(
  '/:id',
  validateField(MasterAccessSchema, [
    MasterAccessField.Id,
    MasterAccessField.Name,
    MasterAccessField.Status,
  ]),
  updateAccess,
)

module.exports = { accessRouter }
