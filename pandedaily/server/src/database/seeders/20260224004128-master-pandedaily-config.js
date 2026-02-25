'use strict'
import { EncryptString } from '../../utils/cryptography.util'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('master_access', [
      {
        ma_name: 'Administrator',
        ma_status: 'ACTIVE',
        ma_createddate: new Date(),
      },
      {
        ma_name: 'Developer',
        ma_status: 'ACTIVE',
        ma_createddate: new Date(),
      },
    ])

    await queryInterface.bulkInsert('master_route', [
      {
        mr_access_id: 1,
        mr_route_name: 'dashboard',
        mr_status: 'FULL',
        mr_createddate: new Date(),
      },
      {
        mr_access_id: 1,
        mr_route_name: 'users',
        mr_status: 'FULL',
        mr_createddate: new Date(),
      },
      {
        mr_access_id: 1,
        mr_route_name: 'access',
        mr_status: 'FULL',
        mr_createddate: new Date(),
      },
      {
        mr_access_id: 1,
        mr_route_name: 'customer',
        mr_status: 'FULL',
        mr_createddate: new Date(),
      },
      {
        mr_access_id: 1,
        mr_route_name: 'product',
        mr_status: 'FULL',
        mr_createddate: new Date(),
      },
      {
        mr_access_id: 1,
        mr_route_name: 'inventory',
        mr_status: 'FULL',
        mr_createddate: new Date(),
      },
      {
        mr_access_id: 1,
        mr_route_name: 'orders',
        mr_status: 'FULL',
        mr_createddate: new Date(),
      },
      {
        mr_access_id: 1,
        mr_route_name: 'delivery',
        mr_status: 'FULL',
        mr_createddate: new Date(),
      },
    ])

    const encryptPassword = EncryptString('admin')

    await queryInterface.bulkInsert('master_user', [
      {
        mu_fullname: 'Admin',
        mu_access_id: 1,
        mu_email: 'admin@pandedaily.com',
        mu_username: 'admin',
        mu_password: encryptPassword,
        mu_status: 'ACTIVE',
        mu_createddate: new Date(),
      },
    ])
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('master_access', null, {})
    await queryInterface.bulkDelete('master_route', null, {})
    await queryInterface.bulkDelete('master_user', null, {})
  },
}
