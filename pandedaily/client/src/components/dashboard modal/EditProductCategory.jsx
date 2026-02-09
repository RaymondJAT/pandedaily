import { useState, useEffect, useMemo } from 'react'
import { Modal, Form, Input, Button, message, Row, Col } from 'antd'
import { updateProductCategory } from '../../services/api'

const EditProductCategory = ({ isOpen, onClose, categoryData, onCategoryUpdated }) => {
  const [form] = Form.useForm()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [initialValues, setInitialValues] = useState(null)

  // Extract category info from categoryData prop
  const categoryInfo = useMemo(() => {
    if (!categoryData) return null

    return {
      id: categoryData.id || categoryData.category_id,
      name: categoryData.name || categoryData.category_name || '',
      description: categoryData.description || '',
      status: categoryData.status || 'ACTIVE',
    }
  }, [categoryData])

  // Initialize form when modal opens
  useEffect(() => {
    if (isOpen && categoryData) {
      const values = {
        name: categoryInfo?.name || '',
        description: categoryInfo?.description || '',
      }

      setInitialValues(values)
      form.setFieldsValue(values)
      setHasUnsavedChanges(false)
    }
  }, [isOpen, categoryData])

  // Handle form submission
  const handleSubmit = async (values) => {
    if (!categoryInfo) {
      message.error('Category information not found')
      return
    }

    setIsSubmitting(true)

    try {
      const updateData = {
        name: values.name.trim(),
        description: values.description?.trim() || '',
      }

      const response = await updateProductCategory(categoryInfo.id, updateData)
      message.success('Product category updated successfully!')

      if (onCategoryUpdated) {
        onCategoryUpdated(response.data)
      }

      onClose()
    } catch (error) {
      console.error('Error updating product category:', error)
      message.error(error.message || 'Failed to update product category. Please try again.')
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

  if (!isOpen || !categoryData) return null

  return (
    <Modal
      title={`Edit Product Category: ${categoryInfo?.name || 'Category'}`}
      open={isOpen}
      onCancel={handleCancel}
      footer={null}
      width={600}
      centered
      maskClosable={true}
      keyboard={true}
      className="edit-product-category-modal"
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

          <Col span={24}>
            <Form.Item
              label="Description"
              name="description"
              rules={[{ max: 200, message: 'Description cannot exceed 200 characters!' }]}
            >
              <Input.TextArea
                rows={3}
                placeholder="Enter category description (optional)"
                maxLength={200}
                showCount
                disabled={isSubmitting}
              />
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

export default EditProductCategory
