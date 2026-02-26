const express = require('express')
const {
  getAccessRoutesWithPermissions,
  updateAccessRoutePermission,
  bulkUpdateAccessPermissions,
} = require('../controller/permission.controller')

const permissionRouter = express.Router()

// GET
permissionRouter.get('/access/:accessId/routes', getAccessRoutesWithPermissions)

// PUT
permissionRouter.put('/access/:accessId/routes/:routeId', updateAccessRoutePermission)

permissionRouter.put('/access/:accessId/permissions/bulk', bulkUpdateAccessPermissions)

module.exports = { permissionRouter }
