'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('rider', {
      r_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      r_fullname: {
        type: Sequelize.STRING(300),
        allowNull: false,
      },
      r_username: {
        type: Sequelize.STRING(300),
        allowNull: false,
        unique: true,
      },
      r_password: {
        type: Sequelize.TEXT('long'),
        allowNull: false,
      },
      r_status: {
        type: Sequelize.ENUM('ACTIVE', 'INACTIVE', 'DELETED'),
        defaultValue: 'ACTIVE',
        allowNull: false,
      },
    })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('rider')
  },
}
