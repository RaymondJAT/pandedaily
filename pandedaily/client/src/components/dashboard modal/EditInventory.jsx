import { useState, useEffect } from 'react'
import { Modal, Form, Input, Button, message, Row, Col, Statistic, Divider } from 'antd'
import { FiPackage, FiTrendingUp, FiTrendingDown, FiBox } from 'react-icons/fi'
import { updateInventory } from '../../services/api'

const EditInventory = ({ isOpen, onClose, inventoryData, onInventoryUpdated }) => {
  const [form] = Form.useForm()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [stockChange, setStockChange] = useState(0)

  // Set form values and calculate stock change when modal opens or inventoryData changes
  useEffect(() => {
    if (isOpen && inventoryData) {
      const currentStock = inventoryData.current_stock || 0
      form.setFieldsValue({
        current_stock: currentStock,
      })
      setStockChange(0) // Reset stock change when modal opens
    }
  }, [isOpen, inventoryData, form])

  // Handle form value changes to calculate stock change
  const handleFormChange = (changedValues) => {
    if (changedValues.current_stock !== undefined) {
      const newStock = parseInt(changedValues.current_stock) || 0
      const oldStock = inventoryData?.current_stock || 0
      setStockChange(newStock - oldStock)
    }
  }

  // Handle form submission
  const handleSubmit = async (values) => {
    setIsSubmitting(true)

    try {
      const newStock = parseInt(values.current_stock)
      const oldStock = inventoryData.current_stock || 0

      console.log('Updating inventory:', {
        inventoryId: inventoryData.id,
        oldStock,
        newStock,
      })

      const response = await updateInventory(inventoryData.id, {
        current_stock: newStock,
      })

      console.log('Update response:', response)

      message.success('Stock updated successfully!')

      // Reset form
      form.resetFields()

      // Notify parent component
      if (onInventoryUpdated) {
        onInventoryUpdated()
      }

      // Close modal
      onClose()
    } catch (error) {
      console.error('Error updating inventory:', error)
      console.error('Error details:', error.response?.data || error.message)
      message.error(
        error.response?.data?.message ||
          error.message ||
          'Failed to update stock. Please try again.',
      )
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

  if (!inventoryData) return null

  const oldStock = inventoryData.current_stock || 0
  const previousStock = inventoryData.previous_stock || 0

  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <FiPackage className="w-5 h-5 text-[#9C4A15]" />
          <span>Update Stock</span>
        </div>
      }
      open={isOpen}
      onCancel={handleCancel}
      footer={null}
      width={600}
      centered
      maskClosable={false}
      keyboard={true}
      className="edit-inventory-modal"
      closable={!isSubmitting}
      styles={{
        body: {
          padding: '24px',
        },
      }}
      afterClose={() => {
        form.resetFields()
        setStockChange(0)
      }}
    >
      {/* Product Information Card */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-slate-200">
        <div className="text-lg font-semibold text-gray-800 mb-2">{inventoryData.product_name}</div>

        <Row gutter={[16, 16]}>
          <Col span={12}>
            <Statistic
              title="Current Stock"
              value={oldStock}
              styles={{
                content: {
                  color: oldStock <= 10 ? (oldStock === 0 ? '#dc2626' : '#d97706') : '#059669',
                  fontSize: '24px',
                  fontWeight: '600',
                },
              }}
              prefix={
                <div className="mr-2">
                  <FiBox
                    className={`w-5 h-5 ${
                      oldStock === 0
                        ? 'text-red-500'
                        : oldStock <= 10
                          ? 'text-amber-500'
                          : 'text-green-500'
                    }`}
                  />
                </div>
              }
            />
          </Col>
          <Col span={12}>
            <Statistic
              title="Previous Stock"
              value={previousStock}
              styles={{
                content: {
                  color: '#6b7280',
                  fontSize: '24px',
                  fontWeight: '600',
                },
              }}
            />
          </Col>
        </Row>
      </div>

      {/* Stock Change Indicator - Fixed template literal syntax */}
      {stockChange !== 0 && (
        <div
          className={`mb-4 p-3 rounded-lg border ${
            stockChange > 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {stockChange > 0 ? (
              <>
                <FiTrendingUp className="w-4 h-4 text-green-600" />
                <span className="text-green-700 font-medium">Stock will increase by</span>
              </>
            ) : (
              <>
                <FiTrendingDown className="w-4 h-4 text-red-600" />
                <span className="text-red-700 font-medium">Stock will decrease by</span>
              </>
            )}
            <span className={`font-bold ${stockChange > 0 ? 'text-green-700' : 'text-red-700'}`}>
              {Math.abs(stockChange)}
            </span>
          </div>
        </div>
      )}

      <Divider className="my-6" />

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        onValuesChange={handleFormChange}
        disabled={isSubmitting}
        size="large"
        autoComplete="off"
      >
        {/* New Stock Input */}
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Form.Item
              label="New Current Stock"
              name="current_stock"
              rules={[
                { required: true, message: 'Please input current stock!' },
                { validator: validateNumber },
              ]}
              help="Changing stock will create a history record with appropriate status"
            >
              <Input
                type="number"
                placeholder="Enter new stock amount"
                disabled={isSubmitting}
                min={0}
                step={1}
                autoFocus
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
              disabled={isSubmitting}
              size="large"
              className="min-w-25 bg-[#9C4A15] hover:bg-[#8a3f12] border-[#9C4A15]"
            >
              {isSubmitting ? 'Updating...' : 'Update Stock'}
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default EditInventory
