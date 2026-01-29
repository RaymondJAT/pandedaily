require('dotenv').config()

module.exports = {
  development: {
    username: process.env._USER_ADMIN,
    password: process.env._PASSWORD_ADMIN,
    database: process.env._DATABASE_ADMIN,
    host: process.env._HOST_ADMIN,
    dialect: 'mysql',
    dialectOptions: { multipleStatements: true },
  },
  test: {
    username: process.env._USER_ADMIN,
    password: process.env._PASSWORD_ADMIN,
    database: process.env._DATABASE_ADMIN,
    host: process.env._HOST_ADMIN,
    dialect: 'mysql',
    dialectOptions: { multipleStatements: true },
  },
  production: {
    username: process.env._USER_ADMIN,
    password: process.env._PASSWORD_ADMIN,
    database: process.env._DATABASE_ADMIN,
    host: process.env._HOST_ADMIN,
    dialect: 'mysql',
    dialectOptions: { multipleStatements: true },
  },
}
