import { useState, useEffect } from 'react'
import { FiX, FiAlertCircle, FiCheck } from 'react-icons/fi'
import { updateUser, getAccessLevels } from '../../services/api'

const EditUser = ({ isOpen, onClose, userData, onUserUpdated }) => {
  const [formData, setFormData] = useState({
    access_id: '',
    status: 'active',
  })
  const [originalData, setOriginalData] = useState(null)
  const [formErrors, setFormErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [submitSuccess, setSubmitSuccess] = useState('')
  const [accessLevels, setAccessLevels] = useState([])
  const [loadingAccessLevels, setLoadingAccessLevels] = useState(false)

  // Extract user info from userData prop
  const userInfo = userData
    ? {
        id: userData.mu_id || userData.id,
        fullname: userData.mu_fullname || userData.fullname || '',
        username: userData.mu_username || userData.username || '',
        email: userData.mu_email || userData.email || '',
        currentAccessName: userData.access_name || userData.access_level || '',
      }
    : null

  useEffect(() => {
    if (isOpen && userData) {
      setOriginalData(userData)

      const accessId = userData.mu_access_id || userData.access_id || ''

      setFormData({
        access_id: accessId,
        status: (userData.mu_status || userData.status || 'active').toLowerCase(),
      })

      fetchAccessLevels()
    }

    // Reset form when modal closes
    return () => {
      setFormData({
        access_id: '',
        status: 'active',
      })
      setOriginalData(null)
      setSubmitError('')
      setSubmitSuccess('')
    }
  }, [isOpen, userData])

  const fetchAccessLevels = async () => {
    setLoadingAccessLevels(true)
    try {
      const response = await getAccessLevels()
      const levels = response.data || response || []
      console.log('Access levels fetched:', levels)
      setAccessLevels(Array.isArray(levels) ? levels : [])

      if (userData && !formData.access_id && userInfo.currentAccessName) {
        const matchedAccess = levels.find(
          (access) => (access.ma_name || access.name) === userInfo.currentAccessName,
        )
        if (matchedAccess) {
          setFormData((prev) => ({
            ...prev,
            access_id: matchedAccess.ma_id || matchedAccess.id || '',
          }))
        }
      }
    } catch (error) {
      console.error('Error fetching access levels:', error)
      setSubmitError('Failed to load access levels')
    } finally {
      setLoadingAccessLevels(false)
    }
  }

  // Handle select changes
  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: '',
      }))
    }
  }

  // Validate form
  const validateForm = () => {
    const errors = {}

    if (!formData.access_id) errors.access_id = 'Access level is required'

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Check if form has changes
  const hasChanges = () => {
    if (!originalData || !userInfo) return false

    const originalAccessId = originalData.mu_access_id || originalData.access_id || ''
    const originalStatus = (originalData.mu_status || originalData.status || 'active').toLowerCase()

    return formData.access_id !== originalAccessId || formData.status !== originalStatus
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm() || !userInfo) return

    setIsSubmitting(true)
    setSubmitError('')
    setSubmitSuccess('')

    try {
      // Prepare data for API
      const updateData = {
        access_id: formData.access_id,
        status: formData.status,
      }

      const response = await updateUser(userInfo.id, updateData)

      setSubmitSuccess('User updated successfully!')

      // Reset form after successful submission
      setTimeout(() => {
        if (onUserUpdated) {
          onUserUpdated(response.data)
        }
        onClose()
      }, 1500)
    } catch (error) {
      console.error('Error updating user:', error)
      setSubmitError(error.message || 'Failed to update user. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // If modal is not open or userData is not provided, don't render anything
  if (!isOpen || !userData) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />

      {/* Modal Container */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-400">
            <h3 className="text-2xl font-bold text-gray-800">Edit User</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#9C4A15] rounded-lg p-1.5"
              disabled={isSubmitting}
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>

          {/* Form Content */}
          <div className="p-6">
            {/* Success Message */}
            {submitSuccess && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                <FiCheck className="w-5 h-5 text-green-600" />
                <span className="text-green-700 text-sm font-medium">{submitSuccess}</span>
              </div>
            )}

            {/* Error Message */}
            {submitError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                <FiAlertCircle className="w-5 h-5 text-red-600" />
                <span className="text-red-700 text-sm font-medium">{submitError}</span>
              </div>
            )}

            {/* Loading State for Access Levels */}
            {loadingAccessLevels ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#9C4A15]"></div>
                <p className="ml-3 text-gray-600">Loading access levels...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* User Information read only */}
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">User Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Full Name</label>
                      <div className="px-3 py-2 bg-white border border-gray-300 rounded text-gray-800">
                        {userInfo.fullname || 'N/A'}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Username</label>
                      <div className="px-3 py-2 bg-white border border-gray-300 rounded text-gray-800">
                        {userInfo.username || 'N/A'}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Email</label>
                      <div className="px-3 py-2 bg-white border border-gray-300 rounded text-gray-800">
                        {userInfo.email || 'N/A'}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">
                        Current Access Level
                      </label>
                      <div className="px-3 py-2 bg-white border border-gray-300 rounded text-gray-800">
                        {userInfo.currentAccessName || 'N/A'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Editable Fields */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Access Level *
                    </label>
                    <select
                      name="access_id"
                      value={formData.access_id}
                      onChange={(e) => handleSelectChange('access_id', e.target.value)}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9C4A15] ${
                        formErrors.access_id ? 'border-red-300' : 'border-slate-400'
                      }`}
                      disabled={isSubmitting}
                    >
                      <option value="">Select access level</option>
                      {accessLevels.map((access) => (
                        <option key={access.ma_id || access.id} value={access.ma_id || access.id}>
                          {access.ma_name || access.name}
                        </option>
                      ))}
                    </select>
                    {formErrors.access_id && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.access_id}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={(e) => handleSelectChange('status', e.target.value)}
                      className="w-full px-4 py-2 border border-slate-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9C4A15]"
                      disabled={isSubmitting}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex justify-between items-center pt-6 border-t border-slate-400 mt-6">
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-6 py-2 border border-slate-400 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 disabled:opacity-50 transition-colors cursor-pointer"
                      disabled={isSubmitting}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 bg-[#9C4A15] text-[#F5EFE7] rounded-lg hover:bg-[#8a3f12] focus:outline-none focus:ring-2 focus:ring-[#9C4A15] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors cursor-pointer"
                      disabled={isSubmitting || !hasChanges()}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-[#F5EFE7] border-t-transparent rounded-full animate-spin"></div>
                          <span>Saving...</span>
                        </>
                      ) : (
                        'Save Changes'
                      )}
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default EditUser
