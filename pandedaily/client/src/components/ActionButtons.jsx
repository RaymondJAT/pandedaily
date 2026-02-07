import { FiEye, FiEdit, FiTrash2, FiSettings, FiX, FiDownload } from 'react-icons/fi'
import { LuFolderCheck } from 'react-icons/lu'

const ActionButtons = ({
  onView,
  onEdit,
  onDelete,
  onSubmit,
  onConfigure,
  onReject,
  onDownload,
  row,
  viewLabel = 'View',
  editLabel = 'Edit',
  deleteLabel = 'Delete',
  submitLabel = 'Submit',
  configureLabel = 'Configure',
  rejectLabel = 'Reject',
  downloadLabel = 'Download PDF',
  size = 'md',
  showLabels = false,
  showView = false,
  showEdit = false,
  showDelete = false,
  showSubmit = false,
  showConfigure = false,
  showReject = false,
  showDownload = false,
}) => {
  const sizeClasses = {
    sm: 'p-1 text-sm',
    md: 'p-2',
    lg: 'p-3 text-lg',
  }

  // Default download handler
  const handleDownload = () => {
    if (onDownload) {
      onDownload(row)
    } else {
      console.log('Download PDF for:', row)
    }
  }

  return (
    <div className="flex justify-center gap-2">
      {showView && (
        <button
          onClick={() => onView(row)}
          className={`${sizeClasses[size]} rounded hover:bg-blue-50 text-blue-600 flex items-center gap-1 cursor-pointer`}
          title={viewLabel}
          aria-label={`${viewLabel} ${row.department || row.name || 'item'}`}
        >
          <FiEye />
          {showLabels && <span className="hidden sm:inline">{viewLabel}</span>}
        </button>
      )}

      {showSubmit && (
        <button
          onClick={() => onSubmit(row)}
          className={`${sizeClasses[size]} rounded hover:bg-green-50 text-green-600 flex items-center gap-1 cursor-pointer`}
          title={submitLabel}
          aria-label={`${submitLabel} ${row.department || row.name || 'item'}`}
        >
          <LuFolderCheck />
          {showLabels && <span className="hidden sm:inline">{submitLabel}</span>}
        </button>
      )}

      {showEdit && (
        <button
          onClick={() => onEdit(row)}
          className={`${sizeClasses[size]} rounded hover:bg-yellow-50 text-yellow-600 flex items-center gap-1 cursor-pointer`}
          title={editLabel}
          aria-label={`${editLabel} ${row.department || row.name || 'item'}`}
        >
          <FiEdit />
          {showLabels && <span className="hidden sm:inline">{editLabel}</span>}
        </button>
      )}

      {showConfigure && (
        <button
          onClick={() => onConfigure(row)}
          className={`${sizeClasses[size]} rounded hover:bg-purple-50 text-purple-600 flex items-center gap-1 cursor-pointer`}
          title={configureLabel}
          aria-label={`${configureLabel} ${row.department || row.name || 'item'}`}
        >
          <FiSettings />
          {showLabels && <span className="hidden sm:inline">{configureLabel}</span>}
        </button>
      )}

      {showReject && (
        <button
          onClick={() => onReject(row)}
          className={`${sizeClasses[size]} rounded hover:bg-orange-50 text-orange-600 flex items-center gap-1 cursor-pointer`}
          title={rejectLabel}
          aria-label={`${rejectLabel} ${row.department || row.name || 'item'}`}
        >
          <FiX />
          {showLabels && <span className="hidden sm:inline">{rejectLabel}</span>}
        </button>
      )}

      {showDownload && ( // New Download PDF button
        <button
          onClick={handleDownload}
          className={`${sizeClasses[size]} rounded hover:bg-indigo-50 text-indigo-600 flex items-center gap-1 cursor-pointer`}
          title={downloadLabel}
          aria-label={`${downloadLabel} ${row.department || row.name || 'item'}`}
        >
          <FiDownload />
          {showLabels && <span className="hidden sm:inline">{downloadLabel}</span>}
        </button>
      )}

      {showDelete && (
        <button
          onClick={() => onDelete(row)}
          className={`${sizeClasses[size]} rounded hover:bg-red-50 text-red-600 flex items-center gap-1 cursor-pointer`}
          title={deleteLabel}
          aria-label={`${deleteLabel} ${row.department || row.name || 'item'}`}
        >
          <FiTrash2 />
          {showLabels && <span className="hidden sm:inline">{deleteLabel}</span>}
        </button>
      )}
    </div>
  )
}

export default ActionButtons
