import { useState, useEffect, useRef } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { FiChevronsRight, FiChevronRight } from 'react-icons/fi'
import { sidebarOptions } from '../../../routes/DashboardRoutes'
import { motion, AnimatePresence } from 'framer-motion'
import logoImage from '../../../assets/pandesal.png'
import { usePermissions } from '../../../context/PermissionContext'
import { Spin } from 'antd'

const Sidebar = ({ open, setOpen }) => {
  const [expandedItems, setExpandedItems] = useState([])
  const [popoutMenu, setPopoutMenu] = useState(null)
  const [popoutPosition, setPopoutPosition] = useState({ x: 0, y: 0 })
  const sidebarRef = useRef(null)
  const location = useLocation()
  const { hasPermission, loading } = usePermissions()

  // Filter sidebar options based on permissions
  const filteredSidebarOptions = sidebarOptions.filter((option) => {
    if (option.type === 'single' && option.routeName) {
      return hasPermission(option.routeName)
    }
    if (option.type === 'dropdown' && option.items) {
      const hasAccessibleChildren = option.items.some((item) =>
        item.routeName ? hasPermission(item.routeName) : true,
      )
      return hasAccessibleChildren
    }
    return true
  })

  const toggleExpand = (title, event) => {
    if (!open) {
      event?.stopPropagation()
      const rect = event.currentTarget.getBoundingClientRect()
      setPopoutPosition({
        x: rect.right + 5,
        y: rect.top,
      })

      if (popoutMenu?.title === title) {
        setPopoutMenu(null)
      } else {
        const option = filteredSidebarOptions.find((opt) => opt.title === title)

        const accessibleItems =
          option?.items?.filter((item) =>
            item.routeName ? hasPermission(item.routeName) : true,
          ) || []

        setPopoutMenu({
          title,
          items: accessibleItems,
        })
      }
      return
    }

    setExpandedItems((prev) =>
      prev.includes(title) ? prev.filter((item) => item !== title) : [...prev, title],
    )
    setPopoutMenu(null)
  }

  // Function to check if a path is active
  const isParentActive = (items) => {
    return items.some((item) => {
      if (item.path === location.pathname) {
        return true
      }
      if (location.pathname.startsWith(item.path + '/')) {
        return true
      }
      return false
    })
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        popoutMenu &&
        !event.target.closest('.popout-menu') &&
        !event.target.closest('.sidebar-item')
      ) {
        setPopoutMenu(null)
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [popoutMenu])

  // Close popout when sidebar opens
  useEffect(() => {
    if (open) {
      setPopoutMenu(null)
    }
  }, [open])

  useEffect(() => {
    filteredSidebarOptions.forEach((option) => {
      if (option.type === 'dropdown' && option.items) {
        const isActive = isParentActive(option.items)
        if (isActive && !expandedItems.includes(option.title)) {
          setExpandedItems((prev) => [...prev, option.title])
        }
      }
    })
  }, [location.pathname, filteredSidebarOptions])

  if (loading) {
    return (
      <motion.nav
        ref={sidebarRef}
        className="sticky top-0 h-screen shrink-0 border-r border-[#2A1803] bg-[#3F2305] p-2 flex flex-col items-center"
        initial={false}
        animate={{ width: open ? 225 : 56 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        style={{ position: 'fixed', left: 0, zIndex: 40 }}
      >
        <div className="flex items-center justify-center h-full">
          <Spin className="text-[#F5EFE7]" />
        </div>
      </motion.nav>
    )
  }

  return (
    <>
      <motion.nav
        ref={sidebarRef}
        className="sticky top-0 h-screen shrink-0 border-r border-[#2A1803] bg-[#3F2305] p-2 flex flex-col"
        initial={false}
        animate={{ width: open ? 225 : 56 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        style={{ position: 'fixed', left: 0, zIndex: 40 }}
      >
        {/* Title */}
        <div className="mb-3 border-b border-[#2A1803] pb-3">
          <div className="flex cursor-pointer items-center justify-between rounded-md transition-colors hover:bg-[#523010]">
            <div className="flex items-center gap-2">
              {/* Logo Container */}
              <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-[#2A1803] overflow-hidden p-1">
                <img
                  src={logoImage}
                  alt="PandeDaily Logo"
                  className="h-full w-full object-contain"
                />
              </div>

              {open && (
                <div className="overflow-hidden font-[titleFont]">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key="title-content"
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.2 }}
                      className="whitespace-nowrap pt-2"
                    >
                      <span className="block text-md font-semibold text-[#F5EFE7] tracking-widest">
                        PandeDaily
                      </span>
                      <span className="block text-xs text-[#D9D2C9]">#PandesalEveryday</span>
                    </motion.div>
                  </AnimatePresence>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Options */}
        <div className="flex-1 space-y-1 overflow-y-auto overflow-x-hidden scrollbar-custom">
          {filteredSidebarOptions.map((option) => {
            const isExpanded = expandedItems.includes(option.title)

            if (option.type === 'single') {
              return (
                <NavLink
                  key={option.title}
                  to={option.path}
                  end
                  className={({ isActive }) =>
                    `relative flex h-10 w-full items-center rounded-md transition-colors sidebar-item ${
                      isActive ? 'bg-[#2A1803] text-[#F5EFE7]' : 'hover:bg-[#523010] text-[#F5EFE7]'
                    }`
                  }
                >
                  <div className="grid h-full w-10 place-content-center text-lg shrink-0">
                    <option.Icon className="text-[#F5EFE7]" />
                  </div>
                  {open && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.2 }}
                      className="text-sm font-medium whitespace-nowrap text-[#F5EFE7]"
                    >
                      {option.title}
                    </motion.span>
                  )}
                </NavLink>
              )
            }

            const accessibleItems =
              option.items?.filter((item) =>
                item.routeName ? hasPermission(item.routeName) : true,
              ) || []

            if (accessibleItems.length === 0) {
              return null
            }

            return (
              <div key={option.title} className="space-y-1 sidebar-item">
                <button
                  onClick={(e) => toggleExpand(option.title, e)}
                  className={`relative flex h-10 w-full items-center rounded-md transition-colors cursor-pointer text-[#F5EFE7] hover:bg-[#523010] ${
                    isParentActive(accessibleItems) ? 'bg-[#2A1803] text-[#F5EFE7]' : ''
                  }`}
                >
                  <div className="relative flex items-center w-full">
                    <div className="grid h-full w-10 place-content-center text-lg shrink-0">
                      <option.Icon className="text-[#F5EFE7]" />
                    </div>

                    {open && (
                      <>
                        <motion.span
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          transition={{ duration: 0.2 }}
                          className="text-sm font-medium flex-1 text-left whitespace-nowrap"
                        >
                          {option.title}
                        </motion.span>

                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="grid h-full w-6 place-content-center text-xs shrink-0"
                        >
                          <FiChevronRight
                            className={`transition-transform duration-200 text-[#F5EFE7] ${
                              isExpanded ? 'rotate-90' : ''
                            }`}
                          />
                        </motion.div>
                      </>
                    )}
                  </div>
                </button>

                {/* Expanded menu when sidebar is open */}
                <AnimatePresence>
                  {open && isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="ml-2 space-y-1 pl-2">
                        {accessibleItems.map((item) => (
                          <NavLink
                            key={item.label}
                            to={item.path}
                            end={false}
                            className={({ isActive }) =>
                              `relative flex h-8 w-full items-center rounded-md transition-colors text-xs ${
                                isActive
                                  ? 'bg-[#2A1803] text-[#F5EFE7] font-medium'
                                  : 'hover:bg-[#523010] text-[#D9D2C9]'
                              }`
                            }
                          >
                            <span className="pl-8 flex-1 text-left whitespace-nowrap">
                              {item.label}
                            </span>
                            {item.notifs && (
                              <span className="mr-2 size-4 rounded-full bg-[#9C4A15] text-[10px] text-[#F5EFE7] flex items-center justify-center shrink-0 font-semibold">
                                {item.notifs}
                              </span>
                            )}
                          </NavLink>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>

        {/* Toggle - Hidden on mobile and tablet screens */}
        <div className="mt-2 border-t border-[#2A1803] hidden lg:block">
          <button
            onClick={() => {
              setOpen((pv) => !pv)
              setPopoutMenu(null)
            }}
            className="w-full transition-colors hover:bg-[#523010] cursor-pointer shrink-0"
          >
            <div
              className={`flex items-center p-2 hover:bg-[#523010] rounded-md transition-colors ${
                open ? 'justify-start' : 'justify-center'
              }`}
            >
              <div className="grid size-10 place-content-center text-lg shrink-0">
                <FiChevronsRight
                  className={`transition-transform duration-300 text-[#F5EFE7] ${open && 'rotate-180'}`}
                />
              </div>

              <div className="overflow-hidden">
                <AnimatePresence mode="wait">
                  {open && (
                    <motion.span
                      key="hide-text"
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.2 }}
                      className="text-sm font-medium whitespace-nowrap text-[#F5EFE7]"
                    >
                      Hide
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </button>
        </div>
      </motion.nav>

      {/* Popout Menu when sidebar is closed */}
      <AnimatePresence>
        {popoutMenu && popoutMenu.items.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, x: -10 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.95, x: -10 }}
            transition={{ duration: 0.15 }}
            className="fixed z-50 popout-menu"
            style={{
              left: popoutPosition.x,
              top: popoutPosition.y,
            }}
          >
            <div className="bg-[#3F2305] rounded-lg shadow-xl border border-[#2A1803] min-w-48 overflow-hidden">
              {/* Popout header with title */}
              <div className="p-3 bg-[#2A1803] border-b border-[#2A1803]">
                <h3 className="font-semibold text-[#F5EFE7] text-sm">{popoutMenu.title}</h3>
              </div>

              {/* Popout menu items */}
              <div className="py-2">
                {popoutMenu.items.map((item) => (
                  <NavLink
                    key={item.label}
                    to={item.path}
                    end={false}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-4 py-2.5 text-sm transition-colors text-[#F5EFE7] ${
                        isActive ? 'bg-[#2A1803] text-[#F5EFE7] font-medium' : 'hover:bg-[#523010]'
                      }`
                    }
                    onClick={() => {
                      setPopoutMenu(null)
                    }}
                  >
                    <span>{item.label}</span>
                    {item.notifs && (
                      <span className="ml-2 size-5 rounded-full bg-[#9C4A15] text-xs text-[#F5EFE7] flex items-center justify-center shrink-0 font-semibold">
                        {item.notifs}
                      </span>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>

            {/* Arrow pointing to the sidebar button */}
            <div className="absolute -left-2 top-4 w-0 h-0 border-t-[6px] border-b-[6px] border-r-[6px] border-t-transparent border-b-transparent border-r-[#3F2305]"></div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default Sidebar
