import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import AuthChoiceModal from '../../components/website modal/AuthChoiceModal'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { getProducts, getProductCategories } from '../../services/api'
import { FiPackage, FiCoffee, FiBattery, FiTrash2 } from 'react-icons/fi'

const Order = () => {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedProducts, setSelectedProducts] = useState([])
  const [loadingProducts, setLoadingProducts] = useState(false)
  const [loadingCategories, setLoadingCategories] = useState(false)
  const [productError, setProductError] = useState('')
  const [categoryError, setCategoryError] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [desalCustomQuantities, setDesalCustomQuantities] = useState({})
  const [desalQuantityTypes, setDesalQuantityTypes] = useState({})
  const [validationError, setValidationError] = useState('')

  // Get user authentication status
  const { user, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  // Fetch products and categories on component mount
  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [])

  // Restore selected products from localStorage after products are loaded
  useEffect(() => {
    if (products.length > 0) {
      const savedSelectedProducts = localStorage.getItem('selectedProducts')
      if (savedSelectedProducts) {
        try {
          const parsed = JSON.parse(savedSelectedProducts)

          // Filter out any products that no longer exist in the current product list
          const validProducts = parsed.filter((savedProduct) =>
            products.some((product) => product.id === savedProduct.id),
          )

          setSelectedProducts(validProducts)

          // Restore desal-specific states
          const desalQuantities = {}
          const desalTypes = {}

          validProducts.forEach((product) => {
            if (isDesalProduct(product)) {
              if (product.quantity === 20) desalTypes[product.id] = '20'
              else if (product.quantity === 40) desalTypes[product.id] = '40'
              else {
                desalTypes[product.id] = 'custom'
                desalQuantities[product.id] = product.quantity.toString()
              }
            }
          })

          setDesalQuantityTypes(desalTypes)
          setDesalCustomQuantities(desalQuantities)

          // Clear the saved products after restoring
          localStorage.removeItem('selectedProducts')
        } catch (error) {
          console.error('Error restoring selected products:', error)
        }
      }
    }
  }, [products])

  const fetchProducts = async () => {
    setLoadingProducts(true)
    try {
      const response = await getProducts()
      const productsData = response.data || response
      setProducts(Array.isArray(productsData) ? productsData : [])
    } catch (error) {
      console.error('Error fetching products:', error)
      setProductError('Failed to load products')
    } finally {
      setLoadingProducts(false)
    }
  }

  const fetchCategories = async () => {
    setLoadingCategories(true)
    try {
      const response = await getProductCategories()
      const categoriesData = response.data || []

      // Transform API categories to our format
      const transformedCategories = [
        { id: 'all', name: 'All Products', icon: FiPackage },
        ...categoriesData.map((cat) => ({
          id: cat.id?.toString() || cat.category_id?.toString() || cat.name?.toLowerCase(),
          name: cat.name || cat.category_name || 'Unnamed Category',
          icon: getCategoryIcon(cat.name || cat.category_name || ''),
          originalData: cat,
        })),
      ]

      setCategories(transformedCategories)
    } catch (error) {
      console.error('Error fetching categories:', error)
      setCategoryError('Failed to load categories')
      setCategories([
        { id: 'all', name: 'All Products', icon: FiPackage },
        { id: 'pandesal', name: 'Pandesal', icon: FiPackage },
        { id: 'bread', name: 'Other Breads', icon: FiPackage },
        { id: 'drink', name: 'Drinks', icon: FiCoffee },
        { id: 'other', name: 'Other Items', icon: FiBattery },
      ])
    } finally {
      setLoadingCategories(false)
    }
  }

  const getCategoryIcon = (categoryName) => {
    const name = categoryName?.toLowerCase() || ''
    if (name.includes('pandesal') || name.includes('bread')) return FiPackage
    if (name.includes('drink') || name.includes('beverage') || name.includes('coffee'))
      return FiCoffee
    return FiBattery
  }

  // Animation variants
  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.7, ease: 'easeOut' },
  }

  const fadeIn = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.8, ease: 'easeOut' },
  }

  const staggerContainer = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const faqItem = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, ease: 'easeOut' },
  }

  const isDesalProduct = (product) => {
    return (
      product.name?.toLowerCase().includes('desal') ||
      product.name?.toLowerCase().includes('pandesal')
    )
  }

  // Get product category
  const getProductCategory = (product) => {
    if (isDesalProduct(product)) return 'pandesal'

    // Use API category if available
    if (product.category_id || product.product_category_id) {
      return product.category_id?.toString() || product.product_category_id?.toString()
    }

    // Fallback to name-based categorization
    if (product.category_name?.toLowerCase().includes('bread')) return 'bread'
    if (product.category_name?.toLowerCase().includes('drink')) return 'drink'
    if (product.category?.toLowerCase().includes('bread')) return 'bread'
    if (product.category?.toLowerCase().includes('drink')) return 'drink'

    return 'other'
  }

  // Save selected products to localStorage
  const saveSelectedProducts = (products) => {
    localStorage.setItem('selectedProducts', JSON.stringify(products))
  }

  // Validate all selected products meet minimum quantity requirements
  const validateSelectedProducts = () => {
    for (const product of selectedProducts) {
      if (isDesalProduct(product)) {
        if (product.quantity < 20) {
          return {
            isValid: false,
            message: `"${product.name}" requires a minimum quantity of 20 pieces. Current quantity: ${product.quantity}`,
          }
        }
      }
    }
    return { isValid: true, message: '' }
  }

  // Product handlers
  const handleProductSelect = (product) => {
    setSelectedProducts((prev) => {
      let newSelected
      const exists = prev.find((p) => p.id === product.id)

      if (exists) {
        newSelected = prev.filter((p) => p.id !== product.id)
      } else {
        // Set initial quantity based on product type
        let initialQuantity = 1

        if (isDesalProduct(product)) {
          const productType = desalQuantityTypes[product.id] || '20'
          if (productType === 'custom') {
            initialQuantity = parseInt(desalCustomQuantities[product.id]) || 20
          } else {
            initialQuantity = parseInt(productType)
          }
        } else if (
          getProductCategory(product) === 'bread' ||
          getProductCategory(product) === 'pandesal'
        ) {
          initialQuantity = 20
        }

        newSelected = [
          ...prev,
          {
            ...product,
            quantity: initialQuantity,
            price: product.price,
          },
        ]
      }

      saveSelectedProducts(newSelected)
      // Clear any validation error when products change
      setValidationError('')
      return newSelected
    })
  }

  const handleProductQuantityChange = (productId, quantity) => {
    setSelectedProducts((prev) => {
      const newSelected = prev.map((p) => {
        if (p.id === productId) {
          const minQty = isDesalProduct(p) ? 20 : 1
          return {
            ...p,
            quantity: Math.max(minQty, parseInt(quantity) || minQty),
          }
        }
        return p
      })

      saveSelectedProducts(newSelected)
      // Clear any validation error when quantities change
      setValidationError('')
      return newSelected
    })
  }

  const handleDesalQuantityTypeChange = (productId, type) => {
    setDesalQuantityTypes((prev) => ({
      ...prev,
      [productId]: type,
    }))

    // Update selected product quantity if it's already selected
    setSelectedProducts((prev) => {
      const newSelected = prev.map((p) => {
        if (p.id === productId && isDesalProduct(p)) {
          let newQuantity
          if (type === 'custom') {
            newQuantity = parseInt(desalCustomQuantities[productId]) || 20
          } else {
            newQuantity = parseInt(type)
          }
          return { ...p, quantity: newQuantity }
        }
        return p
      })

      saveSelectedProducts(newSelected)
      // Clear any validation error when quantities change
      setValidationError('')
      return newSelected
    })
  }

  const handleDesalCustomQuantityChange = (productId, value) => {
    setDesalCustomQuantities((prev) => ({
      ...prev,
      [productId]: value,
    }))

    if (desalQuantityTypes[productId] === 'custom') {
      setSelectedProducts((prev) => {
        const newSelected = prev.map((p) => {
          if (p.id === productId && isDesalProduct(p)) {
            return { ...p, quantity: parseInt(value) || 20 }
          }
          return p
        })

        saveSelectedProducts(newSelected)
        // Clear any validation error when quantities change
        setValidationError('')
        return newSelected
      })
    }
  }

  const handleClearAll = () => {
    setSelectedProducts([])
    setDesalCustomQuantities({})
    setDesalQuantityTypes({})
    setValidationError('')
    localStorage.removeItem('selectedProducts')
  }

  const handleRemoveProduct = (productId) => {
    setSelectedProducts((prev) => {
      const newSelected = prev.filter((p) => p.id !== productId)

      if (desalQuantityTypes[productId]) {
        const newDesalTypes = { ...desalQuantityTypes }
        delete newDesalTypes[productId]
        setDesalQuantityTypes(newDesalTypes)
      }

      if (desalCustomQuantities[productId]) {
        const newDesalCustom = { ...desalCustomQuantities }
        delete newDesalCustom[productId]
        setDesalCustomQuantities(newDesalCustom)
      }

      saveSelectedProducts(newSelected)
      return newSelected
    })
  }

  const getTotalItems = () => {
    return selectedProducts.reduce((sum, product) => sum + product.quantity, 0)
  }

  const getTotalPricePerDelivery = () => {
    return selectedProducts.reduce((sum, product) => sum + product.quantity * product.price, 0)
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  const handleProceedToCheckout = () => {
    if (selectedProducts.length === 0) {
      alert('Please select at least one product')
      return
    }

    // Validate minimum quantities for desal/pandesal products
    const validation = validateSelectedProducts()
    if (!validation.isValid) {
      setValidationError(validation.message)
      // Scroll to the validation error
      const errorElement = document.getElementById('validation-error')
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
      return
    }

    // Clear any previous validation error
    setValidationError('')

    // Check if user is already logged in
    if (isAuthenticated && user) {
      console.log('User is logged in, preparing order details...')

      // Prepare order details to pass to checkout page
      const orderDetails = {
        products: selectedProducts,
        totalPieces: getTotalItems(),
        totalPricePerDelivery: getTotalPricePerDelivery(),
      }

      // Store in localStorage as backup
      localStorage.setItem('pendingOrder', JSON.stringify(orderDetails))

      // Clear the selected products since we're moving to checkout
      localStorage.removeItem('selectedProducts')

      // Navigate to checkout page with state
      navigate('/checkout', {
        state: {
          orderDetails: orderDetails,
        },
      })
    } else {
      // User is not logged in, show auth modal
      console.log('User is not logged in, showing auth modal...')
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
    // Save selected products before redirecting to login
    localStorage.setItem('selectedProducts', JSON.stringify(selectedProducts))
    setShowAuthModal(false)

    navigate('/login', {
      state: {
        fromOrder: true,
        message: 'Please login or register to complete your order',
      },
    })
  }

  // Get products by category
  const getProductsByCategory = (categoryId) => {
    if (categoryId === 'all') return products

    return products.filter((product) => {
      if (
        product.category_id?.toString() === categoryId ||
        product.product_category_id?.toString() === categoryId
      ) {
        return true
      }

      if (categoryId === 'pandesal' && isDesalProduct(product)) {
        return true
      }

      if (
        categoryId === 'bread' &&
        (product.category_name?.toLowerCase().includes('bread') ||
          product.category?.toLowerCase().includes('bread')) &&
        !isDesalProduct(product)
      ) {
        return true
      }

      if (
        categoryId === 'drink' &&
        (product.category_name?.toLowerCase().includes('drink') ||
          product.category?.toLowerCase().includes('drink'))
      ) {
        return true
      }

      if (categoryId === 'other') {
        const hasCategory =
          product.category_id ||
          product.product_category_id ||
          product.category_name ||
          product.category
        return !hasCategory
      }

      return false
    })
  }

  const displayedProducts = getProductsByCategory(activeCategory)

  return (
    <section
      className="min-h-screen py-8 md:py-12 font-[titleFont]"
      style={{ backgroundColor: '#F5EFE7' }}
    >
      <div className="container mx-auto px-4">
        {/* Header Section */}
        <motion.div
          className="text-center mb-8 md:mb-12"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeInUp}
        >
          <h1
            className="text-2xl md:text-3xl lg:text-4xl font-light mb-4 font-[titleFont]"
            style={{ color: '#2A1803' }}
          >
            Your Daily Bread, Just a Click Away!
          </h1>

          <motion.p
            className="text-base md:text-lg lg:text-lg max-w-3xl mx-auto font-[titleFont] mb-6"
            style={{ color: '#9C4A15' }}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Freshly baked, hand-kneaded, and zero preservatives. Order Now!
          </motion.p>

          <div className="h-1 w-24 mx-auto" style={{ backgroundColor: '#9C4A15' }}></div>
        </motion.div>

        <motion.div
          className="mx-auto"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, amount: 0.1 }}
          variants={staggerContainer}
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* LEFT COLUMN */}
            <motion.div className="lg:col-span-8" variants={faqItem}>
              <h2
                className="text-xl md:text-2xl font-light mb-6 font-[titleFont]"
                style={{ color: '#2A1803' }}
              >
                Select Products
              </h2>

              <div className="bg-white rounded-xl shadow-lg p-6 md:p-7 h-175 flex flex-col">
                {loadingProducts || loadingCategories ? (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#9C4A15]"></div>
                  </div>
                ) : productError ? (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center py-4 text-red-600">{productError}</div>
                  </div>
                ) : (
                  <>
                    {/* Category Tabs */}
                    <div className="flex overflow-x-auto pb-4 mb-4 gap-2 scrollbar-hide shrink-0">
                      {categories.map((category) => {
                        const Icon = category.icon
                        const isActive = activeCategory === category.id
                        const count = getProductsByCategory(category.id).length

                        return (
                          <button
                            key={category.id}
                            onClick={() => setActiveCategory(category.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                              isActive
                                ? 'bg-[#9C4A15] text-white'
                                : 'bg-[#F5EFE7] text-[#2A1803] hover:bg-[#e8dfd2]'
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                            <span>{category.name}</span>
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full ${
                                isActive ? 'bg-white/20 text-white' : 'bg-white text-[#9C4A15]'
                              }`}
                            >
                              {count}
                            </span>
                          </button>
                        )
                      })}
                    </div>

                    {/* Products Grid */}
                    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar min-h-0">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                        {displayedProducts.map((product) => {
                          const isSelected = selectedProducts.some((p) => p.id === product.id)
                          const selectedProduct = selectedProducts.find((p) => p.id === product.id)
                          const isDesal = isDesalProduct(product)
                          const isBread =
                            isDesal ||
                            product.category_name?.toLowerCase().includes('bread') ||
                            product.category?.toLowerCase().includes('bread')
                          const isDrink =
                            product.category_name?.toLowerCase().includes('drink') ||
                            product.category?.toLowerCase().includes('drink')

                          return (
                            <div
                              key={product.id}
                              className={`border-2 rounded-lg p-3 cursor-pointer transition-all ${
                                isSelected
                                  ? 'border-[#9C4A15] bg-[#F5EFE7]'
                                  : 'border-gray-200 hover:border-[#9C4A15]'
                              }`}
                              onClick={() => handleProductSelect(product)}
                            >
                              <div className="flex flex-col">
                                {/* Product Image */}
                                <div className="w-full h-24 bg-gray-200 rounded-lg flex items-center justify-center mb-2">
                                  {product.image ? (
                                    <img
                                      src={product.image}
                                      alt={product.name}
                                      className="w-full h-full object-cover rounded-lg"
                                    />
                                  ) : (
                                    <FiPackage className="w-8 h-8 text-gray-400" />
                                  )}
                                </div>

                                <div className="flex-1">
                                  <div className="flex justify-between items-start mb-1">
                                    <h3
                                      className="text-sm font-bold font-[titleFont] truncate"
                                      style={{ color: '#2A1803' }}
                                      title={product.name}
                                    >
                                      {product.name}
                                    </h3>
                                    <span
                                      className="text-sm font-bold font-[titleFont] ml-1 shrink-0"
                                      style={{ color: '#9C4A15' }}
                                    >
                                      ₱{product.price}
                                    </span>
                                  </div>

                                  {/* Category Badge */}
                                  <div className="mb-2">
                                    {isDesal && (
                                      <span className="inline-block text-[10px] px-2 py-0.5 bg-amber-100 text-amber-700 rounded">
                                        Min 20
                                      </span>
                                    )}
                                  </div>

                                  {/* Quantity Options for Desal Products */}
                                  {isSelected && isDesal && (
                                    <div
                                      className="space-y-2 mt-2"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <div className="flex gap-1">
                                        <button
                                          onClick={() =>
                                            handleDesalQuantityTypeChange(product.id, '20')
                                          }
                                          className={`flex-1 py-1 px-2 text-xs rounded ${
                                            desalQuantityTypes[product.id] === '20' ||
                                            !desalQuantityTypes[product.id]
                                              ? 'bg-[#9C4A15] text-white'
                                              : 'bg-[#F5EFE7] text-[#2A1803]'
                                          }`}
                                        >
                                          20
                                        </button>
                                        <button
                                          onClick={() =>
                                            handleDesalQuantityTypeChange(product.id, '40')
                                          }
                                          className={`flex-1 py-1 px-2 text-xs rounded ${
                                            desalQuantityTypes[product.id] === '40'
                                              ? 'bg-[#9C4A15] text-white'
                                              : 'bg-[#F5EFE7] text-[#2A1803]'
                                          }`}
                                        >
                                          40
                                        </button>
                                        <button
                                          onClick={() =>
                                            handleDesalQuantityTypeChange(product.id, 'custom')
                                          }
                                          className={`flex-1 py-1 px-2 text-xs rounded ${
                                            desalQuantityTypes[product.id] === 'custom'
                                              ? 'bg-[#9C4A15] text-white'
                                              : 'bg-[#F5EFE7] text-[#2A1803]'
                                          }`}
                                        >
                                          Custom
                                        </button>
                                      </div>

                                      {desalQuantityTypes[product.id] === 'custom' && (
                                        <input
                                          type="number"
                                          min="20"
                                          value={desalCustomQuantities[product.id] || ''}
                                          onChange={(e) =>
                                            handleDesalCustomQuantityChange(
                                              product.id,
                                              e.target.value,
                                            )
                                          }
                                          placeholder="Enter quantity"
                                          className="w-full px-2 py-1 text-xs border-2 border-[#9C4A15] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9C4A15]"
                                        />
                                      )}
                                    </div>
                                  )}

                                  {/* Regular Quantity Input for Other Selected Products */}
                                  {isSelected && !isDesal && (
                                    <div
                                      className="flex items-center gap-2 mt-2"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <span
                                        className="text-xs font-medium"
                                        style={{ color: '#9C4A15' }}
                                      >
                                        Qty:
                                      </span>
                                      <input
                                        type="number"
                                        min={1}
                                        value={selectedProduct?.quantity || 1}
                                        onChange={(e) =>
                                          handleProductQuantityChange(product.id, e.target.value)
                                        }
                                        className="w-16 px-2 py-0.5 text-sm border-2 border-[#9C4A15] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9C4A15] text-center"
                                      />
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          )
                        })}

                        {/* Empty State */}
                        {displayedProducts.length === 0 && (
                          <div className="col-span-4 text-center py-8">
                            <FiPackage className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500">No products in this category</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </motion.div>

            {/* RIGHT COLUMN */}
            <motion.div className="lg:col-span-4" variants={faqItem} transition={{ delay: 0.1 }}>
              <h2
                className="text-xl md:text-2xl font-light mb-6 font-[titleFont]"
                style={{ color: '#2A1803' }}
              >
                Your Order
              </h2>

              <div className="bg-white rounded-xl shadow-lg p-6 md:p-7 sticky top-4 h-175 flex flex-col">
                {selectedProducts.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                      <FiPackage className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">No products selected yet</p>
                      <p className="text-sm text-gray-400 mt-2">
                        Click on products to add them to your order
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Validation Error Message */}
                    {validationError && (
                      <div
                        id="validation-error"
                        className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg"
                      >
                        <p className="text-red-600 text-sm font-medium">{validationError}</p>
                      </div>
                    )}

                    {/* Selected Products List */}
                    <div className="flex-1 overflow-hidden flex flex-col min-h-0">
                      <div className="flex justify-between items-center mb-3 shrink-0">
                        <h3 className="font-medium text-sm" style={{ color: '#9C4A15' }}>
                          Selected Items ({selectedProducts.length})
                        </h3>
                        <button
                          onClick={handleClearAll}
                          className="text-xs text-[#9C4A15] hover:underline"
                        >
                          Clear all
                        </button>
                      </div>
                      <div className="flex-1 overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                        {selectedProducts.map((product) => {
                          const isDesal = isDesalProduct(product)
                          const isValidQuantity = !isDesal || product.quantity >= 20

                          return (
                            <div
                              key={product.id}
                              className={`flex justify-between items-center text-sm py-3 px-3 rounded-lg border border-gray-200 hover:border-[#9C4A15] transition-colors ${
                                !isValidQuantity ? 'bg-red-50' : 'bg-white'
                              }`}
                            >
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span
                                    className="font-medium truncate"
                                    style={{ color: '#2A1803' }}
                                  >
                                    {product.name}
                                  </span>
                                  <span
                                    className={`text-xs whitespace-nowrap ${
                                      !isValidQuantity ? 'text-red-600 font-bold' : ''
                                    }`}
                                    style={isValidQuantity ? { color: '#9C4A15' } : {}}
                                  >
                                    x{product.quantity}
                                    {!isValidQuantity && (
                                      <span className="ml-1 text-red-600">(Min 20)</span>
                                    )}
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center gap-4 shrink-0">
                                <span className="font-medium text-sm" style={{ color: '#9C4A15' }}>
                                  {formatCurrency(product.quantity * product.price)}
                                </span>

                                {/* Remove button - always visible */}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleRemoveProduct(product.id)
                                  }}
                                  className="p-2 rounded-full hover:bg-red-100 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                                  title="Remove item"
                                  aria-label="Remove item"
                                >
                                  <FiTrash2 className="w-4 h-4 text-red-500" />
                                </button>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    {/* Totals */}
                    <div className="shrink-0 mt-4">
                      <div className="space-y-3 pt-4 border-t border-gray-200">
                        <div className="flex justify-between items-center">
                          <span className="text-sm" style={{ color: '#2A1803' }}>
                            Total Items
                          </span>
                          <span className="font-bold" style={{ color: '#9C4A15' }}>
                            {getTotalItems()} pcs
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-base font-bold" style={{ color: '#2A1803' }}>
                            Per Delivery
                          </span>
                          <span className="text-lg font-bold" style={{ color: '#9C4A15' }}>
                            {formatCurrency(getTotalPricePerDelivery())}
                          </span>
                        </div>
                      </div>

                      {/* Proceed Button */}
                      <div className="mt-6">
                        <motion.button
                          onClick={handleProceedToCheckout}
                          disabled={selectedProducts.length === 0}
                          className={`w-full py-4 rounded-full font-bold font-[titleFont] text-base transition-all duration-200 shadow-lg cursor-pointer ${
                            selectedProducts.length === 0 ? 'opacity-70 cursor-not-allowed' : ''
                          }`}
                          style={{
                            backgroundColor: '#9C4A15',
                            color: '#F5EFE7',
                          }}
                          whileHover={selectedProducts.length > 0 ? { scale: 1.02 } : {}}
                          whileTap={selectedProducts.length > 0 ? { scale: 0.98 } : {}}
                        >
                          Proceed to Checkout
                        </motion.button>

                        {/* Show user status message if authenticated */}
                        {isAuthenticated && user && (
                          <p
                            className="text-center mt-3 font-[titleFont] text-sm"
                            style={{ color: '#2A1803' }}
                          >
                            Ordering as:{' '}
                            <span className="font-bold text-[#9C4A15]">
                              {user.fullname || user.c_fullname}
                            </span>
                          </p>
                        )}
                      </div>

                      {/* Summary Note */}
                      <p className="text-center text-xs mt-4" style={{ color: '#9C4A15' }}>
                        You'll select delivery dates and times in checkout
                      </p>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Footer Note */}
        <motion.div className="text-center mt-12" variants={faqItem} transition={{ delay: 0.3 }}>
          <div className="h-1 w-32 mx-auto mb-4" style={{ backgroundColor: '#9C4A15' }}></div>
          <p className="text-lg md:text-xl font-[titleFont]" style={{ color: '#2A1803' }}>
            Need more help? Contact us at{' '}
            <a
              href="mailto:customerservice@pandedaily.com"
              className="font-medium hover:underline"
              style={{ color: '#9C4A15' }}
            >
              customerservice@pandedaily.com
            </a>
          </p>
          <p className="text-sm font-[titleFont] mt-2" style={{ color: '#9C4A15' }}>
            Free delivery on all subscriptions • Zero preservatives • Hand-kneaded daily
          </p>
        </motion.div>
      </div>

      {/* Auth Modal */}
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
