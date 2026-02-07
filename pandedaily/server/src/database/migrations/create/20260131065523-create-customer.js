'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('customer', {
      c_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      c_fullname: {
        type: Sequelize.STRING(300),
        allowNull: false,
      },
      c_contact: {
        type: Sequelize.STRING(15),
        allowNull: false,
        unique: true,
      },
      c_email: {
        type: Sequelize.STRING(300),
        allowNull: false,
        unique: true,
      },
      c_address: {
        type: Sequelize.STRING(300),
        allowNull: false,
      },
      c_latitude: {
        type: Sequelize.DECIMAL(10, 8),
        allowNull: false,
      },
      c_longitude: {
        type: Sequelize.DECIMAL(10, 8),
        allowNull: false,
      },
      c_username: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true,
      },
      c_password: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      c_is_registered: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
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
