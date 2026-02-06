'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('delivery_image', {
      di_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      di_delivery_activity_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'delivery_activity',
          key: 'da_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
        allowNull: false,
      },
      di_type: {
        type: Sequelize.ENUM('PICK', 'DELIVER'),
        allowNull: false,
      },
      di_image: {
        type: Sequelize.TEXT('long'),
        allowNull: false,
      },
      di_createddate: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('delivery_image')
  },
}
