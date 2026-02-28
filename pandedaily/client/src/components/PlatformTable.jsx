import { FiChevronUp, FiChevronDown } from 'react-icons/fi'
import ActionButtons from './ActionButtons'
import { useState, useEffect } from 'react'

const PlatformTable = ({
  columns,
  data,
  sortKey,
  sortDirection,
  onSort,
  onView,
  onEdit,
  onDelete,
  onConfigure,
  onRowClick,
  maxHeight = '400px',
  actionButtonProps = {},
  title = null,
  titleAlignment = 'left',
  containerClassName = '',
  tableClassName = '',
  responsive = true,
  showActions = true,
  showCheckboxes = false,
  selectedRows = [],
  onSelectionChange,
  selectAll = false,
  onSelectAll,
}) => {
  const [isMobile, setIsMobile] = useState(false)

  // Check if mobile on mount and when window resizes
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const shouldUseInlineStyle = () => {
    if (typeof maxHeight === 'string') {
      if (maxHeight.startsWith('h-')) {
        return false
      }
      if (
        containerClassName.includes('h-') ||
        containerClassName.includes('max-h-') ||
        containerClassName.includes('height:')
      ) {
        return false
      }
      return true
    }
    return typeof maxHeight === 'number'
  }

  // Parse maxHeight value for inline style
  const getHeightStyle = () => {
    if (!shouldUseInlineStyle()) return {}

    if (typeof maxHeight === 'string') {
      return { maxHeight }
    }

    if (typeof maxHeight === 'number') {
      return { maxHeight: `${maxHeight}px` }
    }

    return { maxHeight: '400px' }
  }

  const hasHeightClass = typeof maxHeight === 'string' && maxHeight.startsWith('h-')

  // Handle individual row selection
  const handleRowSelect = (rowId, event) => {
    event?.stopPropagation()
    if (!onSelectionChange) return

    const isSelected = selectedRows.includes(rowId)
    if (isSelected) {
      onSelectionChange(selectedRows.filter((id) => id !== rowId))
    } else {
      onSelectionChange([...selectedRows, rowId])
    }
  }

  // Handle select all/none
  const handleSelectAll = () => {
    if (!onSelectAll) return

    if (selectAll) {
      onSelectAll(false, [])
    } else {
      const allIds = data.map((row) => row.id)
      onSelectAll(true, allIds)
    }
  }

  // Calculate if all rows are selected
  const getIndeterminateState = () => {
    if (selectAll) return false
    return selectedRows.length > 0 && selectedRows.length < data.length
  }

  // Render mobile card/block view with side-by-side label and value
  const renderMobileCard = (row) => {
    const isSelected = selectedRows.includes(row.id)

    return (
      <div
        key={row.id}
        className={`border border-gray-200 rounded-lg mb-3 overflow-hidden transition-colors ${
          isSelected ? 'bg-blue-50 border-blue-300' : 'bg-white hover:bg-gray-50'
        } ${onRowClick ? 'cursor-pointer' : ''}`}
        onClick={() => onRowClick && onRowClick(row)}
      >
        {/* Card Header - with checkbox only */}
        {showCheckboxes && (
          <div className="flex items-center justify-end p-3 border-b border-gray-100">
            <div onClick={(e) => e.stopPropagation()}>
              <input
                type="checkbox"
                checked={isSelected}
                onChange={(e) => handleRowSelect(row.id, e)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* Card Body - Label and value side by side */}
        <div className="p-3 space-y-3">
          {columns.map((col) => (
            <div key={col.key} className="flex flex-row items-start">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider w-2/5">
                {col.label}
              </span>
              <div className="text-sm text-gray-900 w-3/5 wrap-break-words">
                {col.render ? col.render(row[col.key], row) : row[col.key] || 'N/A'}
              </div>
            </div>
          ))}
        </div>

        {/* Card Footer - Actions at the bottom */}
        {showActions && (
          <div className="p-3 border-t border-gray-100 bg-gray-50">
            <div className="flex justify-center">
              <ActionButtons
                row={row}
                onView={onView}
                onEdit={onEdit}
                onDelete={onDelete}
                onConfigure={onConfigure}
                {...actionButtonProps}
              />
            </div>
          </div>
        )}
      </div>
    )
  }

  // Render desktop table view
  const renderDesktopTable = () => (
    <table
      className={`w-full text-sm ${responsive ? 'table-auto' : 'table-fixed'} ${tableClassName}`}
    >
      <thead className="bg-gray-300 sticky top-0 z-10">
        <tr>
          {/* Checkbox column header */}
          {showCheckboxes && (
            <th
              className="px-2 sm:px-4 py-2 sm:py-3 text-center font-semibold uppercase whitespace-nowrap text-xs sm:text-sm"
              style={!responsive ? { width: '5%' } : {}}
            >
              <div className="flex justify-center">
                <input
                  type="checkbox"
                  checked={selectAll}
                  ref={(input) => {
                    if (input) {
                      input.indeterminate = getIndeterminateState()
                    }
                  }}
                  onChange={handleSelectAll}
                  className="h-3 w-3 sm:h-4 sm:w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
              </div>
            </th>
          )}

          {columns.map((col) => (
            <th
              key={col.key}
              onClick={() => col.sortable && onSort(col.key)}
              className={`px-2 sm:px-4 py-2 sm:py-3 font-semibold uppercase whitespace-nowrap text-xs sm:text-sm
                ${col.sortable ? 'cursor-pointer hover:text-gray-900' : ''}
                ${
                  col.align === 'center'
                    ? 'text-center'
                    : col.align === 'right'
                      ? 'text-right'
                      : 'text-left'
                }
              `}
              style={!responsive ? { width: col.width } : {}}
            >
              <div
                className={`flex items-center gap-1
                  ${
                    col.align === 'center'
                      ? 'justify-center'
                      : col.align === 'right'
                        ? 'justify-end'
                        : 'justify-start'
                  }
                `}
              >
                <span>{col.label}</span>
                {sortKey === col.key &&
                  (sortDirection === 'asc' ? (
                    <FiChevronUp className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
                  ) : (
                    <FiChevronDown className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
                  ))}
              </div>
            </th>
          ))}
          {showActions && (
            <th
              className="px-2 sm:px-4 py-2 sm:py-3 text-center font-semibold uppercase whitespace-nowrap text-xs sm:text-sm"
              style={!responsive ? { width: '15%' } : {}}
            >
              Actions
            </th>
          )}
        </tr>
      </thead>

      <tbody className="divide-y">
        {data.map((row) => (
          <tr
            key={row.id}
            className={`hover:bg-gray-50 ${selectedRows.includes(row.id) ? 'bg-blue-50' : ''} ${
              onRowClick ? 'cursor-pointer' : ''
            }`}
            onClick={() => onRowClick && onRowClick(row)}
          >
            {/* Checkbox column cell */}
            {showCheckboxes && (
              <td className="px-2 sm:px-4 py-2 sm:py-3 text-center">
                <div className="flex justify-center">
                  <input
                    type="checkbox"
                    checked={selectedRows.includes(row.id)}
                    onChange={(e) => {
                      e.stopPropagation()
                      handleRowSelect(row.id)
                    }}
                    className="h-3 w-3 sm:h-4 sm:w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                </div>
              </td>
            )}

            {columns.map((col) => (
              <td
                key={col.key}
                className={`px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm
                  ${
                    col.align === 'center'
                      ? 'text-center'
                      : col.align === 'right'
                        ? 'text-right'
                        : 'text-left'
                  }
                `}
                style={!responsive ? { width: col.width } : {}}
              >
                {col.render ? col.render(row[col.key], row) : row[col.key]}
              </td>
            ))}
            {showActions && (
              <td className="px-2 sm:px-4 py-2 sm:py-3 text-center">
                <ActionButtons
                  row={row}
                  onView={onView}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onConfigure={onConfigure}
                  {...actionButtonProps}
                />
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  )

  return (
    <div
      className={`rounded-sm border shadow-lg border-gray-200 bg-white overflow-hidden ${
        hasHeightClass ? maxHeight : ''
      } ${containerClassName}`}
      style={shouldUseInlineStyle() ? getHeightStyle() : {}}
    >
      {/* Title Section */}
      {title && (
        <div
          className={`px-2 sm:px-3 py-2 sm:py-3 bg-component
          ${
            titleAlignment === 'center'
              ? 'text-center'
              : titleAlignment === 'right'
                ? 'text-right'
                : 'text-left'
          }
        `}
        >
          <h3 className="text-xs sm:text-sm font-semibold text-gray-800">{title}</h3>
        </div>
      )}

      {/* Table/Card Container */}
      <div
        className={`overflow-auto min-h-0 ${
          hasHeightClass || containerClassName.includes('h-') ? 'h-full' : ''
        }`}
      >
        {/* Mobile Card/Block View */}
        {isMobile && data.length > 0 && (
          <div className="p-3">{data.map((row) => renderMobileCard(row))}</div>
        )}

        {/* Desktop Table View */}
        {!isMobile && renderDesktopTable()}

        {/* Empty State */}
        {data.length === 0 && (
          <div className="p-4 sm:p-8 text-center text-gray-500 text-sm sm:text-base">
            No data available
          </div>
        )}
      </div>
    </div>
  )
}

export default PlatformTable
