const Customer = {
 	customer: {
  tablename: "customer",
  prefix: "c",
  prefix_: "c_",
  insertColumns: [
      "fullname",
      "contact",
      "email",
      "address",
      "latitude",
      "longitude",
      "username",
      "password"
    ],
  selectColumns: [
      "c_id",
      "c_fullname",
      "c_contact",
      "c_email",
      "c_address",
      "c_latitude",
      "c_longitude",
      "c_username",
      "c_password",
      "c_is_registered",
      "c_createddate"
    ],
  selectOptionColumns: {
    id: "c_id",
    fullname: "c_fullname",
    contact: "c_contact",
    email: "c_email",
    address: "c_address",
    latitude: "c_latitude",
    longitude: "c_longitude",
    username: "c_username",
    password: "c_password",
    is_registered: "c_is_registered",
    createddate: "c_createddate"
  },
  updateOptionColumns: {
    id: "id",
    fullname: "fullname",
    contact: "contact",
    email: "email",
    address: "address",
    latitude: "latitude",
    longitude: "longitude",
    username: "username",
    password: "password",
    is_registered: "is_registered",
    createddate: "createddate"
  },
  selectDateFormatColumns: {
    createddate: "REPLACE(REPLACE(c_createddate, 'T', ' '), 'Z', '') AS c_createddate"
  },
  selectMiscColumns: {

  },
  columnDataTypes: {
    id: "INTEGER",
    fullname: "STRING",
    contact: "STRING",
    email: "STRING",
    address: "STRING",
    latitude: "DECIMAL",
    longitude: "DECIMAL",
    username: "STRING",
    password: "TEXT",
    is_registered: "BOOLEAN",
    createddate: "DATE"
  }
},
};

exports.Customer = Customer;