const Permission = {
 	permissions: {
  tablename: "permissions",
  prefix: "pm",
  prefix_: "pm_",
  insertColumns: [
      "access_id",
      "route_id"
    ],
  selectColumns: [
      "pm_id",
      "pm_access_id",
      "pm_route_id",
      "pm_permission",
      "pm_createddate"
    ],
  selectOptionColumns: {
    id: "pm_id",
    access_id: "pm_access_id",
    route_id: "pm_route_id",
    permission: "pm_permission",
    createddate: "pm_createddate"
  },
  updateOptionColumns: {
    id: "id",
    access_id: "access_id",
    route_id: "route_id",
    permission: "permission",
    createddate: "createddate"
  },
  selectDateFormatColumns: {
    createddate: "REPLACE(REPLACE(pm_createddate, 'T', ' '), 'Z', '') AS pm_createddate"
  },
  selectMiscColumns: {

  },
  columnDataTypes: {
    id: "INTEGER",
    access_id: "INTEGER",
    route_id: "INTEGER",
    permission: "ENUM",
    createddate: "DATE"
  }
},
};

exports.Permission = Permission;