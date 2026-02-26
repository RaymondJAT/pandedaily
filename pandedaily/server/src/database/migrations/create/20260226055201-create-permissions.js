'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('permissions', {
      pm_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
        unique: true,
      },
      pm_access_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'master_access',
          key: 'ma_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
        allowNull: false,
      },
      pm_route_id: {
        type: Sequelize.INTEGER,

        references: {
          model: 'master_route',
          key: 'mr_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
        allowNull: false,
      },
      pm_permission: {
        type: Sequelize.ENUM('FULL', 'NO-ACCESS'),
        defaultValue: 'NO-ACCESS',
        allowNull: false,
      },
      pm_createddate: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('permissions')
  },
}
