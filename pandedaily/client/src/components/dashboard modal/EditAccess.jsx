import { useState, useEffect, useMemo } from 'react'
import { Modal, Form, Input, Select, Button, message, Row, Col } from 'antd'
import { updateAccess } from '../../services/api'

const { Option } = Select

const EditAccess = ({ isOpen, onClose, accessData, onAccessUpdated }) => {
  const [form] = Form.useForm()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [initialValues, setInitialValues] = useState(null)

  // Extract access info from accessData prop using useMemo to prevent recreation
  const accessInfo = useMemo(() => {
    if (!accessData) return null

    // Convert API status to display format
    const apiStatus = accessData.ma_status || accessData.status || 'ACTIVE'
    let displayStatus = 'Active'

    if (apiStatus === 'INACTIVE') {
      displayStatus = 'Inactive'
    } else if (apiStatus === 'DELETED') {
      displayStatus = 'Deleted'
    }

    return {
      id: accessData.ma_id || accessData.id,
      name: accessData.ma_name || accessData.name || '',
      apiStatus: apiStatus,
      displayStatus: displayStatus,
    }
  }, [accessData])

  // Initialize form when modal opens
  useEffect(() => {
    if (isOpen && accessData) {
      // Set initial form values
      const values = {
        name: accessInfo?.name || '',
        status: accessInfo?.displayStatus || 'Active',
      }

      setInitialValues(values)
      form.setFieldsValue(values)
      setHasUnsavedChanges(false)
    }
  }, [isOpen]) // Only depend on isOpen

  // Handle form submission
  const handleSubmit = async (values) => {
    if (!accessInfo) {
      message.error('Access information not found')
      return
    }

    setIsSubmitting(true)

    try {
      // Transform values to match API expectations
      const updateData = {
        name: values.name.trim(),
        status:
          values.status === 'Active'
            ? 'ACTIVE'
            : values.status === 'Inactive'
              ? 'INACTIVE'
              : 'DELETED',
      }

      console.log('Updating access with data:', updateData)
      const response = await updateAccess(accessInfo.id, updateData)

      message.success('Access level updated successfully!')

      // Notify parent component
      if (onAccessUpdated) {
        onAccessUpdated(response.data)
      }

      // Close modal
      onClose()
    } catch (error) {
      console.error('Error updating access level:', error)
      message.error(error.message || 'Failed to update access level. Please try again.')
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
    if (!initialValues) return

    const hasChanges = Object.keys(allValues).some((key) => {
      const currentValue = allValues[key]
      const originalValue = initialValues[key] || ''
      return currentValue !== originalValue
    })

    setHasUnsavedChanges(hasChanges)
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

  // If modal is not open or accessData is not provided, don't render anything
  if (!isOpen || !accessData) return null

  return (
    <Modal
      title={`Edit Access: ${accessInfo?.name || 'Access Level'}`}
      open={isOpen}
      onCancel={handleCancel}
      footer={null}
      width={700}
      centered
      maskClosable={true}
      keyboard={true}
      className="edit-access-modal"
      closable={!isSubmitting}
      styles={{
        body: {
          padding: '24px',
        },
      }}
      afterClose={() => {
        form.resetFields()
        setHasUnsavedChanges(false)
        setInitialValues(null)
      }}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        onValuesChange={handleValuesChange}
        disabled={isSubmitting}
        size="large"
        autoComplete="off"
      >
        {/* Single Row for both inputs */}
        <Row gutter={[16, 0]}>
          <Col span={16}>
            <Form.Item
              label="Access Name"
              name="name"
              rules={[
                { required: true, message: 'Please input access name!' },
                { min: 2, message: 'Access name must be at least 2 characters!' },
                { max: 50, message: 'Access name cannot exceed 50 characters!' },
                {
                  validator: (_, value) => {
                    if (value && value.trim() === '') {
                      return Promise.reject(new Error('Name cannot be empty or just whitespace'))
                    }
                    return Promise.resolve()
                  },
                },
              ]}
            >
              <Input
                placeholder="Enter access level name (e.g., Administrator, Manager, etc.)"
                disabled={isSubmitting}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label="Status"
              name="status"
              rules={[{ required: true, message: 'Please select status!' }]}
            >
              <Select disabled={isSubmitting}>
                <Option value="Active">Active</Option>
                <Option value="Inactive">Inactive</Option>
                <Option value="Deleted">Deleted</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        {/* Form Actions */}
        <Form.Item className="mb-0 mt-6">
          <div className="flex justify-between items-center pt-6 border-t border-slate-200">
            <div className="text-sm text-gray-500">
              {hasUnsavedChanges ? (
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
                disabled={isSubmitting || !hasUnsavedChanges}
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

export default EditAccess
