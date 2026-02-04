'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('inventory', {
      i_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      i_product_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'product',
          key: 'p_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
        allowNull: false,
      },
      i_current_stock: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      i_previous_stock: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      i_createddate: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('inventory')
  },
}
