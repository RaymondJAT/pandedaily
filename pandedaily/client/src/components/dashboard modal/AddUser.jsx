import { useState, useEffect } from 'react'
import { Modal, Form, Input, Select, Button, Alert, Spin } from 'antd'
import { FiEye, FiEyeOff, FiX } from 'react-icons/fi'
import { createUser, getAccessLevels } from '../../services/api'

const { Option } = Select

const AddUser = ({ isOpen, onClose, onUserAdded }) => {
  const [form] = Form.useForm()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [submitSuccess, setSubmitSuccess] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [accessLevels, setAccessLevels] = useState([])
  const [loadingAccessLevels, setLoadingAccessLevels] = useState(false)

  // Fetch access levels when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchAccessLevels()
      form.resetFields() // Reset form when modal opens
    }
  }, [isOpen])

  const fetchAccessLevels = async () => {
    setLoadingAccessLevels(true)
    try {
      const response = await getAccessLevels()
      setAccessLevels(response.data || [])
    } catch (error) {
      console.error('Error fetching access levels:', error)
      setSubmitError('Failed to load access levels')
    } finally {
      setLoadingAccessLevels(false)
    }
  }

  // Handle form submission
  const handleSubmit = async (values) => {
    setIsSubmitting(true)
    setSubmitError('')
    setSubmitSuccess('')

    try {
      const userData = {
        ...values,
        status: values.status || 'active',
      }

      const response = await createUser(userData)

      setSubmitSuccess('User created successfully!')

      // Reset form after successful submission
      setTimeout(() => {
        form.resetFields()
        if (onUserAdded) {
          onUserAdded(response.data)
        }
        onClose()
      }, 1500)
    } catch (error) {
      console.error('Error creating user:', error)
      setSubmitError(error.message || 'Failed to create user. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Password validation rule
  const validatePassword = (_, value) => {
    if (!value) {
      return Promise.reject('Please input your password!')
    }
    if (value.length < 6) {
      return Promise.reject('Password must be at least 6 characters!')
    }
    return Promise.resolve()
  }

  // Confirm password validation rule
  const validateConfirmPassword = ({ getFieldValue }) => ({
    validator(_, value) {
      if (!value || getFieldValue('password') === value) {
        return Promise.resolve()
      }
      return Promise.reject('The two passwords do not match!')
    },
  })

  // If modal is not open, don't render anything
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />

      {/* Modal Container */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl w-full max-w-4xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-400">
            <h3 className="text-2xl font-bold text-gray-800">Add New User</h3>
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
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-700 text-sm font-medium">{submitSuccess}</p>
              </div>
            )}

            {/* Error Message */}
            {submitError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm font-medium">{submitError}</p>
              </div>
            )}

            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              disabled={isSubmitting}
              className="space-y-6"
            >
              {/* First Row: Full Name and Username */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <Form.Item
                    name="fullname"
                    rules={[
                      { required: true, message: 'Please input full name!' },
                      { min: 2, message: 'Full name must be at least 2 characters!' },
                    ]}
                    className="mb-0"
                  >
                    <Input
                      placeholder="Enter full name"
                      className="w-full px-4 py-2 border border-slate-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9C4A15]"
                      disabled={isSubmitting}
                    />
                  </Form.Item>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Username *</label>
                  <Form.Item
                    name="username"
                    rules={[
                      { required: true, message: 'Please input username!' },
                      { min: 3, message: 'Username must be at least 3 characters!' },
                    ]}
                    className="mb-0"
                  >
                    <Input
                      placeholder="Enter username"
                      className="w-full px-4 py-2 border border-slate-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9C4A15]"
                      disabled={isSubmitting}
                    />
                  </Form.Item>
                </div>
              </div>

              {/* Second Row: Email and Access Level */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                  <Form.Item
                    name="email"
                    rules={[
                      { required: true, message: 'Please input email!' },
                      { type: 'email', message: 'Please enter a valid email!' },
                    ]}
                    className="mb-0"
                  >
                    <Input
                      placeholder="Enter email address"
                      className="w-full px-4 py-2 border border-slate-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9C4A15]"
                      disabled={isSubmitting}
                    />
                  </Form.Item>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Access Level *
                  </label>
                  <Form.Item
                    name="access_id"
                    rules={[{ required: true, message: 'Please select access level!' }]}
                    className="mb-0"
                  >
                    <Select
                      placeholder="Select access level"
                      loading={loadingAccessLevels}
                      notFoundContent={
                        loadingAccessLevels ? <Spin size="small" /> : 'No access levels found'
                      }
                      className="w-full"
                      popupClassName="border border-slate-400 rounded-lg"
                      disabled={isSubmitting || loadingAccessLevels}
                      optionFilterProp="children"
                      showSearch
                      filterOption={(input, option) =>
                        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                      }
                    >
                      {accessLevels.map((access) => (
                        <Option key={access.ma_id || access.id} value={access.ma_id || access.id}>
                          {access.ma_name || access.name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                  {loadingAccessLevels && (
                    <p className="mt-1 text-sm text-gray-500">Loading access levels...</p>
                  )}
                </div>
              </div>

              {/* Third Row: Password and Confirm Password */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Password *</label>
                  <Form.Item
                    name="password"
                    rules={[{ validator: validatePassword }]}
                    className="mb-0"
                  >
                    <div className="relative">
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter password"
                        className="w-full px-4 py-2 border border-slate-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9C4A15] pr-10"
                        disabled={isSubmitting}
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isSubmitting}
                      >
                        {showPassword ? (
                          <FiEyeOff className="w-5 h-5" />
                        ) : (
                          <FiEye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </Form.Item>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm Password *
                  </label>
                  <Form.Item
                    name="confirmPassword"
                    dependencies={['password']}
                    rules={[validateConfirmPassword]}
                    className="mb-0"
                  >
                    <div className="relative">
                      <Input
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Confirm password"
                        className="w-full px-4 py-2 border border-slate-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9C4A15] pr-10"
                        disabled={isSubmitting}
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        disabled={isSubmitting}
                      >
                        {showConfirmPassword ? (
                          <FiEyeOff className="w-5 h-5" />
                        ) : (
                          <FiEye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </Form.Item>
                </div>
              </div>

              {/* Fourth Row: Status */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <Form.Item name="status" initialValue="active" className="mb-0">
                    <Select
                      placeholder="Select status"
                      className="w-full"
                      popupClassName="border border-slate-400 rounded-lg"
                      disabled={isSubmitting}
                    >
                      <Option value="active">Active</Option>
                      <Option value="inactive">Inactive</Option>
                    </Select>
                  </Form.Item>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-3 pt-6 border-t border-slate-400 mt-6">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2 border border-slate-400 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 disabled:opacity-50 transition-colors"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#9C4A15] text-[#F5EFE7] rounded-lg hover:bg-[#8a3f12] focus:outline-none focus:ring-2 focus:ring-[#9C4A15] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-[#F5EFE7] border-t-transparent rounded-full animate-spin"></div>
                      <span>Creating...</span>
                    </>
                  ) : (
                    'Create User'
                  )}
                </button>
              </div>
            </Form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AddUser
