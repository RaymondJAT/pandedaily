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
  Spin,
} from 'antd'
import { PlusOutlined, LoadingOutlined } from '@ant-design/icons'
import { createProduct, getProductCategories } from '../../services/api'

const { Option } = Select

const AddProduct = ({ isOpen, onClose, onProductAdded }) => {
  const [form] = Form.useForm()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [categories, setCategories] = useState([])
  const [imageFile, setImageFile] = useState(null)
  const [loadingCategories, setLoadingCategories] = useState(false)
  const [categoryError, setCategoryError] = useState('')

  // Fetch categories when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchCategories()
    }
  }, [isOpen])

  // Fetch categories from API
  const fetchCategories = async () => {
    setLoadingCategories(true)
    setCategoryError('')
    try {
      const response = await getProductCategories()
      if (response.data && Array.isArray(response.data)) {
        const activeCategories = response.data
          .filter((cat) => cat.status !== 'DELETED')
          .sort((a, b) => a.name.localeCompare(b.name))

        setCategories(activeCategories)
      } else {
        setCategories([])
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
      setCategoryError('Failed to load categories. Please try again.')
      message.error('Failed to load categories')
    } finally {
      setLoadingCategories(false)
    }
  }

  // Handle form submission
  const handleSubmit = async (values) => {
    setIsSubmitting(true)

    try {
      const formData = new FormData()
      formData.append('name', values.name.trim())
      formData.append('price', values.price)
      formData.append('stock_quantity', values.stockQuantity)
      formData.append('category_id', values.category)

      if (imageFile) {
        formData.append('image', imageFile)
      }

      const response = await createProduct(formData)
      message.success('Product added successfully!')

      if (onProductAdded) {
        onProductAdded(response.data)
      }

      handleCancel()
    } catch (error) {
      console.error('Error adding product:', error)
      message.error(error.message || 'Failed to add product. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle modal cancel
  const handleCancel = () => {
    if (!isSubmitting) {
      form.resetFields()
      setImageFile(null)
      onClose()
    }
  }

  // Handle form values change
  const handleValuesChange = (changedValues, allValues) => {
    const hasChanges = Object.keys(allValues).some(
      (key) => allValues[key] !== '' && allValues[key] !== undefined && allValues[key] !== null,
    )
    setHasUnsavedChanges(hasChanges || !!imageFile)
  }

  // Handle image upload
  const handleImageUpload = (file) => {
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

    // Check image dimensions (optional)
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        if (img.width < 100 || img.height < 100) {
          message.error('Image should be at least 100x100 pixels')
          setImageFile(null)
          return false
        }
      }
      img.src = e.target.result
    }
    reader.readAsDataURL(file)

    setImageFile(file)
    setHasUnsavedChanges(true)
    return false // Prevent automatic upload
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

  // Format peso currency
  const pesoFormatter = (value) => {
    if (!value) return '₱ 0'
    return `₱ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  }

  const pesoParser = (value) => {
    return value.replace(/₱\s?|(,*)/g, '')
  }

  if (!isOpen) return null

  return (
    <Modal
      title="Add New Product"
      open={isOpen}
      onCancel={handleCancel}
      footer={null}
      width={800}
      centered
      maskClosable={true}
      keyboard={true}
      className="add-product-modal"
      closable={!isSubmitting}
      styles={{
        body: {
          padding: '24px',
        },
      }}
      afterClose={() => {
        form.resetFields()
        setHasUnsavedChanges(false)
        setImageFile(null)
        setCategoryError('')
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
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <Form.Item
              label="Product Name"
              name="name"
              rules={[
                { required: true, message: 'Please input product name!' },
                { min: 2, message: 'Product name must be at least 2 characters!' },
                { max: 100, message: 'Product name cannot exceed 100 characters!' },
                {
                  validator: (_, value) => {
                    if (value && value.trim().length < 2) {
                      return Promise.reject(new Error('Product name must be at least 2 characters'))
                    }
                    return Promise.resolve()
                  },
                },
              ]}
            >
              <Input placeholder="Enter product name" disabled={isSubmitting} allowClear />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="Category"
              name="category"
              rules={[{ required: true, message: 'Please select category!' }]}
              help={categoryError}
              validateStatus={categoryError ? 'error' : ''}
            >
              <Select
                placeholder={
                  loadingCategories ? (
                    <span>
                      <Spin indicator={<LoadingOutlined style={{ fontSize: 14 }} spin />} /> Loading
                      categories...
                    </span>
                  ) : (
                    'Select category'
                  )
                }
                disabled={isSubmitting || loadingCategories}
                allowClear
                showSearch
                filterOption={(input, option) =>
                  option.children.toLowerCase().includes(input.toLowerCase())
                }
                notFoundContent={
                  loadingCategories ? (
                    <div className="py-2 text-center">
                      <Spin size="small" />
                    </div>
                  ) : (
                    <div className="py-2 text-center text-gray-500">No categories found</div>
                  )
                }
                dropdownRender={(menu) => (
                  <>
                    {menu}
                    {categories.length === 0 && !loadingCategories && (
                      <div className="p-2 text-center text-gray-500">
                        No categories available. Please add categories first.
                      </div>
                    )}
                  </>
                )}
              >
                {categories.map((category) => (
                  <Option
                    key={category.id || category.category_id}
                    value={category.id || category.category_id}
                  >
                    {category.name || category.category_name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="Price"
              name="price"
              rules={[
                { required: true, message: 'Please input price!' },
                {
                  type: 'number',
                  min: 0.01,
                  message: 'Price must be greater than ₱0.00!',
                },
                {
                  validator: (_, value) => {
                    if (value && value > 99999999.99) {
                      return Promise.reject(new Error('Price cannot exceed ₱99,999,999.99'))
                    }
                    return Promise.resolve()
                  },
                },
              ]}
            >
              <InputNumber
                placeholder="0.00"
                min={0}
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
              label="Stock Quantity"
              name="stockQuantity"
              rules={[
                { required: true, message: 'Please input stock quantity!' },
                { type: 'number', min: 0, message: 'Quantity cannot be negative!' },
                {
                  validator: (_, value) => {
                    if (value && value > 999999) {
                      return Promise.reject(new Error('Quantity cannot exceed 999,999'))
                    }
                    return Promise.resolve()
                  },
                },
              ]}
            >
              <InputNumber
                placeholder="0"
                min={0}
                style={{ width: '100%' }}
                disabled={isSubmitting}
                precision={0}
              />
            </Form.Item>
          </Col>

          <Col span={24}>
            <Form.Item
              label="Product Image (Optional)"
              help="Supported formats: JPG, PNG, GIF. Max size: 2MB. Recommended: 500x500px"
            >
              <div className="space-y-2">
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
                        alt="product"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        className="rounded"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-30 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-white text-sm">Change Image</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center">
                      <PlusOutlined />
                      <div style={{ marginTop: 8 }}>Upload Image</div>
                    </div>
                  )}
                </Upload>
                {imageFile && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">
                      {imageFile.name} • {(imageFile.size / 1024).toFixed(2)} KB
                    </span>
                    <Button
                      type="text"
                      danger
                      size="small"
                      onClick={() => {
                        setImageFile(null)
                        setHasUnsavedChanges(true)
                      }}
                      disabled={isSubmitting}
                      className="ml-2"
                    >
                      Remove
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
                disabled={isSubmitting || !hasUnsavedChanges || loadingCategories}
                size="large"
                className="min-w-25 bg-[#9C4A15] hover:bg-[#8a3f12] border-[#9C4A15]"
              >
                {isSubmitting ? 'Adding...' : 'Add Product'}
              </Button>
            </div>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default AddProduct
