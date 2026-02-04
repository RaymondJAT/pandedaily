const express = require('express')
const {
  Login,
  CheckSession,
  Logout,
  registerCustomer,
  editRegisteredCustomer,
} = require('../controller/auth.controller')

const authRouter = express.Router()

authRouter.post('/login', Login)
authRouter.get('/check', CheckSession)
authRouter.post('/logout', Logout)

// CUSTOMER
authRouter.post('/', registerCustomer)
authRouter.put('/:id', editRegisteredCustomer)

module.exports = { authRouter }
