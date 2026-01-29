const Joi = require('joi')

/**
 * Middleware to validate specific parts of the request (body, query, params) against Joi schemas.
 * @param {object} schemas - An object containing Joi schemas, e.g., { body: Joi.object({...}), query: Joi.object({...}) }
 */
const validateSchema = (schemas) => (req, res, next) => {
  const locations = ['body', 'query', 'params']

  const errors = []

  for (const location of locations) {
    const schema = schemas[location]
    const data = req[location]

    if (schema) {
      const { error, value } = schema.validate(data, {
        abortEarly: false,
        allowUnknown: false, // Prevents unexpected/extra fields
      })

      if (error) {
        const locationErrors = error.details.map((detail) => ({
          location: location,
          field: detail.context.key,
          message: detail.message.replace(/['"]/g, ''),
        }))
        errors.push(...locationErrors)
      } else {
        req[location] = value
      }
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      msg: 'Validation failed for one or more fields.',
      errors: errors,
    })
  }

  next()
}

/**
 * Creates a partial Joi schema from a full schema, focusing only on a list of fields.
 * This is nested inside the main validation function so it's private and clean.
 */
const createPartialSchema = (fullSchema, fieldsToValidate) => {
  let partialSchema = Joi.object({})

  fieldsToValidate.forEach((field) => {
    try {
      let fieldValidator = fullSchema.extract(field).required()

      partialSchema = partialSchema.keys({
        [field]: fieldValidator,
      })
    } catch (error) {
      console.warn(`[Schema Error] Field '${field}' not found for partial validation.`)
    }
  })

  return partialSchema.unknown(false)
}

/**
 * Reusable Express Middleware factory for Joi validation.
 * @param {Joi.ObjectSchema} fullSchema - The complete auto-generated Joi schema.
 * @param {string[]} fieldsToValidate - An array of column names to include and require in the subset schema.
 * @param {'body' | 'params' | 'query'} [source='body'] - The request property to validate.
 */
const validateField = (fullSchema, fieldsToValidate, source = 'body') => {
  const schemaToUse =
    fieldsToValidate.length > 0 ? createPartialSchema(fullSchema, fieldsToValidate) : fullSchema

  return (req, res, next) => {
    const data = req[source]

    const { error } = schemaToUse.validate(data, {
      abortEarly: false,
    })

    if (error) {
      const messages = error.details.map((d) => d.message.replace(/['"]/g, ''))
      return res.status(400).json({
        error: `Empty ${source} fields.`,
        details: messages,
      })
    }
    next()
  }
}

module.exports = {
  validateSchema,
  validateField,
}
