const Product = {
 	product_category: {
  tablename: "product_category",
  prefix: "pc",
  prefix_: "pc_",
  insertColumns: [
      "name"
    ],
  selectColumns: [
      "pc_id",
      "pc_name",
      "pc_status",
      "pc_createddate"
    ],
  selectOptionColumns: {
    id: "pc_id",
    name: "pc_name",
    status: "pc_status",
    createddate: "pc_createddate"
  },
  updateOptionColumns: {
    id: "id",
    name: "name",
    status: "status",
    createddate: "createddate"
  },
  selectDateFormatColumns: {
    createddate: "REPLACE(REPLACE(pc_createddate, 'T', ' '), 'Z', '') AS pc_createddate"
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
 	product: {
  tablename: "product",
  prefix: "p",
  prefix_: "p_",
  insertColumns: [
      "name",
      "category_id",
      "price",
      "cost"
    ],
  selectColumns: [
      "p_id",
      "p_name",
      "p_category_id",
      "p_price",
      "p_cost",
      "p_status",
      "p_createddate"
    ],
  selectOptionColumns: {
    id: "p_id",
    name: "p_name",
    category_id: "p_category_id",
    price: "p_price",
    cost: "p_cost",
    status: "p_status",
    createddate: "p_createddate"
  },
  updateOptionColumns: {
    id: "id",
    name: "name",
    category_id: "category_id",
    price: "price",
    cost: "cost",
    status: "status",
    createddate: "createddate"
  },
  selectDateFormatColumns: {
    createddate: "REPLACE(REPLACE(p_createddate, 'T', ' '), 'Z', '') AS p_createddate"
  },
  selectMiscColumns: {

  },
  columnDataTypes: {
    id: "INTEGER",
    name: "STRING",
    category_id: "INTEGER",
    price: "DECIMAL",
    cost: "DECIMAL",
    status: "ENUM",
    createddate: "DATE"
  }
},
 	product_image: {
  tablename: "product_image",
  prefix: "pi",
  prefix_: "pi_",
  insertColumns: [
      "product_id",
      "image"
    ],
  selectColumns: [
      "pi_id",
      "pi_product_id",
      "pi_image",
      "pi_createddate"
    ],
  selectOptionColumns: {
    id: "pi_id",
    product_id: "pi_product_id",
    image: "pi_image",
    createddate: "pi_createddate"
  },
  updateOptionColumns: {
    id: "id",
    product_id: "product_id",
    image: "image",
    createddate: "createddate"
  },
  selectDateFormatColumns: {
    createddate: "REPLACE(REPLACE(pi_createddate, 'T', ' '), 'Z', '') AS pi_createddate"
  },
  selectMiscColumns: {

  },
  columnDataTypes: {
    id: "INTEGER",
    product_id: "INTEGER",
    image: "TEXT",
    createddate: "DATE"
  }
},
};

exports.Product = Product;