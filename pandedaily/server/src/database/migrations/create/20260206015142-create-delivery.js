'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('delivery', {
      d_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      d_order_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'orders',
          key: 'or_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
        allowNull: false,
      },
      d_rider_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'rider',
          key: 'r_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
        allowNull: false,
      },
      d_date: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      d_status: {
        type: Sequelize.ENUM('PENDING', 'FOR-PICKUP', 'ON-DELIVERY', 'COMPLETED'),
        allowNull: false,
      },
    })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('delivery')
  },
}
