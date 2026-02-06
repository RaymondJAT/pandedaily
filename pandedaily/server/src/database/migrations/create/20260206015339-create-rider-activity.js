'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('rider_activity', {
      ra_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      ra_rider_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'rider',
          key: 'r_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
        allowNull: false,
      },
      ra_delivery_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'delivery',
          key: 'd_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
        allowNull: false,
      },
      ra_status: {
        type: Sequelize.ENUM('PICKED', 'DELIVERED', 'FAILED'),
        allowNull: false,
      },
      ra_date: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('rider_activity')
  },
}
