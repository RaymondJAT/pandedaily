const { Delivery } = require('../database/model/Delivery')
const { Query } = require('../database/utility/queries.util')

// GET ALL
const getDelivery = async (req, res) => {
  const { access_id } = req.context

  try {
    if (access_id !== 1) {
      return res.status(403).json({
        message: 'You are not allowed to access delivery data.',
      })
    }

    const statement = `
      SELECT *
      FROM delivery
      WHERE d_status != 'delete'
    `

    const data = await Query(statement, [], Delivery.delivery.prefix_)

    if (!data.length) {
      return res.status(404).json({ message: 'No deliveries found.' })
    }

    res.status(200).json({
      message: 'Deliveries retrieved successfully.',
      count: data.length,
      data,
    })
  } catch (error) {
    console.error('Error retrieving deliveries:', error)
    res.status(500).json({ message: 'Error retrieving deliveries.' })
  }
}

// GET BY ID
const getDeliveryById = async (req, res) => {
  const { id } = req.params
  const { access_id } = req.context

  try {
    if (access_id !== 1) {
      return res.status(403).json({
        message: 'You are not allowed to access delivery data.',
      })
    }

    const statement = `
      SELECT *
      FROM delivery
      WHERE d_id = ?
      AND d_status != 'delete'
    `

    const data = await Query(statement, [id], Delivery.delivery.prefix_)

    if (!data.length) {
      return res.status(404).json({ message: 'No delivery found.' })
    }

    res.status(200).json({
      message: 'Delivery retrieved successfully.',
      count: data.length,
      data,
    })
  } catch (error) {
    console.error('Error retrieving delivery:', error)
    res.status(500).json({ message: 'Error retrieving delivery.' })
  }
}

// CREATE
const addDelivery = async (req, res) => {
  const { order_id, rider_id, date, status } = req.body

  if (!order_id || !rider_id || !date || !status) {
    return res.status(400).json({ message: 'Delivery data is required.' })
  }

  try {
    const statement = `
      INSERT INTO delivery
      (d_order_id, d_rider_id, d_date, d_status)
      VALUES (?, ?, ?, ?)
    `

    await Query(statement, [order_id, rider_id, date, status])

    res.status(200).json({
      message: 'Delivery created successfully.',
    })
  } catch (error) {
    console.error('Delivery transaction failed:', error)
    res.status(500).json({ message: 'Failed to create delivery.' })
  }
}

// UPDATE
const updateDelivery = async (req, res) => {
  const { id } = req.params
  const { order_id, rider_id, date, status } = req.body

  if (!order_id || !rider_id || !date || !status) {
    return res.status(400).json({ message: 'Delivery data is required.' })
  }

  try {
    await Query(
      `
      UPDATE delivery
      SET d_order_id = ?, d_rider_id = ?, d_date = ?, d_status = ?
      WHERE d_id = ?
      `,
      [order_id, rider_id, date, status, id],
    )

    await Query(
      `
      INSERT INTO delivery_activity
      (da_delivery_id, da_status, da_created_at)
      VALUES (?, ?, NOW())
      `,
      [id, status],
    )

    res.status(200).json({
      message: 'Delivery updated successfully.',
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Failed to update delivery.' })
  }
}

module.exports = {
  getDelivery,
  getDeliveryById,
  addDelivery,
  updateDelivery,
}
