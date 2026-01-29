const { Master } = require('../database/model/Master')
const { SQLQueryBuilder } = require('../utils/helper.util')
const { Query, Insert, Update, Transaction } = require('../database/utility/queries.util')
const dictionary = require('../utils/dictionary.util')

const SQL = new SQLQueryBuilder()

// READ
const getAccess = async (req, res) => {
  try {
    const statement = `SELECT * FROM master_access`

    const data = await Query(statement, [], Master.master_access.prefix_)
    res.status(200).json({ message: 'Access data retrieved.', data })
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving user data.' })
  }
}

module.exports = {
  getAccess,
}
