import { useState, useEffect } from 'react'
import { Modal, Form, Select, Button, message, Spin, Row, Col, Card, Typography } from 'antd'
import { updateUser, getAccessLevels } from '../../services/api'

const { Option } = Select
const { Text } = Typography

const EditUser = ({ isOpen, onClose, userData, onUserUpdated }) => {
  const [form] = Form.useForm()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [accessLevels, setAccessLevels] = useState([])
  const [loadingAccessLevels, setLoadingAccessLevels] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [formData, setFormData] = useState({
    access_id: '',
    status: 'active',
  })
  const [originalData, setOriginalData] = useState(null)

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
      const status = (userData.mu_status || userData.status || 'active').toLowerCase()

      const initialData = {
        access_id: accessId,
        status: status,
      }

      setFormData(initialData)
      form.setFieldsValue(initialData)
      setHasChanges(false)

      fetchAccessLevels(initialData)
    }
  }, [isOpen, userData])

  const fetchAccessLevels = async (currentFormData) => {
    setLoadingAccessLevels(true)
    try {
      const response = await getAccessLevels()
      const levels = response.data || response || []
      setAccessLevels(Array.isArray(levels) ? levels : [])

      // If we don't have access_id but have access_name, try to find matching ID
      if (userData && !currentFormData.access_id && userInfo?.currentAccessName) {
        const matchedAccess = levels.find(
          (access) => (access.ma_name || access.name) === userInfo.currentAccessName,
        )
        if (matchedAccess) {
          const newAccessId = matchedAccess.ma_id || matchedAccess.id || ''
          const updatedData = {
            ...currentFormData,
            access_id: newAccessId,
          }
          setFormData(updatedData)
          form.setFieldsValue({ access_id: newAccessId })
        }
      }
    } catch (error) {
      console.error('Error fetching access levels:', error)
      message.error('Failed to load access levels')
    } finally {
      setLoadingAccessLevels(false)
    }
  }

  // Handle form submission
  const handleSubmit = async (values) => {
    if (!userInfo) return

    setIsSubmitting(true)

    try {
      // Prepare data for API
      const updateData = {
        access_id: values.access_id,
        status: values.status,
      }

      const response = await updateUser(userInfo.id, updateData)

      message.success('User updated successfully!')

      // Reset form after successful submission
      setTimeout(() => {
        if (onUserUpdated) {
          onUserUpdated(response.data)
        }
        onClose()
      }, 1500)
    } catch (error) {
      console.error('Error updating user:', error)
      message.error(error.message || 'Failed to update user. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle modal cancel
  const handleCancel = () => {
    if (!isSubmitting) {
      form.resetFields()
      onClose()
    }
  }

  // Handle form values change
  const handleValuesChange = (changedValues, allValues) => {
    if (!originalData) return

    const originalAccessId = originalData.mu_access_id || originalData.access_id || ''
    const originalStatus = (originalData.mu_status || originalData.status || 'active').toLowerCase()

    const hasFormChanges =
      allValues.access_id !== originalAccessId || allValues.status !== originalStatus

    setHasChanges(hasFormChanges)
    setFormData(allValues)
  }

  // Handle ESC key press
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape' && isOpen && !isSubmitting) {
        handleCancel()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscKey)
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey)
    }
  }, [isOpen, isSubmitting])

  // If modal is not open or userData is not provided, don't render anything
  if (!isOpen || !userData) return null

  return (
    <Modal
      title="Edit User"
      open={isOpen}
      onCancel={handleCancel}
      footer={null}
      width={800}
      centered
      maskClosable={true}
      keyboard={true}
      className="edit-user-modal"
      closable={!isSubmitting}
      styles={{
        body: {
          padding: '24px',
        },
      }}
      afterClose={() => {
        form.resetFields()
        setHasChanges(false)
      }}
    >
      {/* User Information (Read-only) */}
      <Card
        title="User Information"
        size="small"
        className="mb-6"
        styles={{
          header: {
            padding: '12px 16px',
            borderBottom: '1px solid #f0f0f0',
          },
          body: {
            padding: '16px',
          },
        }}
      >
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <div className="space-y-1">
              <Text type="secondary" className="text-xs">
                Full Name
              </Text>
              <div className="p-2 bg-gray-50 rounded border border-gray-200">
                <Text strong>{userInfo?.fullname || 'N/A'}</Text>
              </div>
            </div>
          </Col>
          <Col span={12}>
            <div className="space-y-1">
              <Text type="secondary" className="text-xs">
                Username
              </Text>
              <div className="p-2 bg-gray-50 rounded border border-gray-200">
                <Text strong>{userInfo?.username || 'N/A'}</Text>
              </div>
            </div>
          </Col>
          <Col span={12}>
            <div className="space-y-1">
              <Text type="secondary" className="text-xs">
                Email
              </Text>
              <div className="p-2 bg-gray-50 rounded border border-gray-200">
                <Text strong>{userInfo?.email || 'N/A'}</Text>
              </div>
            </div>
          </Col>
          <Col span={12}>
            <div className="space-y-1">
              <Text type="secondary" className="text-xs">
                Current Access Level
              </Text>
              <div className="p-2 bg-gray-50 rounded border border-gray-200">
                <Text strong>{userInfo?.currentAccessName || 'N/A'}</Text>
              </div>
            </div>
          </Col>
        </Row>
      </Card>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        onValuesChange={handleValuesChange}
        disabled={isSubmitting}
        size="large"
      >
        {/* Editable Fields */}
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <Form.Item
              label="Access Level"
              name="access_id"
              rules={[{ required: true, message: 'Please select access level!' }]}
            >
              <Select
                placeholder="Select access level"
                loading={loadingAccessLevels}
                notFoundContent={
                  loadingAccessLevels ? <Spin size="small" /> : 'No access levels found'
                }
                disabled={isSubmitting || loadingAccessLevels}
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) =>
                  (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
                }
              >
                <Option value="">Select access level</Option>
                {accessLevels.map((access) => (
                  <Option key={access.ma_id || access.id} value={access.ma_id || access.id}>
                    {access.ma_name || access.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Status" name="status">
              <Select disabled={isSubmitting}>
                <Option value="active">Active</Option>
                <Option value="inactive">Inactive</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        {/* Form Actions */}
        <Form.Item className="mb-0 mt-6">
          <div className="flex justify-between items-center pt-6 border-t border-slate-200">
            <div className="text-sm text-gray-500">
              {hasChanges ? (
                <span className="text-amber-600">You have unsaved changes</span>
              ) : (
                'No changes made'
              )}
            </div>
            <div className="flex gap-3">
              <Button
                onClick={handleCancel}
                disabled={isSubmitting}
                size="large"
                className="min-w-25"
              >
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={isSubmitting}
                disabled={isSubmitting || !hasChanges}
                size="large"
                className="min-w-25 bg-[#9C4A15] hover:bg-[#8a3f12] border-[#9C4A15]"
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default EditUser
