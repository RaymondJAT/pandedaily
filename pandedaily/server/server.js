require('dotenv').config()
const express = require('express')
const app = express()
const cors = require('cors')

const { logger } = require('./src/utils/logger.util')
const { initRoutes } = require('./src/startup/routes.startup')
const { initStaticFiles } = require('./src/startup/staticFiles.startup')
const { httpLogger } = require('./src/middleware/logger.middleware')
const { initSession } = require('./src/startup/session.startup')
const { checkConnection } = require('./src/database/utility/queries.util')
const { corsOptions } = require('./src/middleware/corsOptions.middleware')

const port = process.env.PORT || 3050

const ServerStart = async () => {
  try {
    logger.info('Server started')

    logger.info('Adding req body json parser')
    app.use(express.json())
    app.use(express.urlencoded({ extended: true }))

    logger.info('Initializing logger middleware')
    app.use(httpLogger)

    logger.info('Initializing CORS middleware')
    app.use(cors(corsOptions))

    logger.info('Initializing routes')
    initRoutes(app)

    logger.info('Initializing session middleware')
    initSession(app)

    logger.info('Checking database connection')
    await checkConnection()

    const server = app.listen(port, () => {
      logger.info(`Server listening on port http://localhost:${port}`)
    })

    logger.info('Serving static files')
    initStaticFiles(app)

    process.on('SIGINT', () => {
      logger.info('SIGINT signal received, Closing the application')
      server.close()
      logger.info('--------------------Server Closed----------------------')
      process.exit(0)
    })
  } catch (error) {
    logger.error('FATAL: Failed to start server due to database error.', error)
    console.log(error)

    process.exit(1)
  }
}

ServerStart()
