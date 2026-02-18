const express = require('express')
const {
  getProductById,
  addProductCategory,
  addProduct,
  updateProductCategory,
  updateProduct,
} = require('../controller/product.controller')

const productRouter = express.Router()

// GET BY ID
productRouter.get('/:id', getProductById)

// POST
productRouter.post('/category', addProductCategory)
productRouter.post('/', addProduct)

// PUT
productRouter.put('/category/:id', updateProductCategory)
productRouter.put('/:id', updateProduct)

module.exports = { productRouter }
