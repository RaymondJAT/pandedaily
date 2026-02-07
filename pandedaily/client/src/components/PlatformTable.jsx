import { FiChevronUp, FiChevronDown } from 'react-icons/fi'
import ActionButtons from './ActionButtons'

// mock data generator
export const createBudgetData = (count = 6) => {
  return Array.from({ length: count }).map((_, i) => {
    const allocated = 500_000 + i * 150_000
    const spent = Math.floor(allocated * (0.4 + Math.random() * 0.7))

    return {
      id: i + 1,
      department: `Department ${i + 1}`,
      allocated,
      spent,
      remaining: allocated - spent,
      utilization: Math.min(100, Math.round((spent / allocated) * 100)),
    }
  })
}

const PlatformTable = ({
  columns,
  data,
  sortKey,
  sortDirection,
  onSort,
  onView,
  onEdit,
  onDelete,
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
  const handleRowSelect = (rowId) => {
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
          className={`px-3 py-3 bg-component
          ${
            titleAlignment === 'center'
              ? 'text-center'
              : titleAlignment === 'right'
                ? 'text-right'
                : 'text-left'
          }
        `}
        >
          <h3 className="text-[13px] font-semibold text-gray-800">{title}</h3>
        </div>
      )}

      {/* Table Container */}
      <div
        className={`overflow-auto min-h-0 ${
          hasHeightClass || containerClassName.includes('h-') ? 'h-full' : ''
        }`}
      >
        <table
          className={`w-full text-sm ${
            responsive ? 'table-auto' : 'table-fixed'
          } ${tableClassName}`}
        >
          <thead className="bg-gray-300 sticky top-0 z-10">
            <tr>
              {/* Checkbox column header */}
              {showCheckboxes && (
                <th
                  className="px-4 py-3 text-center font-semibold uppercase whitespace-nowrap"
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
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                  </div>
                </th>
              )}

              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => col.sortable && onSort(col.key)}
                  className={`px-4 py-3 font-semibold uppercase whitespace-nowrap
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
                    {col.label}
                    {sortKey === col.key &&
                      (sortDirection === 'asc' ? <FiChevronUp /> : <FiChevronDown />)}
                  </div>
                </th>
              ))}
              {showActions && (
                <th
                  className="px-4 py-3 text-center font-semibold uppercase whitespace-nowrap"
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
                  <td className="px-4 py-3 text-center" style={!responsive ? { width: '5%' } : {}}>
                    <div className="flex justify-center">
                      <input
                        type="checkbox"
                        checked={selectedRows.includes(row.id)}
                        onChange={() => handleRowSelect(row.id)}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                    </div>
                  </td>
                )}

                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`px-4 py-3
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
                  <td className="px-4 py-3 text-center" style={!responsive ? { width: '15%' } : {}}>
                    <ActionButtons
                      row={row}
                      onView={onView}
                      onEdit={onEdit}
                      onDelete={onDelete}
                      {...actionButtonProps}
                    />
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>

        {data.length === 0 && (
          <div className="p-4 text-center text-gray-500">No data available</div>
        )}
      </div>
    </div>
  )
}

export default PlatformTable
