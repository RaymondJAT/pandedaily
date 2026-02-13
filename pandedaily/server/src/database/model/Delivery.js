const Delivery = {
 	delivery_schedule: {
  tablename: "delivery_schedule",
  prefix: "ds",
  prefix_: "ds_",
  insertColumns: [
      "order_id",
      "name",
      "start_time",
      "end_time",
      "cutoff",
      "status"
    ],
  selectColumns: [
      "ds_id",
      "ds_order_id",
      "ds_name",
      "ds_date",
      "ds_start_time",
      "ds_end_time",
      "ds_cutoff",
      "ds_status",
      "ds_createddate"
    ],
  selectOptionColumns: {
    id: "ds_id",
    order_id: "ds_order_id",
    name: "ds_name",
    date: "ds_date",
    start_time: "ds_start_time",
    end_time: "ds_end_time",
    cutoff: "ds_cutoff",
    status: "ds_status",
    createddate: "ds_createddate"
  },
  updateOptionColumns: {
    id: "id",
    order_id: "order_id",
    name: "name",
    date: "date",
    start_time: "start_time",
    end_time: "end_time",
    cutoff: "cutoff",
    status: "status",
    createddate: "createddate"
  },
  selectDateFormatColumns: {
    date: "REPLACE(REPLACE(ds_date, 'T', ' '), 'Z', '') AS ds_date",
    start_time: "REPLACE(REPLACE(ds_start_time, 'T', ' '), 'Z', '') AS ds_start_time",
    end_time: "REPLACE(REPLACE(ds_end_time, 'T', ' '), 'Z', '') AS ds_end_time",
    cutoff: "REPLACE(REPLACE(ds_cutoff, 'T', ' '), 'Z', '') AS ds_cutoff",
    createddate: "REPLACE(REPLACE(ds_createddate, 'T', ' '), 'Z', '') AS ds_createddate"
  },
  selectMiscColumns: {

  },
  columnDataTypes: {
    id: "INTEGER",
    order_id: "INTEGER",
    name: "STRING",
    date: "DATE",
    start_time: "DATE",
    end_time: "DATE",
    cutoff: "DATE",
    status: "ENUM",
    createddate: "DATE"
  }
},
 	delivery: {
  tablename: "delivery",
  prefix: "d",
  prefix_: "d_",
  insertColumns: [
      "delivery_schedule_id",
      "rider_id",
      "status"
    ],
  selectColumns: [
      "d_id",
      "d_delivery_schedule_id",
      "d_rider_id",
      "d_status",
      "d_createddate"
    ],
  selectOptionColumns: {
    id: "d_id",
    delivery_schedule_id: "d_delivery_schedule_id",
    rider_id: "d_rider_id",
    status: "d_status",
    createddate: "d_createddate"
  },
  updateOptionColumns: {
    id: "id",
    delivery_schedule_id: "delivery_schedule_id",
    rider_id: "rider_id",
    status: "status",
    createddate: "createddate"
  },
  selectDateFormatColumns: {
    createddate: "REPLACE(REPLACE(d_createddate, 'T', ' '), 'Z', '') AS d_createddate"
  },
  selectMiscColumns: {

  },
  columnDataTypes: {
    id: "INTEGER",
    delivery_schedule_id: "INTEGER",
    rider_id: "INTEGER",
    status: "ENUM",
    createddate: "DATE"
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