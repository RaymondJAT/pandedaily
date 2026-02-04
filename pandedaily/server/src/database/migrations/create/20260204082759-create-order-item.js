'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('order_item', {
      oi_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
        unique: true,
      },
      oi_order_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'orders',
          key: 'or_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
        allowNull: false,
      },
      oi_product_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'product',
          key: 'p_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
        allowNull: false,
      },
      oi_quantity: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      oi_price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
    })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('order_item')
  },
}
