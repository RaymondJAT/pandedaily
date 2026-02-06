'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('cart_item', {
      ci_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
        unique: true,
      },
      ci_customer_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'customer',
          key: 'c_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
        allowNull: false,
      },
      ci_product_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'product',
          key: 'p_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
        allowNull: false,
      },
      ci_quantity: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      ci_price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
    })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('cart_item')
  },
}
