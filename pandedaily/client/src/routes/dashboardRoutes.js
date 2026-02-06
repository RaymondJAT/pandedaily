import { FiUsers, FiSettings, FiFileText } from 'react-icons/fi'
import { LuLayoutDashboard, LuPhilippinePeso } from 'react-icons/lu'
import { MdOutlineRateReview } from 'react-icons/md'
import { BiPieChartAlt2 } from 'react-icons/bi'
import { TbMoneybag } from 'react-icons/tb'

export const sidebarOptions = [
  { type: 'single', title: 'Dashboard', Icon: LuLayoutDashboard, path: '/' },
  //   {
  //     type: 'dropdown',
  //     title: 'User Management',
  //     Icon: FiUsers,
  //     items: [
  //       { label: 'Users', path: '/users' },
  //       { label: 'Access', path: '/access' },
  //     ],
  //   },
  //   {
  //     type: 'dropdown',
  //     title: 'Configuration',
  //     Icon: FiSettings,
  //     items: [
  //       { label: 'Stores', path: 'stores' },
  //       { label: 'Store Routes', path: '/store-routes' },
  //       { label: 'Flag Analysis', path: '/flag-analysis' },
  //       { label: 'Transport', path: '/transport' },
  //       { label: 'Particulars', path: '/particulars' },
  //     ],
  //   },
  //   {
  //     type: 'dropdown',
  //     title: 'Fund Management',
  //     Icon: LuPhilippinePeso,
  //     items: [
  //       { label: 'Budget Allocation', path: '/budget-allocation' },
  //       { label: 'Revolving Fund', path: '/revolving-fund' },
  //       { label: 'Cash Disbursement', path: '/cash-disbursement' },
  //     ],
  //   },
  //   {
  //     type: 'dropdown',
  //     title: 'Finance Review',
  //     Icon: MdOutlineRateReview,
  //     items: [
  //       { label: 'Pending Final Approval', path: '/finance-approval' },
  //       { label: 'Completed Liquidations', path: '/finance-complete' },
  //       { label: 'Rejected Liquidations', path: '/finance-reject' },
  //       { label: 'All Requests', path: '/all-request' },
  //     ],
  //   },
  //   {
  //     type: 'dropdown',
  //     title: 'Cash Requests',
  //     Icon: TbMoneybag,
  //     items: [
  //       // requester
  //       { label: 'My Requests', path: '/my-request' },
  //       { label: 'For Liquidation', path: '/for-liquidation' },
  //       // team leader
  //       { label: 'Pending Approvals', path: '/pending-approvals' },
  //       { label: 'Approved Requests', path: '/approved-request' },
  //       { label: 'Rejected Requests', path: '/rejected-request' },
  //       // custodian
  //       { label: 'For Processing', path: '/for-processing' },
  //       { label: 'Released Requests', path: '/released' },
  //       { label: 'Rejected Requests', path: '/rejected' },
  //     ],
  //   },
  //   {
  //     type: 'dropdown',
  //     title: 'Liquidations',
  //     Icon: FiFileText,
  //     items: [
  //       // requester
  //       { label: 'My Liquidations', path: '/my-liquidations' },
  //       { label: 'Completed Liquidations', path: '/completed-liquidations' },
  //       { label: 'Verified Liquidations', path: '/verified-liquidations' },
  //       // team leader
  //       { label: 'For Review', path: '/review-liquidations' },
  //       { label: 'Reviewed Liquidations', path: '/reviewed-liquidations' },
  //       { label: 'Rejected Liquidations', path: '/rejected-liquidations' },
  //       // custodian
  //       { label: 'Verify Liquidations', path: '/verify-liquidations' },
  //       { label: 'Verified Liquidations', path: '/verified' },
  //       { label: 'Rejected Liquidations', path: '/reject-liquidations' },
  //     ],
  //   },
  //   { type: 'single', title: 'Reporting', Icon: BiPieChartAlt2, path: '/calendar' },
]
