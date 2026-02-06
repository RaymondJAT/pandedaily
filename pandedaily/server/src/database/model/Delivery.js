const Delivery = {
 	delivery: {
  tablename: "delivery",
  prefix: "d",
  prefix_: "d_",
  insertColumns: [
      "order_id",
      "rider_id",
      "status"
    ],
  selectColumns: [
      "d_id",
      "d_order_id",
      "d_rider_id",
      "d_date",
      "d_status"
    ],
  selectOptionColumns: {
    id: "d_id",
    order_id: "d_order_id",
    rider_id: "d_rider_id",
    date: "d_date",
    status: "d_status"
  },
  updateOptionColumns: {
    id: "id",
    order_id: "order_id",
    rider_id: "rider_id",
    date: "date",
    status: "status"
  },
  selectDateFormatColumns: {
    date: "REPLACE(REPLACE(d_date, 'T', ' '), 'Z', '') AS d_date"
  },
  selectMiscColumns: {

  },
  columnDataTypes: {
    id: "INTEGER",
    order_id: "INTEGER",
    rider_id: "INTEGER",
    date: "DATE",
    status: "ENUM"
  }
},
 	delivery_activity: {
  tablename: "delivery_activity",
  prefix: "da",
  prefix_: "da_",
  insertColumns: [
      "delivery_id",
      "status",
      "remarks"
    ],
  selectColumns: [
      "da_id",
      "da_delivery_id",
      "da_status",
      "da_remarks",
      "da_createddate"
    ],
  selectOptionColumns: {
    id: "da_id",
    delivery_id: "da_delivery_id",
    status: "da_status",
    remarks: "da_remarks",
    createddate: "da_createddate"
  },
  updateOptionColumns: {
    id: "id",
    delivery_id: "delivery_id",
    status: "status",
    remarks: "remarks",
    createddate: "createddate"
  },
  selectDateFormatColumns: {
    createddate: "REPLACE(REPLACE(da_createddate, 'T', ' '), 'Z', '') AS da_createddate"
  },
  selectMiscColumns: {

  },
  columnDataTypes: {
    id: "INTEGER",
    delivery_id: "INTEGER",
    status: "ENUM",
    remarks: "TEXT",
    createddate: "DATE"
  }
},
 	delivery_image: {
  tablename: "delivery_image",
  prefix: "di",
  prefix_: "di_",
  insertColumns: [
      "delivery_activity_id",
      "type",
      "image"
    ],
  selectColumns: [
      "di_id",
      "di_delivery_activity_id",
      "di_type",
      "di_image",
      "di_createddate"
    ],
  selectOptionColumns: {
    id: "di_id",
    delivery_activity_id: "di_delivery_activity_id",
    type: "di_type",
    image: "di_image",
    createddate: "di_createddate"
  },
  updateOptionColumns: {
    id: "id",
    delivery_activity_id: "delivery_activity_id",
    type: "type",
    image: "image",
    createddate: "createddate"
  },
  selectDateFormatColumns: {
    createddate: "REPLACE(REPLACE(di_createddate, 'T', ' '), 'Z', '') AS di_createddate"
  },
  selectMiscColumns: {

  },
  columnDataTypes: {
    id: "INTEGER",
    delivery_activity_id: "INTEGER",
    type: "ENUM",
    image: "TEXT",
    createddate: "DATE"
  }
},
};

exports.Delivery = Delivery;