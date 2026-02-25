const express = require('express')
const {
  createCheckoutSession,
  getCheckoutSession,
  handleWebhook,
} = require('../controller/paymongo.controller')

const paymongoRouter = express.Router()

// GET
paymongoRouter.get('/checkout-session/:sessionId', getCheckoutSession)

// POST
paymongoRouter.post('/create-checkout-session', createCheckoutSession)

paymongoRouter.post('/webhook', handleWebhook)

paymongoRouter.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'PayMongo route is working!',
    timestamp: new Date().toISOString(),
  })
})

module.exports = { paymongoRouter }
