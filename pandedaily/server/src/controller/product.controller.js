const { Product } = require('../database/model/Product')
const { Query } = require('../database/utility/queries.util')

// GET ALL
const getProductCategory = async (req, res) => {
  try {
    const statement = `SELECT * FROM product_category`

    const data = await Query(statement, [], Product.product_category.prefix_)
    res.status(200).json({ message: 'Product category data retrieved.', data })
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving product category data.' })
  }
}

const getProduct = async (req, res) => {
  try {
    const statement = `SELECT 
      p.p_id AS id, 
      p.p_name AS name, 
      p.p_category_id AS category_id,  
      pc.pc_name AS category_name, 
      p.p_price AS price, 
      p.p_cost AS cost, 
      p.p_status AS status, 
      pi.pi_image AS image 
    FROM product p
    INNER JOIN product_category pc ON p.p_category_id = pc.pc_id
    LEFT JOIN product_image pi ON p.p_id = pi.pi_product_id`

    const data = await Query(statement, [], Product.product.prefix_)
    res.status(200).json({ message: 'Product data retrieved.', data })
  } catch (error) {
    console.error('Error retrieving product data:', error)
    res.status(500).json({
      message: 'Error retrieving product data.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    })
  }
}

// GET BY ID
const getProductById = async (req, res) => {
  const { id } = req.params

  try {
    const statement = `SELECT p_id AS id, p_name AS name, pc_name AS category_name, p_price AS price, p_cost AS cost, p_status AS status, pi_image AS image 
    FROM product
    INNER JOIN product_category ON product.p_category_id = product_category.pc_id
    LEFT JOIN product_image ON product.p_id = product_image.pi_product_id 
    WHERE p_id = ?`

    const data = await Query(statement, [id], Product.product.prefix_)

    res.status(200).json({ message: 'Product data retrieved.', data })
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving product data.' })
  }
}

// CREATE
const addProductCategory = async (req, res) => {
  const { name, status = 1 } = req.body

  try {
    const statement = `INSERT INTO product_category(pc_name, pc_status) VALUES(?, ?)`
    const data = await Query(statement, [name, status])
    res.status(200).json({
      message: 'Product category data added successfully.',
      data,
      insertedId: data.insertId,
    })
  } catch (error) {
    console.error('Error adding product category data:', error)
    console.error('Error SQL:', error.sql)
    console.error('Error parameters:', [name, status])

    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Product category with this name already exists.' })
    }

    res.status(500).json({ message: 'Error adding product category data.' })
  }
}

const addProduct = async (req, res) => {
  const { name, category_id, price, cost, status = 1, image, initial_stock = 0 } = req.body

  try {
    const productStatus = status === 1 || status === 'available' ? 'available' : 'unavailable'

    const productResult = await Query(
      `INSERT INTO product(p_name, p_category_id, p_price, p_cost, p_status) VALUES(?, ?, ?, ?, ?)`,
      [name, category_id, price, cost, productStatus],
    )
    const productId = productResult.insertId

    if (image && image.trim() !== '') {
      await Query(`INSERT INTO product_image(pi_product_id, pi_image) VALUES(?, ?)`, [
        productId,
        image,
      ])
    }

    const parsedStock = parseInt(initial_stock) || 0

    const inventoryResult = await Query(
      `INSERT INTO inventory(i_product_id, i_current_stock, i_previous_stock) VALUES(?, ?, 0)`,
      [productId, parsedStock],
    )
    const inventoryId = inventoryResult.insertId

    await Query(
      `INSERT INTO inventory_history(ih_inventory_id, ih_date, ih_stock_before, ih_stock_after, ih_status)
       VALUES(?, NOW(), 0, ?, 'new')`,
      [inventoryId, parsedStock],
    )

    res.status(200).json({
      message: 'Product added successfully with inventory and initial history.',
      productId,
      inventoryId,
      initial_stock: parsedStock,
    })
  } catch (error) {
    console.error('Error adding product:', error)
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Product with this name already exists.' })
    }

    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({
        message: 'Invalid category ID. Category does not exist.',
      })
    }

    res.status(500).json({
      message: 'Error adding product data.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    })
  }
}

// UPDATE
const updateProductCategory = async (req, res) => {
  const { id } = req.params
  const { name, status } = req.body

  if (!id) {
    return res.status(400).json({
      message: 'Product category ID is required.',
    })
  }

  if (![name, status].some((v) => v !== undefined)) {
    return res.status(400).json({
      message: 'At least one field (name or status) is required.',
    })
  }

  try {
    const exists = await Query(`SELECT pc_id FROM product_category WHERE pc_id = ?`, [id])

    if (!exists.length) {
      return res.status(404).json({
        message: 'Product category not found.',
      })
    }

    const updates = []
    const params = []
    const updatedFields = {}

    if (name !== undefined) {
      updates.push('pc_name = ?')
      params.push(name)
      updatedFields.name = 'pc_name'
    }

    if (status !== undefined) {
      updates.push('pc_status = ?')
      params.push(status)
      updatedFields.status = 'pc_status'
    }

    params.push(id)

    const statement = `
      UPDATE product_category
      SET ${updates.join(', ')}
      WHERE pc_id = ?
    `

    const data = await Query(statement, params)

    res.status(200).json({
      message: 'Product category updated successfully.',
      data,
      updatedFields,
    })
  } catch (error) {
    console.error('Error updating product category:', error)

    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        message: 'Product category with this name already exists.',
      })
    }

    res.status(500).json({
      message: 'Error updating product category.',
    })
  }
}

