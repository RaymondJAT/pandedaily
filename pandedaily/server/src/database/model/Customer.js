const Customer = {
 	customer: {
  tablename: "customer",
  prefix: "c",
  prefix_: "c_",
  insertColumns: [
      "fullname",
      "email",
      "address",
      "latitude",
      "longitude",
      "password"
    ],
  selectColumns: [
      "c_id",
      "c_fullname",
      "c_email",
      "c_customer_type",
      "c_address",
      "c_latitude",
      "c_longitude",
      "c_password",
      "c_createddate"
    ],
  selectOptionColumns: {
    id: "c_id",
    fullname: "c_fullname",
    email: "c_email",
    customer_type: "c_customer_type",
    address: "c_address",
    latitude: "c_latitude",
    longitude: "c_longitude",
    password: "c_password",
    createddate: "c_createddate"
  },
  updateOptionColumns: {
    id: "id",
    fullname: "fullname",
    email: "email",
    customer_type: "customer_type",
    address: "address",
    latitude: "latitude",
    longitude: "longitude",
    password: "password",
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
    email: "STRING",
    customer_type: "ENUM",
    address: "STRING",
    latitude: "DECIMAL",
    longitude: "DECIMAL",
    password: "TEXT",
    createddate: "DATE"
  }
},
};

exports.Customer = Customer;