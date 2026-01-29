'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('master_route', {
      mr_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
        unique: true,
      },
      mr_access_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'master_access',
          key: 'ma_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
        allowNull: false,
      },
      mr_route_name: {
        type: Sequelize.STRING(300),
        allowNull: false,
      },
      mr_status: {
        type: Sequelize.ENUM('FULL', 'VIEW', 'NO-ACCESS'),
        defaultValue: 'FULL',
        allowNull: false,
      },
      mr_createddate: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('master_route')
  },
}
