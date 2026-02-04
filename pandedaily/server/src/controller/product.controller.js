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
    const statement = `SELECT p_id AS id, p_name AS name, pc_name AS category_name, p_price AS price, p_cost AS cost, p_status AS status, pi_image AS image 
    FROM product 
    INNER JOIN product_category ON product.p_category_id = product_category.pc_id
    LEFT JOIN product_image ON product.p_id = product_image.pi_product_id`

    const data = await Query(statement, [], Product.product.prefix_)
    res.status(200).json({ message: 'Product data retrieved.', data })
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving product data.' })
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
  const { name, category_id, price, cost, status = 1, image } = req.body

  try {
    const productResult = await Query(
      `INSERT INTO product(p_name, p_category_id, p_price, p_cost, p_status) VALUES(?, ?, ?, ?, ?)`,
      [name, category_id, price, cost, status],
    )
    const productId = productResult.insertId

    await Query(`INSERT INTO product_image(pi_product_id, pi_image) VALUES(?, ?)`, [
      productId,
      image,
    ])

    const inventoryResult = await Query(
      `INSERT INTO inventory(i_product_id, i_current_stock, i_previous_stock) VALUES(?, 0, 0)`,
      [productId],
    )
    const inventoryId = inventoryResult.insertId

    await Query(
      `INSERT INTO inventory_history(ih_inventory_id, ih_date, ih_stock_before, ih_stock_after, ih_status)
       VALUES(?, NOW(), 0, 0, 'new')`,
      [inventoryId],
    )

    res.status(200).json({
      message: 'Product added successfully with inventory and initial history.',
      productId,
      inventoryId,
    })
  } catch (error) {
    console.error('Error adding product:', error)
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Product with this name already exists.' })
    }
    res.status(500).json({ message: 'Error adding product data.' })
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

  if (![name, category_id, price, cost, status, image].some((v) => v !== undefined)) {
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
        const validStatuses = ['AVAILABLE', 'UNAVAILABLE', 'DELETED']
        value = value.toUpperCase()

        if (!validStatuses.includes(value)) {
          return res.status(400).json({
            message: 'Invalid status',
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
        updatedFields[field] = '[DECIMAL]'
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

    if (image !== undefined) {
      let result = await Query(`SELECT * FROM product_image WHERE pi_product_id = ?`, [id])

      if (result.length) {
        await Query(
          `UPDATE product_image
           SET pi_image = ?
           WHERE pi_product_id = ?`,
          [image, id],
        )
      } else {
        await Query(`INSERT INTO product_image(pi_product_id, pi_image) VALUES(?, ?)`, [id, image])
      }

      updatedFields.image = '[LONGTEXT]'
    }

    res.status(200).json({
      message: 'Product updated successfully.',
      updatedFields,
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
