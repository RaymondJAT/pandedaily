const Rider = {
 	rider: {
  tablename: "rider",
  prefix: "r",
  prefix_: "r_",
  insertColumns: [
      "fullname",
      "username",
      "password"
    ],
  selectColumns: [
      "r_id",
      "r_fullname",
      "r_username",
      "r_password",
      "r_status"
    ],
  selectOptionColumns: {
    id: "r_id",
    fullname: "r_fullname",
    username: "r_username",
    password: "r_password",
    status: "r_status"
  },
  updateOptionColumns: {
    id: "id",
    fullname: "fullname",
    username: "username",
    password: "password",
    status: "status"
  },
  selectDateFormatColumns: {

  },
  selectMiscColumns: {

  },
  columnDataTypes: {
    id: "INTEGER",
    fullname: "STRING",
    username: "STRING",
    password: "TEXT",
    status: "ENUM"
  }
},
 	rider_activity: {
  tablename: "rider_activity",
  prefix: "ra",
  prefix_: "ra_",
  insertColumns: [
      "rider_id",
      "delivery_id",
      "status"
    ],
  selectColumns: [
      "ra_id",
      "ra_rider_id",
      "ra_delivery_id",
      "ra_status",
      "ra_date"
    ],
  selectOptionColumns: {
    id: "ra_id",
    rider_id: "ra_rider_id",
    delivery_id: "ra_delivery_id",
    status: "ra_status",
    date: "ra_date"
  },
  updateOptionColumns: {
    id: "id",
    rider_id: "rider_id",
    delivery_id: "delivery_id",
    status: "status",
    date: "date"
  },
  selectDateFormatColumns: {
    date: "REPLACE(REPLACE(ra_date, 'T', ' '), 'Z', '') AS ra_date"
  },
  selectMiscColumns: {

  },
  columnDataTypes: {
    id: "INTEGER",
    rider_id: "INTEGER",
    delivery_id: "INTEGER",
    status: "ENUM",
    date: "DATE"
  }
},
};

exports.Rider = Rider;