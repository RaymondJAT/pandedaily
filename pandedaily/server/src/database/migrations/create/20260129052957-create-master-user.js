'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('master_user', {
      mu_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
        unique: true,
      },
      mu_fullname: {
        type: Sequelize.STRING(300),
        allowNull: false,
      },
      mu_access_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'master_access',
          key: 'ma_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
        allowNull: false,
      },
      mu_email: {
        type: Sequelize.STRING(300),
        unique: true,
        validate: {
          isEmail: true,
        },
        allowNull: false,
      },
      mu_username: {
        type: Sequelize.STRING(300),
        unique: true,
        allowNull: false,
      },
      mu_password: {
        type: Sequelize.TEXT('long'),
        allowNull: false,
      },
      mu_status: {
        type: Sequelize.ENUM('ACTIVE', 'INACTIVE', 'DELETED'),
        defaultValue: 'ACTIVE',
        allowNull: false,
      },
      mu_createddate: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('master_user')
  },
}
