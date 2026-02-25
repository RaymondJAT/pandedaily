import { useState, useEffect } from 'react'
import { Modal, Form, Input, Select, message } from 'antd'
import { createRoute, getAccessLevels } from '../../services/api'

const { Option } = Select

const AddRoute = ({ isOpen, onClose, onRouteAdded }) => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [accessLevels, setAccessLevels] = useState([])

  useEffect(() => {
    if (isOpen) {
      fetchAccessLevels()
    }
  }, [isOpen])

  const fetchAccessLevels = async () => {
    try {
      const response = await getAccessLevels()
      const data = response.data || response || []
      setAccessLevels(data)
    } catch (error) {
      console.error('Error fetching access levels:', error)
      message.error('Failed to load access levels')
    }
  }

  const handleSubmit = async (values) => {
    setLoading(true)
    try {
      await createRoute({
        access_id: values.accessId,
        route_name: values.routeName,
        status: values.status || 'VIEW',
      })
      form.resetFields()
      onRouteAdded()
      onClose()
    } catch (error) {
      console.error('Error adding route:', error)
      message.error(error.message || 'Failed to add route')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      title={
        <span style={{ color: '#9C4A15', fontSize: '18px', fontWeight: '600' }}>Add New Route</span>
      }
      open={isOpen}
      onCancel={onClose}
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
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        className="mt-4"
        initialValues={{ status: 'VIEW' }}
      >
        <Form.Item
          name="accessId"
          label="Access Level"
          rules={[{ required: true, message: 'Please select an access level' }]}
        >
          <Select placeholder="Select access level" size="large">
            {accessLevels.map((access) => (
              <Option key={access.ma_id || access.id} value={access.ma_id || access.id}>
                {access.ma_name || access.name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="routeName"
          label="Route Name"
          rules={[
            { required: true, message: 'Please enter route name' },
            {
              pattern: /^[a-zA-Z0-9\-_.]+$/,
              message:
                'Route name can only contain letters, numbers, hyphens, underscores, and dots',
            },
          ]}
          help="Example: dashboard, users, products.view, reports.sales"
        >
          <Input placeholder="dashboard" size="large" autoFocus />
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
