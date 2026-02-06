const { Rider } = require('../database/model/Rider')
const { Query } = require('../database/utility/queries.util')

// GET ALL
const getRiders = async (req, res) => {
  const { access_id } = req.context

  try {
    if (access_id !== 1) {
      return res.status(403).json({
        message: 'You are not allowed to access rider data.',
      })
    }

    const statement = `
      SELECT *
      FROM rider
      WHERE r_status != 'delete'
    `

    const data = await Query(statement, [], Rider.rider.prefix_)

    if (!data.length) {
      return res.status(404).json({ message: 'No riders found.' })
    }

    res.status(200).json({
      message: 'Riders retrieved successfully.',
      count: data.length,
      data,
    })
  } catch (error) {
    console.error('Error retrieving riders:', error)
    res.status(500).json({ message: 'Error retrieving riders.' })
  }
}

module.exports = {
  getRiders,
}
