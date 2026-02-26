const { Permission } = require('../database/model/Permission')
const { Query, Transaction } = require('../database/utility/queries.util')

// GET
const getAccessRoutesWithPermissions = async (req, res) => {
  const { accessId } = req.params

  if (!Number.isInteger(+accessId)) {
    return res.status(400).json({ message: 'Valid access ID is required.' })
  }

  try {
    const [access] = await Query(`SELECT ma_id FROM master_access WHERE ma_id = ?`, [accessId])
    if (!access) {
      return res.status(404).json({ message: 'Access level not found.' })
    }

    const statement = `
      SELECT 
        mr.mr_id as route_id,
        mr.mr_route_name as route_name,
        mr.mr_status as default_permission,
        COALESCE(p.pm_permission, mr.mr_status) as permission,
        CASE WHEN p.pm_permission IS NOT NULL THEN true ELSE false END as is_overridden
      FROM master_route mr
      LEFT JOIN permissions p 
        ON p.pm_route_id = mr.mr_id AND p.pm_access_id = ?
      ORDER BY mr.mr_route_name
    `

    const data = await Query(statement, [accessId])

    res.status(200).json({
      message: 'Routes with permissions retrieved successfully.',
      data,
    })
  } catch (error) {
    console.error('Error fetching routes with permissions:', error)
    res.status(500).json({
      message: 'Error fetching routes with permissions.',
    })
  }
}

// UPDATE
const updateAccessRoutePermission = async (req, res) => {
  const { accessId, routeId } = req.params
  const { status } = req.body

  if (!Number.isInteger(+accessId) || !Number.isInteger(+routeId)) {
    return res.status(400).json({ message: 'Valid access ID and route ID are required.' })
  }

  // Validate permission
  const validPermissions = ['FULL', 'NO-ACCESS']
  const permissionValue = status?.toUpperCase()

  if (!validPermissions.includes(permissionValue)) {
    return res.status(400).json({
      message: `Permission must be one of: ${validPermissions.join(', ')}`,
    })
  }

  try {
    // Check if access exists
    const [access] = await Query(`SELECT ma_id FROM master_access WHERE ma_id = ?`, [accessId])
    if (!access) {
      return res.status(404).json({ message: 'Access level not found.' })
    }

    // Check if route exists
    const [route] = await Query(`SELECT mr_id FROM master_route WHERE mr_id = ?`, [routeId])
    if (!route) {
      return res.status(404).json({ message: 'Route not found.' })
    }

    // Insert or update permission - REMOVED the third parameter
    const statement = `
      INSERT INTO permissions (pm_access_id, pm_route_id, pm_permission)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE pm_permission = VALUES(pm_permission)
    `

    const data = await Query(statement, [accessId, routeId, permissionValue])

    res.status(200).json({
      message: 'Route permission updated successfully.',
      data: {
        access_id: accessId,
        route_id: routeId,
        permission: permissionValue,
        ...data,
      },
    })
  } catch (error) {
    console.error('Error updating route permission:', error)

    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        message: 'Permission entry already exists.',
      })
    }

    res.status(500).json({
      message: 'Error updating route permission.',
    })
  }
}

const bulkUpdateAccessPermissions = async (req, res) => {
  const { accessId } = req.params
  const { permissions } = req.body

  if (!Number.isInteger(+accessId)) {
    return res.status(400).json({ message: 'Valid access ID is required.' })
  }

  if (!Array.isArray(permissions) || permissions.length === 0) {
    return res.status(400).json({ message: 'Permissions array is required.' })
  }

  // Validate all permissions
  const validPermissions = ['FULL', 'NO-ACCESS']
  for (const perm of permissions) {
    if (!Number.isInteger(+perm.routeId)) {
      return res.status(400).json({ message: 'Invalid route ID in permissions.' })
    }
    if (!validPermissions.includes(perm.permission?.toUpperCase())) {
      return res.status(400).json({
        message: `Permission must be one of: ${validPermissions.join(', ')}`,
      })
    }
  }

  try {
    // Check if access exists
    const [access] = await Query(`SELECT ma_id FROM master_access WHERE ma_id = ?`, [accessId])
    if (!access) {
      return res.status(404).json({ message: 'Access level not found.' })
    }

    // Build bulk queries
    const bulkQueries = []

    for (const perm of permissions) {
      bulkQueries.push({
        sql: `
          INSERT INTO permissions (pm_access_id, pm_route_id, pm_permission)
          VALUES (?, ?, ?)
          ON DUPLICATE KEY UPDATE pm_permission = VALUES(pm_permission)
        `,
        values: [accessId, perm.routeId, perm.permission.toUpperCase()],
      })
    }

    // Execute transaction for all queries
    if (bulkQueries.length > 0) {
      await Transaction(bulkQueries)
    }

    res.status(200).json({
      message: 'Bulk permissions updated successfully.',
      data: { updatedCount: permissions.length },
    })
  } catch (error) {
    console.error('Error bulk updating permissions:', error)
    res.status(500).json({
      message: 'Error bulk updating permissions.',
    })
  }
}

module.exports = {
  getAccessRoutesWithPermissions,
  updateAccessRoutePermission,
  bulkUpdateAccessPermissions,
}
