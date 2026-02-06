import { useState, useEffect, useRef } from 'react'
import { NavLink } from 'react-router-dom'
import { FiChevronsRight, FiChevronRight } from 'react-icons/fi'
import { sidebarOptions } from '../../../routes/DashboardRoutes'
import { motion, AnimatePresence } from 'framer-motion'
import logoImage from '../../../assets/pandesal.png'

const Sidebar = ({ open, setOpen }) => {
  const [selected, setSelected] = useState('Dashboard')
  const [expandedItems, setExpandedItems] = useState([])
  const [popoutMenu, setPopoutMenu] = useState(null)
  const [popoutPosition, setPopoutPosition] = useState({ x: 0, y: 0 })
  const sidebarRef = useRef(null)

  const toggleExpand = (title, event) => {
    // If sidebar is closed, show popout instead of expanding
    if (!open) {
      event?.stopPropagation()
      const rect = event.currentTarget.getBoundingClientRect()
      setPopoutPosition({
        x: rect.right + 5,
        y: rect.top,
      })

      // Toggle popout for this item
      if (popoutMenu?.title === title) {
        setPopoutMenu(null)
      } else {
        const option = sidebarOptions.find((opt) => opt.title === title)
        setPopoutMenu({
          title,
          items: option?.items || [],
        })
      }
      return
    }

    // Normal expand behavior when sidebar is open
    setExpandedItems((prev) =>
      prev.includes(title) ? prev.filter((item) => item !== title) : [...prev, title],
    )
    setPopoutMenu(null) // Close any open popout when expanding normally
  }

  // Function to check if a path is active
  const isPathActive = (path) => {
    return window.location.pathname === path
  }

  // Close popout when clicking outside
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
          {sidebarOptions.map((option) => {
            const isExpanded = expandedItems.includes(option.title)

            if (option.type === 'single') {
              return (
                <NavLink
                  key={option.title}
                  to={option.path}
                  className={({ isActive }) =>
                    `relative flex h-10 w-full items-center rounded-md transition-colors sidebar-item ${
                      isActive ? 'bg-[#2A1803] text-[#F5EFE7]' : 'hover:bg-[#523010] text-[#F5EFE7]'
                    }`
                  }
                  onClick={() => setSelected(option.title)}
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

            return (
              <div key={option.title} className="space-y-1 sidebar-item">
                <button
                  onClick={(e) => toggleExpand(option.title, e)}
                  className={`relative flex h-10 w-full items-center rounded-md transition-colors cursor-pointer text-[#F5EFE7] hover:bg-[#523010] ${
                    isPathActive(option.items.some((item) => isPathActive(item.path)))
                      ? 'bg-[#2A1803] text-[#F5EFE7]'
                      : ''
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
                        {option.items.map((item) => (
                          <NavLink
                            key={item.label}
                            to={item.path}
                            className={({ isActive }) =>
                              `relative flex h-8 w-full items-center rounded-md transition-colors text-xs ${
                                isActive
                                  ? 'bg-[#2A1803] text-[#F5EFE7] font-medium'
                                  : 'hover:bg-[#523010] text-[#D9D2C9]'
                              }`
                            }
                            onClick={() => setSelected(item.label)}
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

        {/* Toggle */}
        <div className="mt-2 border-t border-[#2A1803]">
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
        {popoutMenu && (
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
                    className={({ isActive }) =>
                      `flex items-center justify-between px-4 py-2.5 text-sm transition-colors text-[#F5EFE7] ${
                        isActive ? 'bg-[#2A1803] text-[#F5EFE7] font-medium' : 'hover:bg-[#523010]'
                      }`
                    }
                    onClick={() => {
                      setSelected(item.label)
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

      {/* Custom scrollbar styling */}
      <style>{`
        .scrollbar-custom::-webkit-scrollbar {
          width: 4px;
        }
        .scrollbar-custom::-webkit-scrollbar-track {
          background: #523010;
          border-radius: 4px;
        }
        .scrollbar-custom::-webkit-scrollbar-thumb {
          background: #2a1803;
          border-radius: 4px;
        }
        .scrollbar-custom::-webkit-scrollbar-thumb:hover {
          background: #1a1002;
        }
      `}</style>
    </>
  )
}

export default Sidebar
