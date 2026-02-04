const Inventory = {
 	inventory: {
  tablename: "inventory",
  prefix: "i",
  prefix_: "i_",
  insertColumns: [
      "product_id",
      "current_stock",
      "previous_stock"
    ],
  selectColumns: [
      "i_id",
      "i_product_id",
      "i_current_stock",
      "i_previous_stock",
      "i_createddate"
    ],
  selectOptionColumns: {
    id: "i_id",
    product_id: "i_product_id",
    current_stock: "i_current_stock",
    previous_stock: "i_previous_stock",
    createddate: "i_createddate"
  },
  updateOptionColumns: {
    id: "id",
    product_id: "product_id",
    current_stock: "current_stock",
    previous_stock: "previous_stock",
    createddate: "createddate"
  },
  selectDateFormatColumns: {
    createddate: "REPLACE(REPLACE(i_createddate, 'T', ' '), 'Z', '') AS i_createddate"
  },
  selectMiscColumns: {

  },
  columnDataTypes: {
    id: "INTEGER",
    product_id: "INTEGER",
    current_stock: "INTEGER",
    previous_stock: "INTEGER",
    createddate: "DATE"
  }
},
 	inventory_history: {
  tablename: "inventory_history",
  prefix: "ih",
  prefix_: "ih_",
  insertColumns: [
      "inventory_id",
      "stock_before",
      "stock_after"
    ],
  selectColumns: [
      "ih_id",
      "ih_inventory_id",
      "ih_date",
      "ih_stock_before",
      "ih_stock_after",
      "ih_status"
    ],
  selectOptionColumns: {
    id: "ih_id",
    inventory_id: "ih_inventory_id",
    date: "ih_date",
    stock_before: "ih_stock_before",
    stock_after: "ih_stock_after",
    status: "ih_status"
  },
  updateOptionColumns: {
    id: "id",
    inventory_id: "inventory_id",
    date: "date",
    stock_before: "stock_before",
    stock_after: "stock_after",
    status: "status"
  },
  selectDateFormatColumns: {
    date: "REPLACE(REPLACE(ih_date, 'T', ' '), 'Z', '') AS ih_date"
  },
  selectMiscColumns: {

  },
  columnDataTypes: {
    id: "INTEGER",
    inventory_id: "INTEGER",
    date: "DATE",
    stock_before: "INTEGER",
    stock_after: "INTEGER",
    status: "ENUM"
  }
},
};

exports.Inventory = Inventory;