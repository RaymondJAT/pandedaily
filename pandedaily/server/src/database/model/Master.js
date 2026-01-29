const Master = {
 	master_access: {
  tablename: "master_access",
  prefix: "ma",
  prefix_: "ma_",
  insertColumns: [
      "name"
    ],
  selectColumns: [
      "ma_id",
      "ma_name",
      "ma_status",
      "ma_createddate"
    ],
  selectOptionColumns: {
    id: "ma_id",
    name: "ma_name",
    status: "ma_status",
    createddate: "ma_createddate"
  },
  updateOptionColumns: {
    id: "id",
    name: "name",
    status: "status",
    createddate: "createddate"
  },
  selectDateFormatColumns: {
    createddate: "REPLACE(REPLACE(ma_createddate, 'T', ' '), 'Z', '') AS ma_createddate"
  },
  selectMiscColumns: {

  },
  columnDataTypes: {
    id: "INTEGER",
    name: "STRING",
    status: "ENUM",
    createddate: "DATE"
  }
},
 	master_route: {
  tablename: "master_route",
  prefix: "mr",
  prefix_: "mr_",
  insertColumns: [
      "access_id",
      "route_name"
    ],
  selectColumns: [
      "mr_id",
      "mr_access_id",
      "mr_route_name",
      "mr_status",
      "mr_createddate"
    ],
  selectOptionColumns: {
    id: "mr_id",
    access_id: "mr_access_id",
    route_name: "mr_route_name",
    status: "mr_status",
    createddate: "mr_createddate"
  },
  updateOptionColumns: {
    id: "id",
    access_id: "access_id",
    route_name: "route_name",
    status: "status",
    createddate: "createddate"
  },
  selectDateFormatColumns: {
    createddate: "REPLACE(REPLACE(mr_createddate, 'T', ' '), 'Z', '') AS mr_createddate"
  },
  selectMiscColumns: {

  },
  columnDataTypes: {
    id: "INTEGER",
    access_id: "INTEGER",
    route_name: "STRING",
    status: "ENUM",
    createddate: "DATE"
  }
},
 	master_user: {
  tablename: "master_user",
  prefix: "mu",
  prefix_: "mu_",
  insertColumns: [
      "fullname",
      "access_id",
      "email",
      "username",
      "password"
    ],
  selectColumns: [
      "mu_id",
      "mu_fullname",
      "mu_access_id",
      "mu_email",
      "mu_username",
      "mu_password",
      "mu_status",
      "mu_createddate"
    ],
  selectOptionColumns: {
    id: "mu_id",
    fullname: "mu_fullname",
    access_id: "mu_access_id",
    email: "mu_email",
    username: "mu_username",
    password: "mu_password",
    status: "mu_status",
    createddate: "mu_createddate"
  },
  updateOptionColumns: {
    id: "id",
    fullname: "fullname",
    access_id: "access_id",
    email: "email",
    username: "username",
    password: "password",
    status: "status",
    createddate: "createddate"
  },
  selectDateFormatColumns: {
    createddate: "REPLACE(REPLACE(mu_createddate, 'T', ' '), 'Z', '') AS mu_createddate"
  },
  selectMiscColumns: {

  },
  columnDataTypes: {
    id: "INTEGER",
    fullname: "STRING",
    access_id: "INTEGER",
    email: "STRING",
    username: "STRING",
    password: "TEXT",
    status: "ENUM",
    createddate: "DATE"
  }
},
};

exports.Master = Master;