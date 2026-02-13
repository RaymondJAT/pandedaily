'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('delivery_activity', {
      da_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      da_delivery_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'delivery',
          key: 'd_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
        allowNull: false,
      },
      da_status: {
        type: Sequelize.ENUM('PENDING', 'FOR-PICK-UP', 'OUT-FOR-DELIVERY', 'COMPLETE'),
        allowNull: false,
      },
      da_remarks: {
        type: Sequelize.TEXT('long'),
        allowNull: false,
      },
      da_createddate: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('delivery_activity')
  },
}
