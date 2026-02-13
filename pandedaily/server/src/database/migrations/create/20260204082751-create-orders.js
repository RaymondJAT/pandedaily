'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('orders', {
      or_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
        unique: true,
      },
      or_customer_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'customer',
          key: 'c_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
        allowNull: false,
      },
      or_total: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      or_payment_type: {
        type: Sequelize.STRING(20),
        allowNull: false,
      },
      or_payment_reference: {
        type: Sequelize.TEXT('long'),
        allowNull: false,
      },
      or_details: {
        type: Sequelize.TEXT('long'),
        allowNull: false,
      },
      or_status: {
        type: Sequelize.ENUM('PAID', 'APPROVED', 'REJECTED', 'OUT-FOR-DELIVERY', 'COMPLETE'),
        defaultValue: 'PAID',
        allowNull: false,
      },
      or_createddate: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('orders')
  },
}
