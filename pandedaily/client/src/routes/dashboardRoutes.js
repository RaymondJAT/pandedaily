import { FiUsers, FiPackage, FiTruck, FiShoppingBag } from 'react-icons/fi'
import { LuLayoutDashboard } from 'react-icons/lu'
import { PiUsersThreeLight } from 'react-icons/pi'

export const sidebarOptions = [
  {
    type: 'single',
    title: 'Dashboard',
    Icon: LuLayoutDashboard,
    path: '/dashboard',
  },
  {
    type: 'dropdown',
    title: 'User Management',
    Icon: FiUsers,
    items: [
      { label: 'Users', path: '/dashboard/users' },
      { label: 'Access', path: '/dashboard/access' },
    ],
  },
  {
    type: 'single',
    title: 'Customer',
    Icon: PiUsersThreeLight,
    path: '/dashboard/customer',
  },
  {
    type: 'dropdown',
    title: 'Product & Inventory',
    Icon: FiPackage,
    items: [
      { label: 'Product', path: '/dashboard/product' },
      { label: 'Inventory', path: '/dashboard/inventory' },
    ],
  },
  {
    type: 'single',
    title: 'Orders',
    Icon: FiShoppingBag,
    path: '/dashboard/orders',
  },
  {
    type: 'single',
    title: 'Delivery',
    Icon: FiTruck,
    path: '/dashboard/delivery',
  },
]
