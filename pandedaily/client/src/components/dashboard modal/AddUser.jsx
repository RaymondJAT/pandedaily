import { useState, useEffect } from 'react'
import { Modal, Form, Input, Select, Button, message, Spin, Row, Col } from 'antd'
import { createUser, getAccessLevels } from '../../services/api'

const { Option } = Select

const AddUser = ({ isOpen, onClose, onUserAdded }) => {
  const [form] = Form.useForm()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [accessLevels, setAccessLevels] = useState([])
  const [loadingAccessLevels, setLoadingAccessLevels] = useState(false)

  // Fetch access levels when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchAccessLevels()
      form.resetFields()
    }
  }, [isOpen, form])

  const fetchAccessLevels = async () => {
    setLoadingAccessLevels(true)
    try {
      const response = await getAccessLevels()
      setAccessLevels(response.data || [])
    } catch (error) {
      console.error('Error fetching access levels:', error)
      message.error('Failed to load access levels')
    } finally {
      setLoadingAccessLevels(false)
    }
  }

  // Handle form submission
  const handleSubmit = async (values) => {
    setIsSubmitting(true)

    try {
      const userData = {
        ...values,
        status: values.status || 'active',
      }

      // Remove confirmPassword from the data sent to API
      delete userData.confirmPassword

      const response = await createUser(userData)

      message.success('User created successfully!')

      // Reset form
      form.resetFields()

      // Notify parent component
      if (onUserAdded) {
        onUserAdded(response.data)
      }

      // Close modal
      onClose()
    } catch (error) {
      console.error('Error creating user:', error)
      message.error(error.message || 'Failed to create user. Please try again.')
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
      return Promise.reject(new Error('The two passwords do not match!'))
    },
  })

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
      title="Add New User"
      open={isOpen}
      onCancel={handleCancel}
      footer={null}
      width={800}
      centered
      maskClosable={true}
      keyboard={true}
      className="add-user-modal"
      closable={!isSubmitting}
      styles={{
        body: {
          padding: '24px',
        },
      }}
      afterClose={() => {
        form.resetFields()
      }}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        disabled={isSubmitting}
        size="large"
        autoComplete="off"
      >
        {/* Row 1: Full Name | Username */}
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <Form.Item
              label="Full Name"
              name="fullname"
              rules={[
                { required: true, message: 'Please input full name!' },
                { min: 2, message: 'Full name must be at least 2 characters!' },
              ]}
            >
              <Input placeholder="Enter full name" disabled={isSubmitting} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Username"
              name="username"
              rules={[
                { required: true, message: 'Please input username!' },
                { min: 3, message: 'Username must be at least 3 characters!' },
              ]}
            >
              <Input placeholder="Enter username" disabled={isSubmitting} />
            </Form.Item>
          </Col>
        </Row>

        {/* Row 2: Email (full width) */}
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Form.Item
              label="Email"
              name="email"
              rules={[
                { required: true, message: 'Please input email!' },
                { type: 'email', message: 'Please enter a valid email!' },
              ]}
            >
              <Input placeholder="Enter email address" disabled={isSubmitting} />
            </Form.Item>
          </Col>
        </Row>

        {/* Row 3: Password | Confirm Password */}
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <Form.Item label="Password" name="password" rules={[{ validator: validatePassword }]}>
              <Input.Password placeholder="Enter password" disabled={isSubmitting} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Confirm Password"
              name="confirmPassword"
              dependencies={['password']}
              rules={[validateConfirmPassword]}
            >
              <Input.Password placeholder="Confirm password" disabled={isSubmitting} />
            </Form.Item>
          </Col>
        </Row>

        {/* Row 4: Access Level | Status */}
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
                {accessLevels.map((access) => (
                  <Option key={access.ma_id || access.id} value={access.ma_id || access.id}>
                    {access.ma_name || access.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Status" name="status" initialValue="active">
              <Select disabled={isSubmitting}>
                <Option value="active">Active</Option>
                <Option value="inactive">Inactive</Option>
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
              {isSubmitting ? 'Creating...' : 'Create User'}
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default AddUser
