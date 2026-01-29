const fs = require('node:fs')
const { serve, setup } = require('swagger-ui-express')
const YAML = require('yaml')
const { accessRouter } = require('../routes/access.routes')

const file = fs.readFileSync('./src/docs/swagger.docs.yaml', 'utf8')
const swaggerDocs = YAML.parse(file)

const initRoutes = async (app) => {
  app.use('/api-docs', serve, setup(swaggerDocs))

  app.use('/access', accessRouter)
}

module.exports = {
  initRoutes,
}
