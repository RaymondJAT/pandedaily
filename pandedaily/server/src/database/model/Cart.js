const Cart = {
 	cart_item: {
  tablename: "cart_item",
  prefix: "ci",
  prefix_: "ci_",
  insertColumns: [
      "customer_id",
      "product_id",
      "quantity",
      "price"
    ],
  selectColumns: [
      "ci_id",
      "ci_customer_id",
      "ci_product_id",
      "ci_quantity",
      "ci_price"
    ],
  selectOptionColumns: {
    id: "ci_id",
    customer_id: "ci_customer_id",
    product_id: "ci_product_id",
    quantity: "ci_quantity",
    price: "ci_price"
  },
  updateOptionColumns: {
    id: "id",
    customer_id: "customer_id",
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
    customer_id: "INTEGER",
    product_id: "INTEGER",
    quantity: "DECIMAL",
    price: "DECIMAL"
  }
},
};

exports.Cart = Cart;