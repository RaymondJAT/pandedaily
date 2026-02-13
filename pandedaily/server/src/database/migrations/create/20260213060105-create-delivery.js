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
      d_delivery_schedule_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'delivery_schedule',
          key: 'ds_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
        allowNull: true,
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
      d_status: {
        type: Sequelize.ENUM('PENDING', 'FOR-PICK-UP', 'OUT-FOR-DELIVERY', 'COMPLETE'),
        allowNull: false,
      },
      d_createddate: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('delivery')
  },
}
