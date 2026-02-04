'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('product', {
      p_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
        unique: true,
      },
      p_name: {
        type: Sequelize.STRING(300),
        allowNull: false,
      },
      p_category_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'product_category',
          key: 'pc_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
        allowNull: false,
      },
      p_price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      p_cost: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      p_status: {
        type: Sequelize.ENUM('AVAILABLE', 'UNAVAILABLE', 'DELETED'),
        defaultValue: 'AVAILABLE',
        allowNull: false,
      },
      p_createddate: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('product')
  },
}
