import { useState, useEffect } from 'react'

export const useOrderSelection = (products) => {
  const [selectedProducts, setSelectedProducts] = useState([])
  const [desalCustomQuantities, setDesalCustomQuantities] = useState({})
  const [desalQuantityTypes, setDesalQuantityTypes] = useState({})
  const [validationError, setValidationError] = useState('')

  // Restore from localStorage
  useEffect(() => {
    if (products.length > 0) {
      restoreFromLocalStorage()
    }
  }, [products])

  const restoreFromLocalStorage = () => {
    const savedSelectedProducts = localStorage.getItem('selectedProducts')
    if (!savedSelectedProducts) return

    try {
      const parsed = JSON.parse(savedSelectedProducts)
      const validProducts = parsed.filter((savedProduct) =>
        products.some((product) => product.id === savedProduct.id),
      )

      setSelectedProducts(validProducts)
      restoreDesalStates(validProducts)
      localStorage.removeItem('selectedProducts')
    } catch (error) {
      console.error('Error restoring selected products:', error)
    }
  }

  const restoreDesalStates = (products) => {
    const desalQuantities = {}
    const desalTypes = {}

    products.forEach((product) => {
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
  }

  const saveToLocalStorage = (products) => {
    localStorage.setItem('selectedProducts', JSON.stringify(products))
  }

  const isDesalProduct = (product) => {
    return (
      product.name?.toLowerCase().includes('desal') ||
      product.name?.toLowerCase().includes('pandesal')
    )
  }

  const validateSelectedProducts = () => {
    for (const product of selectedProducts) {
      if (isDesalProduct(product) && product.quantity < 20) {
        return {
          isValid: false,
          message: `"${product.name}" requires a minimum quantity of 20 pieces. Current quantity: ${product.quantity}`,
        }
      }
    }
    return { isValid: true, message: '' }
  }

  const addProduct = (product) => {
    setSelectedProducts((prev) => {
      if (prev.some((p) => p.id === product.id)) return prev

      let initialQuantity = 1
      if (isDesalProduct(product)) {
        const productType = desalQuantityTypes[product.id] || '20'
        initialQuantity =
          productType === 'custom'
            ? parseInt(desalCustomQuantities[product.id]) || 20
            : parseInt(productType)
      }

      const newSelected = [...prev, { ...product, quantity: initialQuantity }]
      saveToLocalStorage(newSelected)
      setValidationError('')
      return newSelected
    })
  }

  const removeProduct = (productId) => {
    setSelectedProducts((prev) => {
      const newSelected = prev.filter((p) => p.id !== productId)
      saveToLocalStorage(newSelected)

      // Clean up desal states
      setDesalQuantityTypes((prev) => {
        const newTypes = { ...prev }
        delete newTypes[productId]
        return newTypes
      })

      setDesalCustomQuantities((prev) => {
        const newQuantities = { ...prev }
        delete newQuantities[productId]
        return newQuantities
      })

      return newSelected
    })
  }

  const updateQuantity = (productId, quantity) => {
    setSelectedProducts((prev) => {
      const newSelected = prev.map((p) => {
        if (p.id === productId) {
          const minQty = isDesalProduct(p) ? 20 : 1
          return { ...p, quantity: Math.max(minQty, parseInt(quantity) || minQty) }
        }
        return p
      })
      saveToLocalStorage(newSelected)
      setValidationError('')
      return newSelected
    })
  }

  const updateDesalType = (productId, type) => {
    setDesalQuantityTypes((prev) => ({ ...prev, [productId]: type }))

    setSelectedProducts((prev) => {
      const newSelected = prev.map((p) => {
        if (p.id === productId && isDesalProduct(p)) {
          const newQuantity =
            type === 'custom' ? parseInt(desalCustomQuantities[productId]) || 20 : parseInt(type)
          return { ...p, quantity: newQuantity }
        }
        return p
      })
      saveToLocalStorage(newSelected)
      setValidationError('')
      return newSelected
    })
  }

  const updateDesalCustomQuantity = (productId, value) => {
    setDesalCustomQuantities((prev) => ({ ...prev, [productId]: value }))

    if (desalQuantityTypes[productId] === 'custom') {
      setSelectedProducts((prev) => {
        const newSelected = prev.map((p) => {
          if (p.id === productId && isDesalProduct(p)) {
            return { ...p, quantity: parseInt(value) || 20 }
          }
          return p
        })
        saveToLocalStorage(newSelected)
        setValidationError('')
        return newSelected
      })
    }
  }

  const clearAll = () => {
    setSelectedProducts([])
    setDesalCustomQuantities({})
    setDesalQuantityTypes({})
    setValidationError('')
    localStorage.removeItem('selectedProducts')
  }

  const getTotals = () => ({
    totalItems: selectedProducts.reduce((sum, p) => sum + p.quantity, 0),
    totalPrice: selectedProducts.reduce((sum, p) => sum + p.quantity * p.price, 0),
  })

  return {
    selectedProducts,
    desalCustomQuantities,
    desalQuantityTypes,
    validationError,
    isDesalProduct,
    validateSelectedProducts,
    addProduct,
    removeProduct,
    updateQuantity,
    updateDesalType,
    updateDesalCustomQuantity,
    clearAll,
    getTotals,
    setValidationError,
  }
}
