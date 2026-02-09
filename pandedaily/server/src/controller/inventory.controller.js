const { Inventory } = require('../database/model/Inventory')
const { Query } = require('../database/utility/queries.util')

// GET ALL
const getInventory = async (req, res) => {
  try {
    const statement = `SELECT i_id, p.p_name AS product_name, i_current_stock, i_previous_stock FROM inventory i
    INNER JOIN product p ON i.i_product_id = p.p_id
    `

    const data = await Query(statement, [], Inventory.inventory.prefix_)
    res.status(200).json({ message: 'Inventory data retrieved.', data })
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving inventory data.' })
  }
}

const getAllInventoryHistory = async (req, res) => {
  try {
    const statement = `
      SELECT
        ih.ih_id AS id,
        ih.ih_inventory_id AS inventory_id,
        p.p_id AS product_id,
        p.p_name AS product_name,
        ih.ih_stock_before AS stock_before,
        ih.ih_stock_after AS stock_after,
        ih.ih_status AS status,
        ih.ih_date AS date
      FROM inventory_history ih
      INNER JOIN inventory i ON ih.ih_inventory_id = i.i_id
      INNER JOIN product p ON i.i_product_id = p.p_id
      ORDER BY ih.ih_date DESC
    `

    const data = await Query(statement)

    res.status(200).json({
      message: 'All inventory history retrieved.',
      count: data.length,
      data,
    })
  } catch (error) {
    console.error('Error retrieving inventory history:', error)
    res.status(500).json({
      message: 'Error retrieving inventory history data.',
    })
  }
}

// GET BY ID
const getInventoryHistory = async (req, res) => {
  const { id } = req.params

  if (!id || isNaN(Number(id))) {
    return res.status(400).json({
      message: 'Valid Inventory ID is required.',
    })
  }

  try {
    const statement = `
      SELECT *
      FROM inventory_history
      WHERE ih_inventory_id = ?
      ORDER BY ih_date DESC
    `

    const data = await Query(statement, [id], Inventory.inventory_history.prefix_)

    if (!data.length) {
      return res.status(404).json({
        message: 'No inventory history found.',
      })
    }

    res.status(200).json({
      message: 'Inventory history data retrieved.',
      count: data.length,
      data,
    })
  } catch (error) {
    console.error('Error retrieving inventory history:', error)
    res.status(500).json({
      message: 'Error retrieving inventory history data.',
    })
  }
}

// CREATE
const addInventory = async (req, res) => {
  const { product_id, current_stock, previous_stock } = req.body

  try {
    const statement = `INSERT INTO inventory(i_product_id, i_current_stock, i_previous_stock) VALUES(?, ?, ?)`
    const data = await Query(statement, [product_id, current_stock, previous_stock])

    res.status(200).json({
      message: 'Inventory data added successfully.',
      data,
      insertedId: data.insertId,
    })
  } catch (error) {
    console.error('Error adding inventory data:', error)
    console.error('Error SQL:', error.sql)
    console.error('Error parameters:', [product_id, current_stock, previous_stock])

    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Inventory with this product_id already exists.' })
    }

    res.status(500).json({ message: 'Error adding inventory data.' })
  }
}

// UPDATE
const updateInventory = async (req, res) => {
  const { id } = req.params
  const { current_stock } = req.body

  if (!id || isNaN(Number(id))) {
    return res.status(400).json({
      message: 'Valid Inventory ID is required.',
    })
  }

  if (current_stock === undefined || isNaN(Number(current_stock))) {
    return res.status(400).json({
      message: 'current_stock is required and must be a number.',
    })
  }

  try {
    const [inventory] = await Query(`SELECT i_current_stock FROM inventory WHERE i_id = ?`, [id])

    if (!inventory) {
      return res.status(404).json({
        message: 'Inventory record not found.',
      })
    }

    const previousStock = inventory.i_current_stock
    const newStock = Number(current_stock)

    let status = 'ADJUSTMENT'
    if (previousStock === 0 && newStock === 0) status = 'NEW'
    else if (newStock > previousStock) status = 'REPLENISHMENT'
    else if (newStock < previousStock) status = 'SOLD'

    await Query(
      `UPDATE inventory
       SET i_previous_stock = ?, i_current_stock = ?
       WHERE i_id = ?`,
      [previousStock, newStock, id],
    )

    await Query(
      `INSERT INTO inventory_history
        (ih_inventory_id, ih_date, ih_stock_before, ih_stock_after, ih_status)
       VALUES (?, NOW(), ?, ?, ?)`,
      [id, previousStock, newStock, status],
    )

    res.status(200).json({
      message: 'Inventory updated and history logged successfully.',
      data: {
        inventory_id: id,
        stock_before: previousStock,
        stock_after: newStock,
        status,
      },
    })
  } catch (error) {
    console.error('Error updating inventory:', error)
    res.status(500).json({
      message: 'Error updating inventory.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    })
  }
}

module.exports = {
  getInventory,
  getAllInventoryHistory,
  getInventoryHistory,
  addInventory,
  updateInventory,
}
