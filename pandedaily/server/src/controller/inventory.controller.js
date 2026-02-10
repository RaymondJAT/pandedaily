const { Inventory } = require('../database/model/Inventory')
const { Query, Transaction } = require('../database/utility/queries.util')

// GET ALL
const getInventory = async (req, res) => {
  try {
    const statement = `
      SELECT 
        i.i_id AS id,
        p.p_id AS product_id,
        p.p_name AS product_name,
        pc.pc_name AS category_name,
        i.i_current_stock AS current_stock,
        i.i_previous_stock AS previous_stock,
        p.p_price AS price,
        p.p_cost AS cost,
        p.p_status AS status
      FROM inventory i
      INNER JOIN product p ON i.i_product_id = p.p_id
      LEFT JOIN product_category pc ON p.p_category_id = pc.pc_id
      WHERE p.p_status != 'deleted' -- Optional: exclude deleted products
      ORDER BY p.p_name ASC
    `

    const data = await Query(statement)
    res.status(200).json({
      message: 'Inventory data retrieved successfully.',
      count: data.length,
      data,
    })
  } catch (error) {
    console.error('Error retrieving inventory:', error)
    res.status(500).json({
      message: 'Error retrieving inventory data.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    })
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
// const addInventory = async (req, res) => {
//   const { product_id, current_stock, previous_stock } = req.body

//   try {
//     const statement = `INSERT INTO inventory(i_product_id, i_current_stock, i_previous_stock) VALUES(?, ?, ?)`
//     const data = await Query(statement, [product_id, current_stock, previous_stock])

//     res.status(200).json({
//       message: 'Inventory data added successfully.',
//       data,
//       insertedId: data.insertId,
//     })
//   } catch (error) {
//     console.error('Error adding inventory data:', error)
//     console.error('Error SQL:', error.sql)
//     console.error('Error parameters:', [product_id, current_stock, previous_stock])

//     if (error.code === 'ER_DUP_ENTRY') {
//       return res.status(409).json({ message: 'Inventory with this product_id already exists.' })
//     }

//     res.status(500).json({ message: 'Error adding inventory data.' })
//   }
// }

// UPDATE
const updateInventory = async (req, res) => {
  const { id } = req.params
  const { current_stock } = req.body

  console.log('updateInventory called with:', { id, current_stock })

  if (!id || isNaN(Number(id))) {
    return res.status(400).json({ message: 'Valid Inventory ID is required.' })
  }

  if (current_stock === undefined || isNaN(Number(current_stock))) {
    return res.status(400).json({ message: 'current_stock is required and must be a number.' })
  }

  const newStock = Number(current_stock)

  if (newStock < 0) {
    return res.status(400).json({ message: 'stock cannot be negative.' })
  }

  try {
    // First get the previous stock outside of transaction
    const inventoryRows = await Query(`SELECT i_current_stock FROM inventory WHERE i_id = ?`, [id])

    console.log('Inventory query result:', inventoryRows)

    if (!inventoryRows || inventoryRows.length === 0) {
      return res.status(404).json({ message: 'Inventory record not found.' })
    }

    const previousStock = inventoryRows[0].i_current_stock
    console.log('Previous stock:', previousStock, 'New stock:', newStock)

    // Convert to lowercase to match ENUM values
    let status = 'adjustment'
    if (previousStock === 0 && newStock === 0) status = 'new'
    else if (newStock > previousStock) status = 'replenishment'
    else if (newStock < previousStock) status = 'sold'

    console.log('Status:', status)

    // Prepare queries for transaction
    const queries = [
      {
        sql: `UPDATE inventory SET i_previous_stock = ?, i_current_stock = ? WHERE i_id = ?`,
        values: [previousStock, newStock, id],
      },
      {
        sql: `INSERT INTO inventory_history (ih_inventory_id, ih_date, ih_stock_before, ih_stock_after, ih_status) VALUES (?, NOW(), ?, ?, ?)`,
        values: [id, previousStock, newStock, status],
      },
    ]

    // Execute transaction
    await Transaction(queries)

    res.status(200).json({
      message: 'Inventory updated and history logged successfully.',
      data: {
        inventory_id: id,
        stock_before: previousStock,
        stock_after: newStock,
        status: status,
      },
    })
  } catch (error) {
    console.error('Error updating inventory:', error)
    console.error('Error stack:', error.stack)

    // Check for ENUM value error
    if (error.code === 'ER_DATA_TOO_LONG' || error.sqlMessage?.includes('ENUM')) {
      console.error('ENUM value error. Trying with uppercase...')
      try {
        // Try with uppercase status
        let statusUpper = 'ADJUSTMENT'
        if (previousStock === 0 && newStock === 0) statusUpper = 'NEW'
        else if (newStock > previousStock) statusUpper = 'REPLENISHMENT'
        else if (newStock < previousStock) statusUpper = 'SOLD'

        const retryQueries = [
          {
            sql: `INSERT INTO inventory_history (ih_inventory_id, ih_date, ih_stock_before, ih_stock_after, ih_status) VALUES (?, NOW(), ?, ?, ?)`,
            values: [id, previousStock, newStock, statusUpper],
          },
        ]

        await Transaction(retryQueries)

        return res.status(200).json({
          message: 'Inventory updated and history logged successfully.',
          data: {
            inventory_id: id,
            stock_before: previousStock,
            stock_after: newStock,
            status: statusUpper,
          },
        })
      } catch (retryError) {
        console.error('Retry also failed:', retryError)
      }
    }

    if (error.message === 'NOT_FOUND') {
      return res.status(404).json({ message: 'Inventory record not found.' })
    }

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
  // addInventory,
  updateInventory,
}
