const Order = {
 	orders: {
  tablename: "orders",
  prefix: "or",
  prefix_: "or_",
  insertColumns: [
      "customer_id",
      "total",
      "payment_type",
      "payment_reference",
      "details"
    ],
  selectColumns: [
      "or_id",
      "or_date",
      "or_customer_id",
      "or_total",
      "or_payment_type",
      "or_payment_reference",
      "or_details",
      "or_status"
    ],
  selectOptionColumns: {
    id: "or_id",
    date: "or_date",
    customer_id: "or_customer_id",
    total: "or_total",
    payment_type: "or_payment_type",
    payment_reference: "or_payment_reference",
    details: "or_details",
    status: "or_status"
  },
  updateOptionColumns: {
    id: "id",
    date: "date",
    customer_id: "customer_id",
    total: "total",
    payment_type: "payment_type",
    payment_reference: "payment_reference",
    details: "details",
    status: "status"
  },
  selectDateFormatColumns: {
    date: "REPLACE(REPLACE(or_date, 'T', ' '), 'Z', '') AS or_date"
  },
  selectMiscColumns: {

  },
  columnDataTypes: {
    id: "INTEGER",
    date: "DATE",
    customer_id: "INTEGER",
    total: "DECIMAL",
    payment_type: "STRING",
    payment_reference: "TEXT",
    details: "TEXT",
    status: "ENUM"
  }
},
 	order_item: {
  tablename: "order_item",
  prefix: "oi",
  prefix_: "oi_",
  insertColumns: [
      "order_id",
      "product_id",
      "quantity",
      "price"
    ],
  selectColumns: [
      "oi_id",
      "oi_order_id",
      "oi_product_id",
      "oi_quantity",
      "oi_price"
    ],
  selectOptionColumns: {
    id: "oi_id",
    order_id: "oi_order_id",
    product_id: "oi_product_id",
    quantity: "oi_quantity",
    price: "oi_price"
  },
  updateOptionColumns: {
    id: "id",
    order_id: "order_id",
    product_id: "product_id",
    quantity: "quantity",
    price: "price"
  },
  selectDateFormatColumns: {

  },
  selectMiscColumns: {

  },
  columnDataTypes: {
    id: "INTEGER",
    order_id: "INTEGER",
    product_id: "INTEGER",
    quantity: "DECIMAL",
    price: "DECIMAL"
  }
},
};

exports.Order = Order;