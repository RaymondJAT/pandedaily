const { Customer } = require('../database/model/Customer')
const { Query } = require('../database/utility/queries.util')

// READ
const getCustomer = async (req, res_) => {
  try {
    const statement = `SELECT * FROM customer`

    const data = await Query(statement, [], Customer.customer.prefix_)
    res_.status(200).json({ message: 'Customer data retrieved.', data })
  } catch (error) {
    res_.status(500).json({ message: 'Error retrieving customer data.' })
  }
}

module.exports = {
  getCustomer,
}
