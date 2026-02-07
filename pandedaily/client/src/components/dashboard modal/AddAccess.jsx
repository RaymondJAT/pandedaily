import { useState, useEffect } from 'react'
import { Modal, Form, Input, Select, Button, message, Row, Col } from 'antd'
import { createAccess } from '../../services/api'

const { Option } = Select

const AddAccess = ({ isOpen, onClose, onAccessAdded }) => {
  const [form] = Form.useForm()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      form.resetFields()
    }
  }, [isOpen, form])

  // Handle form submission
  const handleSubmit = async (values) => {
    setIsSubmitting(true)

    try {
      const accessData = {
        name: values.name,
        status: values.status === 'Active' ? 1 : 0,
        ma_name: values.name,
        ma_status: values.status,
      }

      const response = await createAccess(accessData)

      message.success('Access level created successfully!')

      // Reset form
      form.resetFields()

      // Notify parent component
      if (onAccessAdded) {
        onAccessAdded(response.data)
      }

      // Close modal
      onClose()
    } catch (error) {
      console.error('Error creating access level:', error)
      message.error(error.message || 'Failed to create access level. Please try again.')
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

  return (
    <Modal
      title="Add New Access Level"
      open={isOpen}
      onCancel={handleCancel}
      footer={null}
      width={700} 
      centered
      maskClosable={true}
      keyboard={true}
      className="add-access-modal"
      closable={!isSubmitting}
      styles={{
        body: {
          padding: '24px',
        },
      }}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        disabled={isSubmitting}
        size="large"
        autoComplete="off"
        initialValues={{
          status: 'Active',
        }}
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
              </Select>
            </Form.Item>
          </Col>
        </Row>

        {/* Form Actions */}
        <Form.Item className="mb-0 mt-6">
          <div className="flex justify-end gap-3 pt-6 border-t border-slate-200">
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
              disabled={isSubmitting}
              size="large"
              className="min-w-25 bg-[#9C4A15] hover:bg-[#8a3f12] border-[#9C4A15]"
            >
              {isSubmitting ? 'Creating...' : 'Create Access'}
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default AddAccess
