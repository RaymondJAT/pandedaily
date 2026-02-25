import { useState, useEffect, useCallback, useMemo } from 'react'
import { getProducts, getProductCategories } from '../services/api'
import { FiPackage, FiCoffee, FiBattery } from 'react-icons/fi'

export const useProducts = () => {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState({ products: false, categories: false })
  const [error, setError] = useState({ products: '', categories: '' })

  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [])

  const fetchProducts = async () => {
    setLoading((prev) => ({ ...prev, products: true }))
    try {
      const response = await getProducts()
      const productsData = response.data || response

      const transformedProducts = (Array.isArray(productsData) ? productsData : []).map(
        (product) => ({
          id: product.id || product.p_id,
          name: product.name || product.p_name,
          price: parseFloat(product.price) || 0,
          category_id: product.category_id || product.p_category_id,
          category_name: product.category_name,
          status: product.status || product.p_status || 'AVAILABLE',
          image: product.image,
          ...product,
        }),
      )

      setProducts(transformedProducts)
    } catch (error) {
      console.error('Error fetching products:', error)
      setError((prev) => ({ ...prev, products: 'Failed to load products' }))
    } finally {
      setLoading((prev) => ({ ...prev, products: false }))
    }
  }

  const fetchCategories = async () => {
    setLoading((prev) => ({ ...prev, categories: true }))
    try {
      const response = await getProductCategories()
      const categoriesData = response.data || []

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
      setError((prev) => ({ ...prev, categories: 'Failed to load categories' }))
      setCategories(getFallbackCategories())
    } finally {
      setLoading((prev) => ({ ...prev, categories: false }))
    }
  }

  const getAvailableProductsByCategory = useCallback(
    (categoryId) => {
      if (categoryId === 'all') {
        return products.filter((product) => product.status === 'AVAILABLE')
      }

      return products.filter((product) => {
        if (product.status !== 'AVAILABLE') return false

        // Check by category ID
        if (
          product.category_id?.toString() === categoryId ||
          product.product_category_id?.toString() === categoryId
        ) {
          return true
        }

        // Special handling for pandesal
        if (categoryId === 'pandesal' && isDesalProduct(product)) {
          return true
        }

        // Check by category name
        const categoryName = (product.category_name || product.category || '').toLowerCase()
        if (categoryId === 'bread' && categoryName.includes('bread') && !isDesalProduct(product)) {
          return true
        }
        if (categoryId === 'drink' && categoryName.includes('drink')) {
          return true
        }

        // Other items
        if (categoryId === 'other') {
          return (
            !product.category_id &&
            !product.product_category_id &&
            !product.category_name &&
            !product.category
          )
        }

        return false
      })
    },
    [products],
  )

  // Helper function to check if product is pandesal
  const isDesalProduct = useCallback((product) => {
    const name = (product.name || product.p_name || '').toLowerCase()
    const category = (product.category_name || product.category || '').toLowerCase()

    return name.includes('pandesal') || category.includes('pandesal')
  }, [])

  return {
    products,
    categories,
    loading,
    error,
    getAvailableProductsByCategory,
    isDesalProduct,
  }
}

const getCategoryIcon = (categoryName) => {
  const name = categoryName?.toLowerCase() || ''
  if (name.includes('pandesal') || name.includes('bread')) return FiPackage
  if (name.includes('drink') || name.includes('beverage') || name.includes('coffee'))
    return FiCoffee
  return FiBattery
}

const getFallbackCategories = () => [
  { id: 'all', name: 'All Products', icon: FiPackage },
  { id: 'pandesal', name: 'Pandesal', icon: FiPackage },
  { id: 'bread', name: 'Other Breads', icon: FiPackage },
  { id: 'drink', name: 'Drinks', icon: FiCoffee },
  { id: 'other', name: 'Other Items', icon: FiBattery },
]
