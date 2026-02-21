import { useState, useEffect } from 'react'
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
      setProducts(Array.isArray(productsData) ? productsData : [])
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

  return { products, categories, loading, error }
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
