'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('customer', {
      c_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
        unique: true,
      },
      c_fullname: {
        type: Sequelize.STRING(300),
        allowNull: false,
      },
      c_email: {
        type: Sequelize.STRING(300),
        allowNull: false,
      },
      c_customer_type: {
        type: Sequelize.ENUM('REGISTERED', 'GUEST'),
        defaultValue: 'GUEST',
        allowNull: false,
      },
      c_address: {
        type: Sequelize.STRING(300),
        allowNull: false,
      },
      c_latitude: {
        type: Sequelize.DECIMAL(8, 5),
        allowNull: false,
      },
      c_longitude: {
        type: Sequelize.DECIMAL(8, 5),
        allowNull: false,
      },
      c_password: {
        type: Sequelize.TEXT('long'),
        allowNull: false,
      },
      c_createddate: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('customer')
  },
}
