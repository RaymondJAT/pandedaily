'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('delivery_schedule', {
      ds_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      ds_order_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'orders',
          key: 'or_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
        allowNull: false,
      },
      ds_name: {
        type: Sequelize.STRING(300),
        allowNull: false,
      },
      ds_date: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      ds_start_time: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      ds_end_time: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      ds_cutoff: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      ds_status: {
        type: Sequelize.ENUM('PENDING', 'FOR-PICK-UP', 'OUT-FOR-DELIVERY', 'COMPLETE'),
        allowNull: false,
      },
      ds_createddate: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('delivery_schedule')
  },
}
