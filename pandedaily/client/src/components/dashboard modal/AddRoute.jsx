import { useState, useEffect } from 'react'
import { Modal, Form, Input, Select, message } from 'antd'
import { createRoute } from '../../services/api'

const { Option } = Select

const AddRoute = ({ isOpen, onClose, onRouteAdded }) => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        form.resetFields()
      }, 100)
    }
  }, [isOpen, form])

  const handleSubmit = async (values) => {
    setLoading(true)
    try {
      await createRoute({
        route_name: values.routeName,
        status: values.status || 'FULL',
      })

      message.success('Route added successfully')
      form.resetFields()
      onRouteAdded()
      onClose()
    } catch (error) {
      console.error('Error adding route:', error)
      message.error(error.response?.data?.message || error.message || 'Failed to add route')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    form.resetFields()
    onClose()
  }

  return (
    <Modal
      title={
        <span style={{ color: '#9C4A15', fontSize: '18px', fontWeight: '600' }}>Add New Route</span>
      }
      open={isOpen}
      onCancel={handleCancel}
      onOk={() => form.submit()}
      okText="Add Route"
      cancelText="Cancel"
      confirmLoading={loading}
      okButtonProps={{
        style: {
          backgroundColor: '#9C4A15',
          borderColor: '#9C4A15',
        },
      }}
      destroyOnHidden={true}
      forceRender={false}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        className="mt-4"
        initialValues={{ status: 'FULL' }}
      >
        <Form.Item
          name="routeName"
          label="Route Name"
          rules={[
            { required: true, message: 'Please enter route name' },
            { min: 2, message: 'Route name must be at least 2 characters' },
            { max: 120, message: 'Route name cannot exceed 120 characters' },
            {
              pattern: /^[a-zA-Z0-9\-_.]+$/,
              message:
                'Route name can only contain letters, numbers, hyphens, underscores, and dots',
            },
          ]}
          help="Example: dashboard, users, products.view, reports.sales"
        >
          <Input
            placeholder="Enter route name (e.g., dashboard, users, reports)"
            size="large"
            autoFocus
          />
        </Form.Item>

        <Form.Item
          name="status"
          label="Default Permission"
          rules={[{ required: true, message: 'Please select default permission' }]}
        >
          <Select placeholder="Select default permission" size="large">
            <Option value="FULL">Full Access</Option>
            <Option value="VIEW">View Only</Option>
            <Option value="NO-ACCESS">No Access</Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default AddRoute
