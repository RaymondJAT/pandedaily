import { useState, useEffect, useMemo, useCallback } from 'react'
import PlatformTable from '../../components/PlatformTable'
import { FiPlus, FiRefreshCw, FiPackage, FiTag, FiImage } from 'react-icons/fi'
import { Image } from 'antd'
import { getProducts, getProductCategories } from '../../services/api'
import AddProduct from '../../components/dashboard modal/AddProduct'
import EditProduct from '../../components/dashboard modal/EditProduct'
import AddProductCategory from '../../components/dashboard modal/AddProductCategory'
import EditProductCategory from '../../components/dashboard modal/EditProductCategory'
import { productColumns } from '../../mapping/productColumns'

const Product = () => {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [sortKey, setSortKey] = useState('id')
  const [sortDirection, setSortDirection] = useState('desc')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRows, setSelectedRows] = useState([])
  const [selectAll, setSelectAll] = useState(false)

  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false)
  const [showEditCategoryModal, setShowEditCategoryModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [editingCategory, setEditingCategory] = useState(null)

  const columnsWithRender = useMemo(() => {
    return productColumns.map((col) => {
      // Add centered alignment like Users table
      const baseColumn = {
        ...col,
        align: 'center',
        headerClassName: 'text-center',
        cellClassName: 'text-center align-middle',
      }

      switch (col.key) {
        case 'id':
          return {
            ...baseColumn,
            render: (value) => {
              if (value === undefined || value === null) {
                return <span className="font-mono font-semibold text-gray-400">N/A</span>
              }
              return (
                <div className="flex justify-center">
                  <span className="font-mono font-semibold text-blue-700">
                    P{value.toString().padStart(3, '0')}
                  </span>
                </div>
              )
            },
          }

        case 'name':
          return {
            ...baseColumn,
            render: (value) => (
              <div className="flex justify-center items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#F5EFE7] flex items-center justify-center border border-[#9C4A15]/20">
                  <FiPackage className="w-4 h-4 text-[#9C4A15]" />
                </div>
                <span className="font-medium text-gray-800">{value || 'N/A'}</span>
              </div>
            ),
          }

        case 'category_name':
          return {
            ...baseColumn,
            render: (value) => (
              <div className="flex justify-center items-center gap-2">
                <FiTag className="w-4 h-4 text-gray-400" />
                <span className="text-gray-700">{value || 'N/A'}</span>
              </div>
            ),
          }

        case 'price':
          return {
            ...baseColumn,
            render: (value) => {
              const formattedPrice = new Intl.NumberFormat('en-PH', {
                style: 'currency',
                currency: 'PHP',
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }).format(value || 0)

              return (
                <div className="flex justify-center items-center gap-2">
                  <span className="font-semibold text-green-700">{formattedPrice}</span>
                </div>
              )
            },
          }

        case 'cost':
          return {
            ...baseColumn,
            render: (value) => {
              const formattedCost = new Intl.NumberFormat('en-PH', {
                style: 'currency',
                currency: 'PHP',
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }).format(value || 0)

              return (
                <div className="flex justify-center items-center gap-2">
                  <span className="font-medium text-gray-700">{formattedCost}</span>
                </div>
              )
            },
          }

        case 'status':
          return {
            ...baseColumn,
            render: (value) => {
              const statusConfig = {
                AVAILABLE: {
                  color: 'bg-green-100 text-green-800',
                  border: 'border-green-200',
                  label: 'Available',
                },
                UNAVAILABLE: {
                  color: 'bg-red-100 text-red-800',
                  border: 'border-red-200',
                  label: 'Unavailable',
                },
                DELETED: {
                  color: 'bg-gray-100 text-gray-800',
                  border: 'border-gray-200',
                  label: 'Deleted',
                },
              }

              const status = value?.toUpperCase() || 'AVAILABLE'
              const config = statusConfig[status] || {
                color: 'bg-amber-100 text-amber-800',
                border: 'border-amber-200',
                label: status,
              }

              return (
                <div className="flex justify-center">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold border ${config.color} ${config.border}`}
                  >
                    {config.label}
                  </span>
                </div>
              )
            },
          }

        case 'image':
          return {
            ...baseColumn,
            render: (value) => {
              if (!value) {
                return (
                  <div className="flex justify-center">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                      <FiImage className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                )
              }

              // Create fallback image data URL
              const fallbackImage =
                'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiByeD0iOCIgZmlsbD0iI0Y1RUZGNyIvPgo8cGF0aCBkPSJNMjAgMTVDMjMuODY2IDE1IDI3IDE4LjEzNCAyNyAyMkMyNyAyNS44NjYgMjMuODY2IDI5IDIwIDI5QzE2LjEzNCAyOSAxMyAyNS44NjYgMTMgMjJDMTMgMTguMTM0IDE2LjEzNCAxNSAyMCAxNVpNMjAgMTdDMTcuMjM4NiAxNyAxNSAxOS4yMzg2IDE1IDIyQzE1IDI0Ljc2MTQgMTcuMjM4NiAyNyAyMCAyN0MyMi43NjE0IDI3IDI1IDI0Ljc2MTQgMjUgMjJDMjUgMTkuMjM4NiAyMi43NjE0IDE3IDIwIDE3Wk0yNS41IDExLjVDMjUuNSAxMi42MDUgMjQuNjA1IDEzLjUgMjMuNSAxMy41QzIyLjM5NSAxMy41IDIxLjUgMTIuNjA1IDIxLjUgMTEuNUMyMS41IDEwLjM5NSAyMi4zOTUgOS41IDIzLjUgOS41QzI0LjYwNSA5LjUgMjUuNSAxMC4zOTUgMjUuNSAxMS41WiIgZmlsbD0iIzlDNEEwNSIvPgo8L3N2Zz4K'

              // Use Ant Design Image component for preview
              return (
                <div className="flex justify-center">
                  <Image
                    width={40}
                    height={40}
                    src={value}
                    alt="Product"
                    className="rounded-lg object-cover border border-gray-200 cursor-pointer hover:opacity-90 transition-opacity"
                    placeholder={
                      <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                        <FiImage className="w-5 h-5 text-gray-400" />
                      </div>
                    }
                    fallback={fallbackImage}
                    preview={{
                      mask: 'View',
                      classNames: {
                        mask: 'rounded-lg',
                        root: 'product-image-preview',
                      },
                    }}
                  />
                </div>
              )
            },
          }

        default:
          return baseColumn
      }
    })
  }, [])

  // Fetch products and categories from API
  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      // Fetch products and categories in parallel
      const [productsResponse, categoriesResponse] = await Promise.all([
        getProducts(),
        getProductCategories(),
      ])

      const productsData = productsResponse.data || productsResponse
      const categoriesData = categoriesResponse.data || categoriesResponse

      if (Array.isArray(productsData)) {
        const transformedProducts = productsData.map((product) => ({
          id: product.id || product.p_id || 0,
          name: product.name || product.p_name || 'Unknown',
          category_name: product.category_name || product.pc_name || 'Uncategorized',
          price: parseFloat(product.price || product.p_price || 0),
          cost: parseFloat(product.cost || product.p_cost || 0),
          status: product.status || product.p_status || 'AVAILABLE',
          image: product.image || product.pi_image || '',
          category_id: product.category_id || product.p_category_id || 0,
          ...product,
        }))

        setProducts(transformedProducts)
      } else {
        console.error('Invalid products data format:', productsData)
        setProducts([])
      }

      if (Array.isArray(categoriesData)) {
        setCategories(categoriesData)
      } else {
        console.error('Invalid categories data format:', categoriesData)
        setCategories([])
      }
    } catch (err) {
      console.error('Error fetching data:', err)
      setError(err.message || 'Failed to fetch data. Please try again.')
      setProducts([])
      setCategories([])
    } finally {
      setLoading(false)
    }
  }, [])

  // Initial fetch
  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Handle product added/updated successfully
  const handleProductUpdated = () => {
    fetchData()
  }

  // Handle category added/updated successfully
  const handleCategoryUpdated = () => {
    fetchData()
  }

  // Handle edit product
  const handleEditProduct = (product) => {
    setEditingProduct(product)
    setShowEditModal(true)
  }

  // Handle edit category
  const handleEditCategory = (category) => {
    setEditingCategory(category)
    setShowEditCategoryModal(true)
  }

  // Get unique values for filter dropdowns
  const uniqueCategories = useMemo(() => {
    if (!Array.isArray(products)) return []
    return Array.from(new Set(products.map((item) => item.category_name))).filter(Boolean)
  }, [products])

  const uniqueStatuses = useMemo(() => {
    if (!Array.isArray(products)) return []
    return Array.from(new Set(products.map((item) => item.status))).filter(Boolean)
  }, [products])

  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    if (!Array.isArray(products)) return []

    let filtered = [...products]

    // Category filter
    if (categoryFilter) {
      filtered = filtered.filter((item) => item.category_name === categoryFilter)
    }

    // Status filter
    if (statusFilter) {
      filtered = filtered.filter((item) => item.status === statusFilter)
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (item) =>
          (item.id && item.id.toString().includes(query)) ||
          (item.name && item.name.toLowerCase().includes(query)) ||
          (item.category_name && item.category_name.toLowerCase().includes(query)) ||
          (item.price && item.price.toString().includes(query)) ||
          (item.cost && item.cost.toString().includes(query)),
      )
    }

    // Sorting with null-safe comparison
    return filtered.sort((a, b) => {
      if (sortKey === 'id') {
        const aId = a[sortKey] || 0
        const bId = b[sortKey] || 0
        return sortDirection === 'asc' ? aId - bId : bId - aId
      }

      if (sortKey === 'price' || sortKey === 'cost') {
        const aValue = parseFloat(a[sortKey]) || 0
        const bValue = parseFloat(b[sortKey]) || 0
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue
      }

      const aValue = a[sortKey] || ''
      const bValue = b[sortKey] || ''

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
      return 0
    })
  }, [products, sortKey, sortDirection, categoryFilter, statusFilter, searchQuery])

  const handleSort = (key) => {
    setSortDirection((prev) => (sortKey === key && prev === 'asc' ? 'desc' : 'asc'))
    setSortKey(key)
  }

  const handleSelectionChange = (selectedIds) => {
    setSelectedRows(selectedIds)
  }

  const handleSelectAll = (isSelected, allIds) => {
    setSelectAll(isSelected)
    setSelectedRows(isSelected ? allIds : [])
  }

  const handleAddProduct = () => {
    setShowAddModal(true)
  }

  const handleAddCategory = () => {
    setShowAddCategoryModal(true)
  }

  const handleRefresh = () => {
    fetchData()
  }

  const formatStatusForDisplay = (status) => {
    const statusMap = {
      AVAILABLE: 'Available',
      UNAVAILABLE: 'Unavailable',
      DELETED: 'Deleted',
    }
    return (
      statusMap[status] || (status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Unknown')
    )
  }

  // Calculate statistics
  const statistics = useMemo(() => {
    if (!Array.isArray(products))
      return {
        total: 0,
        available: 0,
        unavailable: 0,
        categories: 0,
        totalValue: 0,
      }

    const total = products.length
    const available = products.filter((p) => p.status === 'AVAILABLE').length
    const unavailable = total - available
    const categories = uniqueCategories.length

    const totalValue = products.reduce((sum, product) => {
      return sum + (parseFloat(product.price) || 0)
    }, 0)

    return { total, available, unavailable, categories, totalValue }
  }, [products, uniqueCategories])

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#9C4A15] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading products...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-2xl mb-2">⚠️</div>
          <p className="text-red-600 font-medium mb-2">Error loading products</p>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchData}
            className="px-4 py-2 bg-[#9C4A15] hover:bg-[#8a3f12] text-[#F5EFE7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9C4A15] focus:ring-offset-2 text-sm flex items-center gap-2 transition-colors cursor-pointer mx-auto"
          >
            <FiRefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 min-h-0 p-3">
        {/* Main header section */}
        <div className="bg-component shadow-lg rounded-lg border border-slate-400 mb-3">
          <div className="px-4 py-1">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Product Management</h1>
                <p className="text-gray-600">Manage bakery products, categories, and inventory</p>
              </div>
            </div>
          </div>

          {/* Filters and search */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center px-4 pb-2 gap-3">
            <div className="flex flex-wrap gap-2">
              <select
                className="px-4 py-2 border border-slate-400 rounded-lg focus:outline-none focus:ring-2 text-sm"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="">All Categories</option>
                {uniqueCategories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>

              <select
                className="px-4 py-2 border border-slate-400 rounded-lg focus:outline-none focus:ring-2 text-sm"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Status</option>
                {uniqueStatuses.map((status) => (
                  <option key={status} value={status}>
                    {formatStatusForDisplay(status)}
                  </option>
                ))}
              </select>

              <button
                onClick={handleAddCategory}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 text-sm flex items-center gap-2 transition-colors cursor-pointer"
              >
                <FiTag className="w-4 h-4" />
                <span>Add Category</span>
              </button>
            </div>

            <div className="flex items-center">
              <input
                type="text"
                placeholder="Search by name, category, or price..."
                className="px-4 py-2 border border-slate-400 rounded-lg focus:outline-none focus:ring-2 text-sm w-full md:w-64"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Table container */}
        <div className="h-[calc(100vh-280px)] lg:h-[calc(100vh-250px)] xl:h-[calc(100vh-220px)] overflow-hidden">
          <div className="bg-component shadow-lg rounded-lg border border-slate-400 h-full flex flex-col p-2">
            <div className="flex justify-between items-center mb-2">
              <div className="flex gap-2">
                <button
                  onClick={handleAddProduct}
                  className="px-4 py-2 bg-[#9C4A15] hover:bg-[#8a3f12] text-[#F5EFE7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9C4A15] focus:ring-offset-2 text-sm flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <FiPlus className="w-4 h-4" />
                  <span>Add Product</span>
                </button>
              </div>

              {selectedRows.length > 0 && (
                <div className="text-sm text-gray-600">
                  {selectedRows.length} product{selectedRows.length !== 1 ? 's' : ''} selected
                </div>
              )}
            </div>

            {filteredAndSortedData.length === 0 ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-gray-500 text-lg">No products found</p>
                  <p className="text-gray-400 text-sm mt-2">
                    {searchQuery || categoryFilter || statusFilter
                      ? 'Try adjusting your filters or search query'
                      : 'Add your first product to get started'}
                  </p>
                  {!searchQuery && !categoryFilter && !statusFilter && (
                    <button
                      onClick={handleAddProduct}
                      className="mt-4 px-4 py-2 bg-[#9C4A15] hover:bg-[#8a3f12] text-[#F5EFE7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9C4A15] focus:ring-offset-2 text-sm"
                    >
                      Add your first product
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <PlatformTable
                columns={columnsWithRender}
                data={filteredAndSortedData}
                sortKey={sortKey}
                sortDirection={sortDirection}
                onSort={handleSort}
                maxHeight="calc(100% - 60px)"
                title={null}
                responsive={true}
                containerClassName="h-full"
                selectedRows={selectedRows}
                onSelectionChange={handleSelectionChange}
                selectAll={selectAll}
                onSelectAll={handleSelectAll}
                onEdit={handleEditProduct}
                actionButtonProps={{
                  editLabel: 'Edit',
                  showEdit: true,
                }}
              />
            )}
          </div>
        </div>
      </div>

      {/* Add Product Modal */}
      <AddProduct
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onProductAdded={handleProductUpdated}
        categories={categories}
      />

      {/* Edit Product Modal */}
      <EditProduct
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false)
          setEditingProduct(null)
        }}
        productData={editingProduct}
        onProductUpdated={handleProductUpdated}
        categories={categories}
      />

      {/* Add Product Category Modal */}
      <AddProductCategory
        isOpen={showAddCategoryModal}
        onClose={() => setShowAddCategoryModal(false)}
        onCategoryAdded={handleCategoryUpdated}
      />

      {/* Edit Product Category Modal */}
      <EditProductCategory
        isOpen={showEditCategoryModal}
        onClose={() => {
          setShowEditCategoryModal(false)
          setEditingCategory(null)
        }}
        categoryData={editingCategory}
        onCategoryUpdated={handleCategoryUpdated}
      />
    </div>
  )
}

export default Product
