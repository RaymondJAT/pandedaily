'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('inventory_history', {
      ih_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      ih_inventory_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'inventory',
          key: 'i_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
        allowNull: false,
      },
      ih_date: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      ih_stock_before: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      ih_stock_after: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      ih_status: {
        type: Sequelize.ENUM('NEW', 'REPLENISHMENT', 'ADJUSTMENT', 'SOLD'),
        defaultValue: 'NEW',
        allowNull: false,
      },
    })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('inventory_history')
  },
}
