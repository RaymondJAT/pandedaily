import { useState, useEffect } from 'react'
import { Modal, Form, Input, Button, message, Row, Col } from 'antd'
import { createProductCategory } from '../../services/api'

const AddProductCategory = ({ isOpen, onClose, onCategoryAdded }) => {
  const [form] = Form.useForm()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  // Handle form submission
  const handleSubmit = async (values) => {
    setIsSubmitting(true)

    try {
      const categoryData = {
        name: values.name.trim(),
      }

      const response = await createProductCategory(categoryData)
      message.success('Product category added successfully!')

      if (onCategoryAdded) {
        onCategoryAdded(response.data)
      }

      handleCancel()
    } catch (error) {
      console.error('Error adding product category:', error)
      message.error(error.message || 'Failed to add product category. Please try again.')
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
    const hasChanges = Object.keys(allValues).some(
      (key) => allValues[key] !== '' && allValues[key] !== undefined,
    )
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

  if (!isOpen) return null

  return (
    <Modal
      title="Add New Product Category"
      open={isOpen}
      onCancel={handleCancel}
      footer={null}
      width={600}
      centered
      maskClosable={true}
      keyboard={true}
      className="add-product-category-modal"
      closable={!isSubmitting}
      styles={{
        body: {
          padding: '24px',
        },
      }}
      afterClose={() => {
        form.resetFields()
        setHasUnsavedChanges(false)
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
        <Row gutter={[16, 0]}>
          <Col span={24}>
            <Form.Item
              label="Category Name"
              name="name"
              rules={[
                { required: true, message: 'Please input category name!' },
                { min: 2, message: 'Category name must be at least 2 characters!' },
                { max: 50, message: 'Category name cannot exceed 50 characters!' },
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
                placeholder="Enter category name (e.g., Electronics, Clothing, etc.)"
                disabled={isSubmitting}
              />
            </Form.Item>
          </Col>
        </Row>

        {/* Form Actions */}
        <Form.Item className="mb-0 mt-6">
          <div className="flex justify-between items-center pt-6 border-t border-slate-200">
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
                {isSubmitting ? 'Adding...' : 'Add Category'}
              </Button>
            </div>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default AddProductCategory
