const fs = require('node:fs')
const { serve, setup } = require('swagger-ui-express')
const YAML = require('yaml')
const { accessRouter } = require('../routes/access.routes')
const { routeRouter } = require('../routes/route.routes')
const { userRouter } = require('../routes/user.routes')
const { authRouter } = require('../routes/auth.routes')
const { customerRouter } = require('../routes/customer.routes')
const { productRouter } = require('../routes/product.routes')
const { inventoryRouter } = require('../routes/inventory.routes')
const { orderRouter } = require('../routes/order.routes')
const { riderRouter } = require('../routes/rider.routes')
const { deliveryRouter } = require('../routes/delivery.routes')
const { auth } = require('../middleware/auth.middleware')

const file = fs.readFileSync('./src/docs/swagger.docs.yaml', 'utf8')
const swaggerDocs = YAML.parse(file)

const initRoutes = async (app) => {
  app.use('/api-docs', serve, setup(swaggerDocs))

  app.use('/auth', authRouter)

  app.use(auth)
  app.use('/access', accessRouter)
  app.use('/route', routeRouter)
  app.use('/user', userRouter)
  app.use('/customer', customerRouter)
  app.use('/product', productRouter)
  app.use('/inventory', inventoryRouter)
  app.use('/orders', orderRouter)
  app.use('/rider', riderRouter)
  app.use('/delivery', deliveryRouter)
}

module.exports = {
  initRoutes,
}
