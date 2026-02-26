'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('master_access', [
      {
        ma_name: 'Administrator',
        ma_status: 'ACTIVE',
        ma_createddate: new Date(),
      },
    ])

    await queryInterface.bulkInsert('master_route', [
      {
        mr_access_id: null,
        mr_route_name: 'dashboard',
        mr_status: 'NO-ACCESS',
        mr_createddate: new Date(),
      },
      {
        mr_access_id: null,
        mr_route_name: 'users',
        mr_status: 'NO-ACCESS',
        mr_createddate: new Date(),
      },
      {
        mr_access_id: null,
        mr_route_name: 'access',
        mr_status: 'NO-ACCESS',
        mr_createddate: new Date(),
      },
      {
        mr_access_id: null,
        mr_route_name: 'routes',
        mr_status: 'NO-ACCESS',
        mr_createddate: new Date(),
      },
      {
        mr_access_id: null,
        mr_route_name: 'customer',
        mr_status: 'NO-ACCESS',
        mr_createddate: new Date(),
      },
      {
        mr_access_id: null,
        mr_route_name: 'product',
        mr_status: 'NO-ACCESS',
        mr_createddate: new Date(),
      },
      {
        mr_access_id: null,
        mr_route_name: 'inventory',
        mr_status: 'NO-ACCESS',
        mr_createddate: new Date(),
      },
      {
        mr_access_id: null,
        mr_route_name: 'orders',
        mr_status: 'NO-ACCESS',
        mr_createddate: new Date(),
      },
      {
        mr_access_id: null,
        mr_route_name: 'delivery',
        mr_status: 'NO-ACCESS',
        mr_createddate: new Date(),
      },
    ])

    await queryInterface.bulkInsert('permissions', [
      {
        pm_access_id: 1,
        pm_route_id: 1,
        pm_permission: 'FULL',
        pm_createddate: new Date(),
      },
      {
        pm_access_id: 1,
        pm_route_id: 2,
        pm_permission: 'FULL',
        pm_createddate: new Date(),
      },
      {
        pm_access_id: 1,
        pm_route_id: 3,
        pm_permission: 'FULL',
        pm_createddate: new Date(),
      },
      {
        pm_access_id: 1,
        pm_route_id: 4,
        pm_permission: 'FULL',
        pm_createddate: new Date(),
      },
      {
        pm_access_id: 1,
        pm_route_id: 5,
        pm_permission: 'FULL',
        pm_createddate: new Date(),
      },
      {
        pm_access_id: 1,
        pm_route_id: 6,
        pm_permission: 'FULL',
        pm_createddate: new Date(),
      },
      {
        pm_access_id: 1,
        pm_route_id: 7,
        pm_permission: 'FULL',
        pm_createddate: new Date(),
      },
      {
        pm_access_id: 1,
        pm_route_id: 8,
        pm_permission: 'FULL',
        pm_createddate: new Date(),
      },
      {
        pm_access_id: 1,
        pm_route_id: 9,
        pm_permission: 'FULL',
        pm_createddate: new Date(),
      },
    ])

    await queryInterface.bulkInsert('master_user', [
      {
        mu_fullname: 'Admin',
        mu_access_id: 1,
        mu_email: 'admin@pandedaily.com',
        mu_username: 'admin',
        mu_password: 'ab5f039be6c94ee5b6283aaaaf42b126',
        mu_status: 'ACTIVE',
        mu_createddate: new Date(),
      },
    ])
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('permissions', null, {})
    await queryInterface.bulkDelete('master_route', null, {})
    await queryInterface.bulkDelete('master_access', null, {})
    await queryInterface.bulkDelete('master_user', null, {})
  },
}
