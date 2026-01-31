const express = require('express')
const { validateField, validateSchema } = require('../middleware/validateSchema.middleware')
const { MasterAccessSchema, MasterAccessField } = require('../schemas/master-access.schema')
const { getAccess, addAccess, updateAccess } = require('../controller/access.controller')
const Joi = require('joi')

const accessRouter = express.Router()

// GET
accessRouter.get('/', getAccess)

// POST
accessRouter.post('/', addAccess)

// PUT
accessRouter.put(
  '/:id',

  validateField(MasterAccessSchema, [MasterAccessField.Id], 'params'),

  validateSchema({
    body: Joi.object({
      name: MasterAccessSchema.extract(MasterAccessField.Name).optional(),
      status: MasterAccessSchema.extract(MasterAccessField.Status).optional(),
    }).min(1),
  }),

  updateAccess,
)

module.exports = { accessRouter }
