import { useState, useEffect } from 'react'
import { Modal, Form, Input, Select, Button, message, Spin, Row, Col } from 'antd'
import { FiPackage } from 'react-icons/fi'
import { addInventory, getProducts } from '../../services/api'

const { Option } = Select

const AddInventory = ({ isOpen, onClose, onInventoryAdded }) => {
  const [form] = Form.useForm()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [products, setProducts] = useState([])
  const [loadingProducts, setLoadingProducts] = useState(false)

  // Fetch products when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchProducts()
      form.resetFields()
    }
  }, [isOpen, form])

  const fetchProducts = async () => {
    setLoadingProducts(true)
    try {
      const response = await getProducts()
      const productsData = response.data || response
      setProducts(Array.isArray(productsData) ? productsData : [])
    } catch (error) {
      console.error('Error fetching products:', error)
      message.error('Failed to load products')
    } finally {
      setLoadingProducts(false)
    }
  }

  // Handle form submission
  const handleSubmit = async (values) => {
    setIsSubmitting(true)

    try {
      const inventoryData = {
        product_id: parseInt(values.product_id),
        current_stock: parseInt(values.current_stock),
        previous_stock: parseInt(values.previous_stock || 0),
      }

      await addInventory(inventoryData)

      message.success('Inventory added successfully!')

      // Reset form
      form.resetFields()

      // Notify parent component
      if (onInventoryAdded) {
        onInventoryAdded()
      }

      // Close modal
      onClose()
    } catch (error) {
      console.error('Error adding inventory:', error)
      message.error(error.message || 'Failed to add inventory. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Number validation rule
  const validateNumber = (_, value) => {
    if (!value && value !== 0) {
      return Promise.reject('Please input a value!')
    }
    if (isNaN(value) || value < 0) {
      return Promise.reject('Please enter a valid non-negative number!')
    }
    return Promise.resolve()
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
      title={
        <div className="flex items-center gap-2">
          <FiPackage className="w-5 h-5 text-[#9C4A15]" />
          <span>Add New Inventory</span>
        </div>
      }
      open={isOpen}
      onCancel={handleCancel}
      footer={null}
      width={800}
      centered
      maskClosable={false}
      keyboard={true}
      className="add-inventory-modal"
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
        initialValues={{
          previous_stock: 0,
        }}
      >
        {/* Row 1: Product Selection */}
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Form.Item
              label="Product"
              name="product_id"
              rules={[{ required: true, message: 'Please select a product!' }]}
            >
              <Select
                placeholder="Select a product"
                loading={loadingProducts}
                notFoundContent={loadingProducts ? <Spin size="small" /> : 'No products available'}
                disabled={isSubmitting || loadingProducts || products.length === 0}
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) =>
                  (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
                }
                allowClear
              >
                {products.map((product) => (
                  <Option key={product.id || product.p_id} value={product.id || product.p_id}>
                    {product.name || product.p_name || `Product ${product.id || product.p_id}`}
                    {product.category_name ? ` (${product.category_name})` : ''}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            {products.length === 0 && !loadingProducts && (
              <div className="text-sm text-red-500 mt-1 mb-4">
                No products available. Please add products first.
              </div>
            )}
          </Col>
        </Row>

        {/* Row 2: Current Stock | Previous Stock */}
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <Form.Item
              label="Current Stock"
              name="current_stock"
              rules={[
                { required: true, message: 'Please input current stock!' },
                { validator: validateNumber },
              ]}
            >
              <Input
                type="number"
                placeholder="Enter current stock"
                disabled={isSubmitting}
                min={0}
                step={1}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Previous Stock"
              name="previous_stock"
              rules={[{ validator: validateNumber }]}
            >
              <Input
                type="number"
                placeholder="Enter previous stock"
                disabled={isSubmitting}
                min={0}
                step={1}
              />
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
              disabled={isSubmitting || products.length === 0}
              size="large"
              className="min-w-25 bg-[#9C4A15] hover:bg-[#8a3f12] border-[#9C4A15]"
            >
              {isSubmitting ? 'Adding...' : 'Add Inventory'}
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default AddInventory
