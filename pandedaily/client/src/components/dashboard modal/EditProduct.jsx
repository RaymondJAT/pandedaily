import { useState, useEffect, useMemo } from 'react'
import {
  Modal,
  Form,
  Input,
  Select,
  Button,
  message,
  Row,
  Col,
  InputNumber,
  Upload,
  Image,
  Spin,
} from 'antd'
import { PlusOutlined, LoadingOutlined } from '@ant-design/icons'
import { updateProduct } from '../../services/api'

const { Option } = Select

const EditProduct = ({ isOpen, onClose, productData, onProductUpdated, categories = [] }) => {
  const [form] = Form.useForm()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [initialValues, setInitialValues] = useState(null)
  const [imageFile, setImageFile] = useState(null)
  const [existingImage, setExistingImage] = useState('')
  const [imageBase64, setImageBase64] = useState(undefined)
  const [formInitialized, setFormInitialized] = useState(false)

  // Extract product info from productData prop
  const productInfo = useMemo(() => {
    if (!productData) return null

    console.log('EditProduct - productData:', {
      id: productData.id,
      name: productData.name,
      category_id: productData.category_id,
      category_name: productData.category_name,
    })

    return {
      id: productData.id || 0,
      name: productData.name || '',
      price:
        typeof productData.price === 'string'
          ? parseFloat(productData.price)
          : productData.price || 0,
      cost:
        typeof productData.cost === 'string' ? parseFloat(productData.cost) : productData.cost || 0,
      category_id: productData.category_id || undefined,
      category_name: productData.category_name || '',
      image: productData.image || '',
      status: (productData.status || 'AVAILABLE').toLowerCase(),
    }
  }, [productData])

  // Filter active categories
  const activeCategories = useMemo(() => {
    return (categories || [])
      .filter((cat) => cat.status !== 'DELETED' && cat.pc_status !== 'DELETED')
      .sort((a, b) => (a.name || a.pc_name || '').localeCompare(b.name || b.pc_name || ''))
  }, [categories])

  // Find category by ID
  const findCategoryById = (categoryId) => {
    if (!categoryId || !activeCategories.length) return null
    return activeCategories.find((cat) => (cat.id || cat.pc_id) == categoryId)
  }

  // Initialize form when modal opens
  useEffect(() => {
    if (isOpen && productInfo && !formInitialized) {
      console.log('Initializing form with productInfo:', productInfo)

      let categoryId = productInfo.category_id
      let selectedCategory = null

      // Try to find category by ID
      if (categoryId) {
        selectedCategory = findCategoryById(categoryId)
      }

      // If not found by ID, try by name (fallback)
      if (!selectedCategory && productInfo.category_name) {
        const matchedCategory = activeCategories.find(
          (cat) =>
            (cat.name || cat.pc_name || '').toLowerCase() ===
            productInfo.category_name.toLowerCase(),
        )
        if (matchedCategory) {
          categoryId = matchedCategory.id || matchedCategory.pc_id
          selectedCategory = matchedCategory
        }
      }

      const initialFormValues = {
        name: productInfo.name,
        price: productInfo.price,
        cost: productInfo.cost,
        status: productInfo.status,
        category: categoryId,
      }

      console.log('Setting form values:', initialFormValues)

      setInitialValues(initialFormValues)
      setExistingImage(productInfo.image || '')
      setFormInitialized(true)

      setTimeout(() => {
        if (form && isOpen) {
          form.setFieldsValue(initialFormValues)
        }
      }, 50)

      setHasUnsavedChanges(false)
      setImageFile(null)
      setImageBase64(undefined)
    }
  }, [isOpen, productInfo, activeCategories, form, formInitialized])

  // Reset when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFormInitialized(false)
      setInitialValues(null)
      setImageFile(null)
      setImageBase64(undefined)
      setExistingImage('')
      setHasUnsavedChanges(false)
    }
  }, [isOpen])

  // Handle form submission
  const handleSubmit = async (values) => {
    if (!productInfo) {
      message.error('Product information not found')
      return
    }

    console.log('Submitting form with values:', values)

    setIsSubmitting(true)

    try {
      const productUpdateData = {
        name: values.name.trim(),
        category_id: values.category ? Number(values.category) : null,
        price: parseFloat(values.price),
        cost: parseFloat(values.cost),
        status: values.status === 'available' ? 'AVAILABLE' : 'UNAVAILABLE',
      }

      if (imageBase64 !== undefined) {
        productUpdateData.image = imageBase64 || ''
      }

      console.log('Sending update to backend:', productUpdateData)

      const response = await updateProduct(productInfo.id, productUpdateData)
      console.log('Update response:', response)

      message.success('Product updated successfully!')

      if (onProductUpdated) {
        onProductUpdated()
      }

      onClose()
    } catch (error) {
      console.error('Error updating product:', error)
      message.error(
        error.response?.data?.message ||
          error.message ||
          'Failed to update product. Please try again.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle modal cancel
  const handleCancel = () => {
    if (!isSubmitting) {
      onClose()
    }
  }

  // Handle form values change
  const handleValuesChange = (changedValues, allValues) => {
    if (!initialValues) return

    const hasChanges = Object.keys(allValues).some((key) => {
      const currentValue = allValues[key]
      const originalValue = initialValues[key]

      if (currentValue == null && originalValue == null) return false
      if (currentValue == null || originalValue == null) return true

      if (typeof currentValue === 'number' && typeof originalValue === 'number') {
        return currentValue !== originalValue
      }

      if (key === 'category') {
        return String(currentValue) !== String(originalValue)
      }

      return String(currentValue) !== String(originalValue)
    })

    const imageChanged = imageBase64 !== undefined
    setHasUnsavedChanges(hasChanges || imageChanged)
  }

  // Convert image file to base64
  const convertImageToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result)
      reader.onerror = (error) => reject(error)
    })
  }

  // Handle image upload
  const handleImageUpload = async (file) => {
    const isImage = file.type.startsWith('image/')
    if (!isImage) {
      message.error('You can only upload image files!')
      return false
    }

    const isLt2M = file.size / 1024 / 1024 < 2
    if (!isLt2M) {
      message.error('Image must be smaller than 2MB!')
      return false
    }

    try {
      const base64 = await convertImageToBase64(file)
      setImageFile(file)
      setImageBase64(base64)
      setHasUnsavedChanges(true)
    } catch (error) {
      console.error('Error converting image:', error)
      message.error('Failed to process image. Please try again.')
    }

    return false
  }

  // Handle image removal
  const handleRemoveImage = () => {
    if (imageFile) {
      setImageFile(null)
      setImageBase64('')
    } else {
      setExistingImage('')
      setImageBase64('')
    }
    setHasUnsavedChanges(true)
  }

  // Format peso currency
  const pesoFormatter = (value) => {
    if (!value && value !== 0) return '₱ 0'
    return `₱ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  }

  const pesoParser = (value) => {
    return value.replace(/₱\s?|(,*)/g, '')
  }

  // Get current category name for display
  const currentCategoryName = useMemo(() => {
    if (!productInfo) return ''
    const categoryById = findCategoryById(productInfo.category_id)
    return categoryById
      ? categoryById.name || categoryById.pc_name || ''
      : productInfo.category_name || ''
  }, [productInfo, activeCategories])

  if (!isOpen || !productData) return null

  return (
    <Modal
      title={`Edit Product: ${productInfo?.name || 'Product'}`}
      open={isOpen}
      onCancel={handleCancel}
      footer={null}
      width={800}
      centered
      maskClosable={!isSubmitting}
      keyboard={!isSubmitting}
      className="edit-product-modal"
      closable={!isSubmitting}
      destroyOnHidden={true}
      afterClose={() => {
        form.resetFields()
      }}
    >
      {!formInitialized ? (
        <div className="text-center py-8">
          <Spin size="large" />
          <p className="mt-4 text-gray-600">Loading product data...</p>
        </div>
      ) : (
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          onValuesChange={handleValuesChange}
          disabled={isSubmitting}
          size="large"
          autoComplete="off"
        >
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Form.Item
                label="Product Name"
                name="name"
                rules={[
                  { required: true, message: 'Please input product name!' },
                  { min: 2, message: 'Product name must be at least 2 characters!' },
                  { max: 100, message: 'Product name cannot exceed 100 characters!' },
                ]}
              >
                <Input placeholder="Enter product name" disabled={isSubmitting} />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Category"
                name="category"
                rules={[{ required: true, message: 'Please select category!' }]}
                extra={
                  currentCategoryName && (
                    <span className="text-xs text-gray-500">
                      Current category: {currentCategoryName}
                    </span>
                  )
                }
              >
                <Select
                  placeholder={`Select category (current: ${currentCategoryName || 'none'})`}
                  disabled={isSubmitting}
                  allowClear
                  showSearch
                  filterOption={(input, option) =>
                    (option?.children || '').toLowerCase().includes(input.toLowerCase())
                  }
                  loading={!categories}
                  optionFilterProp="children"
                >
                  {activeCategories.map((category) => {
                    const categoryId = category.id || category.pc_id
                    const categoryName = category.name || category.pc_name
                    return (
                      <Option key={categoryId} value={categoryId}>
                        {categoryName}
                      </Option>
                    )
                  })}
                </Select>
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Selling Price"
                name="price"
                rules={[
                  { required: true, message: 'Please input price!' },
                  {
                    type: 'number',
                    min: 0.01,
                    message: 'Price must be greater than ₱0.00!',
                  },
                ]}
              >
                <InputNumber
                  placeholder="0.00"
                  min={0.01}
                  step={0.01}
                  style={{ width: '100%' }}
                  disabled={isSubmitting}
                  formatter={pesoFormatter}
                  parser={pesoParser}
                  precision={2}
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Cost Price"
                name="cost"
                rules={[
                  { required: true, message: 'Please input cost price!' },
                  {
                    type: 'number',
                    min: 0.01,
                    message: 'Cost must be greater than ₱0.00!',
                  },
                ]}
                help="Production cost of the product"
              >
                <InputNumber
                  placeholder="0.00"
                  min={0.01}
                  step={0.01}
                  style={{ width: '100%' }}
                  disabled={isSubmitting}
                  formatter={pesoFormatter}
                  parser={pesoParser}
                  precision={2}
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Status"
                name="status"
                rules={[{ required: true, message: 'Please select status!' }]}
              >
                <Select disabled={isSubmitting}>
                  <Option value="available">Available</Option>
                  <Option value="unavailable">Unavailable</Option>
                </Select>
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item
                label="Product Image"
                help="Supported formats: JPG, PNG, GIF. Max size: 2MB. Recommended: 500x500px"
              >
                <div className="space-y-4">
                  <div className="flex items-start gap-4 flex-wrap">
                    {existingImage && (
                      <div className="relative group">
                        <div className="relative w-32 h-32 overflow-hidden rounded border border-gray-300">
                          <Image
                            src={existingImage}
                            alt="current product"
                            width={128}
                            height={128}
                            className="object-cover w-full h-full"
                            preview={{ mask: 'Preview' }}
                          />
                        </div>
                        <div className="mt-2 text-xs text-gray-600 text-center">Current Image</div>
                      </div>
                    )}

                    <div className="relative">
                      <Upload
                        name="image"
                        listType="picture-card"
                        showUploadList={false}
                        beforeUpload={handleImageUpload}
                        accept="image/*"
                        disabled={isSubmitting}
                      >
                        {imageFile ? (
                          <div className="relative w-full h-full">
                            <img
                              src={URL.createObjectURL(imageFile)}
                              alt="new product"
                              className="w-full h-full object-cover rounded"
                            />
                          </div>
                        ) : (
                          <div className="text-center">
                            <PlusOutlined />
                            <div style={{ marginTop: 8 }}>
                              {existingImage ? 'Replace Image' : 'Upload Image'}
                            </div>
                          </div>
                        )}
                      </Upload>
                    </div>
                  </div>

                  {(imageFile || existingImage) && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">
                        {imageFile
                          ? `${imageFile.name} • ${(imageFile.size / 1024).toFixed(2)} KB`
                          : 'Current image will be kept unless replaced'}
                      </span>
                      <Button
                        type="text"
                        danger
                        size="small"
                        onClick={handleRemoveImage}
                        disabled={isSubmitting}
                        className="ml-2"
                      >
                        {imageFile ? 'Remove New Image' : 'Remove Current Image'}
                      </Button>
                    </div>
                  )}
                </div>
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
      )}
    </Modal>
  )
}

export default EditProduct
