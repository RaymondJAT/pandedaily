const express = require('express')
const {
  Login,
  CheckSession,
  Logout,
  registerCustomer,
  editRegisteredCustomer,
  getProduct,
  getProductCategory,
} = require('../controller/auth.controller')

const authRouter = express.Router()

authRouter.post('/login', Login)
authRouter.get('/check', CheckSession)
authRouter.post('/logout', Logout)

// CUSTOMER
authRouter.post('/register', registerCustomer)
authRouter.put('/:id', editRegisteredCustomer)

// PRODUCT
authRouter.get('/product', getProduct)
authRouter.get('/product/category', getProductCategory)

module.exports = { authRouter }
