import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useProducts } from '../../hooks/useProducts'
import { useOrderSelection } from '../../hooks/useOrderSelection'
import { fadeInUp, staggerContainer, faqItem } from '../../utils/animations'
import AuthChoiceModal from '../../components/website modal/AuthChoiceModal'
import PageHeader from '../../components/order/PageHeader'
import PageFooter from '../../components/order/PageFooter'
import Tabs from '../../components/order/Tabs'
import ProductGrid from '../../components/order/ProductGrid'
import OrderSummary from '../../components/order/OrderSummary'

const Order = () => {
  const { products, categories, loading, error, getAvailableProductsByCategory, isDesalProduct } =
    useProducts()

  const { user, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const [activeCategory, setActiveCategory] = useState('all')
  const [showAuthModal, setShowAuthModal] = useState(false)

  const {
    selectedProducts,
    desalCustomQuantities,
    desalQuantityTypes,
    validationError,
    validateSelectedProducts,
    addProduct,
    removeProduct,
    updateQuantity,
    updateDesalType,
    updateDesalCustomQuantity,
    clearAll,
    getTotals,
    setValidationError,
  } = useOrderSelection(products)

  // Get available products for the current category
  const displayedProducts = getAvailableProductsByCategory(activeCategory)

  // Function to get available product count for a category (for tabs)
  const getAvailableProductCount = (categoryId) => {
    return getAvailableProductsByCategory(categoryId).length
  }

  const handleProceedToCheckout = () => {
    if (selectedProducts.length === 0) {
      alert('Please select at least one product')
      return
    }

    const validation = validateSelectedProducts()
    if (!validation.isValid) {
      setValidationError(validation.message)
      const errorElement = document.getElementById('validation-error')
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
      return
    }

    setValidationError('')

    if (isAuthenticated && user) {
      const orderDetails = {
        products: selectedProducts,
        totalPieces: getTotals().totalItems,
        totalPricePerDelivery: getTotals().totalPrice,
      }

      localStorage.setItem('pendingOrder', JSON.stringify(orderDetails))
      localStorage.removeItem('selectedProducts')

      navigate('/checkout', { state: { orderDetails } })
    } else {
      setShowAuthModal(true)
    }
  }

  const handleGuestContinue = () => {
    alert('Please login or register to place an order')
    setShowAuthModal(false)
    navigate('/login', {
      state: {
        fromOrder: true,
        message: 'Please login or register to place your order',
      },
    })
  }

  const handleLoginRegister = () => {
    localStorage.setItem('selectedProducts', JSON.stringify(selectedProducts))
    setShowAuthModal(false)
    navigate('/login', {
      state: {
        fromOrder: true,
        message: 'Please login or register to complete your order',
      },
    })
  }

  if (loading.products || loading.categories) {
    return (
      <section
        className="min-h-screen py-8 md:py-12 font-[titleFont]"
        style={{ backgroundColor: '#F5EFE7' }}
      >
        <div className="container mx-auto px-4 flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#9C4A15]"></div>
        </div>
      </section>
    )
  }

  if (error.products) {
    return (
      <section
        className="min-h-screen py-8 md:py-12 font-[titleFont]"
        style={{ backgroundColor: '#F5EFE7' }}
      >
        <div className="container mx-auto px-4">
          <div className="text-center py-12 text-red-600">{error.products}</div>
        </div>
      </section>
    )
  }

  return (
    <section
      className="min-h-screen py-8 md:py-12 font-[titleFont]"
      style={{ backgroundColor: '#F5EFE7' }}
    >
      <div className="container mx-auto px-4">
        <PageHeader
          title="Your Daily Bread, Just a Click Away!"
          subtitle="Freshly baked, hand-kneaded, and zero preservatives. Order Now!"
          fadeInUp={fadeInUp}
          alignment="center"
        />

        <motion.div
          className="mx-auto"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, amount: 0.1 }}
          variants={staggerContainer}
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Products */}
            <motion.div className="lg:col-span-8" variants={faqItem}>
              <h2
                className="text-xl md:text-2xl font-light mb-6 font-[titleFont]"
                style={{ color: '#2A1803' }}
              >
                Select Products
              </h2>

              <div className="bg-white rounded-xl shadow-lg p-6 md:p-7 h-175 flex flex-col">
                <Tabs
                  categories={categories}
                  activeCategory={activeCategory}
                  onCategoryChange={setActiveCategory}
                  getProductCount={getAvailableProductCount}
                />

                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar min-h-0">
                  <ProductGrid
                    products={displayedProducts}
                    selectedProducts={selectedProducts}
                    onProductSelect={addProduct}
                    onQuantityChange={updateQuantity}
                    onDesalTypeChange={updateDesalType}
                    onDesalCustomChange={updateDesalCustomQuantity}
                    desalQuantityTypes={desalQuantityTypes}
                    desalCustomQuantities={desalCustomQuantities}
                    isDesalProduct={isDesalProduct}
                  />
                </div>
              </div>
            </motion.div>

            {/* Order Summary */}
            <motion.div className="lg:col-span-4" variants={faqItem} transition={{ delay: 0.1 }}>
              <h2
                className="text-xl md:text-2xl font-light mb-6 font-[titleFont]"
                style={{ color: '#2A1803' }}
              >
                Your Order
              </h2>

              <div className="bg-white rounded-xl shadow-lg p-6 md:p-7 sticky top-4 h-175 flex flex-col">
                <OrderSummary
                  selectedProducts={selectedProducts}
                  validationError={validationError}
                  totals={getTotals()}
                  user={user}
                  isAuthenticated={isAuthenticated}
                  onClearAll={clearAll}
                  onRemoveProduct={removeProduct}
                  onProceedToCheckout={handleProceedToCheckout}
                  isDesalProduct={isDesalProduct}
                />
              </div>
            </motion.div>
          </div>
        </motion.div>

        <PageFooter fadeInUp={faqItem} delay={0.3} accentColor="#9C4A15" textColor="#2A1803" />
      </div>

      <AuthChoiceModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onGuestContinue={handleGuestContinue}
        onLoginRegister={handleLoginRegister}
      />
    </section>
  )
}

export default Order