const updateProduct = async (req, res) => {
  const { id } = req.params
  const { name, category_id, price, cost, status, image } = req.body

  if (!id) {
    return res.status(400).json({ message: 'Product ID is required.' })
  }

  const hasProductUpdate = [name, category_id, price, cost, status].some((v) => v !== undefined)
  const hasImageUpdate = image !== undefined

  if (!hasProductUpdate && !hasImageUpdate) {
    return res.status(400).json({
      message: 'At least one field is required.',
    })
  }

  try {
    const productExists = await Query(`SELECT p_id FROM product WHERE p_id = ?`, [id])

    if (!productExists.length) {
      return res.status(404).json({ message: 'Product record not found.' })
    }

    const updates = []
    const params = []
    const updatedFields = {}

    const fieldMap = {
      name: 'p_name',
      category_id: 'p_category_id',
      price: 'p_price',
      cost: 'p_cost',
      status: 'p_status',
    }

    for (const [field, column] of Object.entries(fieldMap)) {
      if (req.body[field] === undefined) continue

      let value = req.body[field]

      if (field === 'status') {
        if (value === 1 || value === '1' || value === 'available') {
          value = 'available'
        } else if (value === 0 || value === '0' || value === 'unavailable') {
          value = 'unavailable'
        } else {
          value = value.toLowerCase()
        }

        // Validate status
        const validStatuses = ['available', 'unavailable']
        if (!validStatuses.includes(value)) {
          return res.status(400).json({
            message: 'Invalid status. Must be "available" or "unavailable".',
            validStatuses,
          })
        }
      }

      if (field === 'category_id') {
        const categoryExists = await Query(`SELECT pc_id FROM product_category WHERE pc_id = ?`, [
          value,
        ])
        if (!categoryExists.length) {
          return res.status(404).json({ message: 'Category record not found.' })
        }
      }

      if (field === 'price' || field === 'cost') {
        value = parseFloat(value)
        if (isNaN(value) || value < 0) {
          return res.status(400).json({
            message: `${field} must be a valid positive number.`,
          })
        }
        updatedFields[field] = value
      } else {
        updatedFields[field] = value
      }

      updates.push(`${column} = ?`)
      params.push(value)
    }

    if (updates.length) {
      params.push(id)
      await Query(`UPDATE product SET ${updates.join(', ')} WHERE p_id = ?`, params)
    }

    // Handle image
    if (image !== undefined) {
      if (!image || image.trim() === '') {
        await Query(`DELETE FROM product_image WHERE pi_product_id = ?`, [id])
        updatedFields.image = null
      } else {
        const existingImage = await Query(
          `SELECT pi_id FROM product_image WHERE pi_product_id = ?`,
          [id],
        )

        if (existingImage.length) {
          await Query(`UPDATE product_image SET pi_image = ? WHERE pi_product_id = ?`, [image, id])
        } else {
          await Query(`INSERT INTO product_image(pi_product_id, pi_image) VALUES(?, ?)`, [
            id,
            image,
          ])
        }
        updatedFields.image = '[LONGTEXT]'
      }
    }

    const [updatedProduct] = await Query(
      `SELECT 
        p.p_id as id,
        p.p_name as name,
        p.p_category_id as category_id,
        p.p_price as price,
        p.p_cost as cost,
        p.p_status as status,
        pc.pc_name as category_name
       FROM product p
       LEFT JOIN product_category pc ON p.p_category_id = pc.pc_id
       WHERE p.p_id = ?`,
      [id],
    )

    res.status(200).json({
      message: 'Product updated successfully.',
      updatedFields,
      product: updatedProduct,
    })
  } catch (error) {
    console.error('Error updating product:', error)

    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        message: 'Product with this name already exists.',
      })
    }

    res.status(500).json({
      message: 'Error updating product.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    })
  }
}

module.exports = {
  getProductCategory,
  getProduct,
  getProductById,
  addProductCategory,
  addProduct,
  updateProductCategory,
  updateProduct,
}
