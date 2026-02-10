const express = require('express')
const {
  getInventory,
  // addInventory,
  getAllInventoryHistory,
  getInventoryHistory,
  updateInventory,
} = require('../controller/inventory.controller')

const inventoryRouter = express.Router()

// GET
inventoryRouter.get('/', getInventory)
inventoryRouter.get('/history', getAllInventoryHistory)

inventoryRouter.get('/history/:id', getInventoryHistory)

// CREATE
// inventoryRouter.post('/', addInventory)

// UPDATE
inventoryRouter.put('/:id', updateInventory)

module.exports = { inventoryRouter }
