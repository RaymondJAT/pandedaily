import { FiPackage } from 'react-icons/fi'
import ProductCard from './ProductCard'

const ProductGrid = ({
  products,
  selectedProducts,
  onProductSelect,
  onQuantityChange,
  onDesalTypeChange,
  onDesalCustomChange,
  desalQuantityTypes,
  desalCustomQuantities,
  isDesalProduct,
}) => {
  if (products.length === 0) {
    return (
      <div className="col-span-4 text-center py-8">
        <FiPackage className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500">No available products in this category</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
      {products.map((product) => {
        const isSelected = selectedProducts.some((p) => p.id === product.id)
        const selectedProduct = selectedProducts.find((p) => p.id === product.id)
        const isDesal = isDesalProduct(product)

        return (
          <ProductCard
            key={product.id}
            product={product}
            isSelected={isSelected}
            selectedProduct={selectedProduct}
            isDesal={isDesal}
            onSelect={() => onProductSelect(product)}
            onQuantityChange={onQuantityChange}
            onDesalTypeChange={onDesalTypeChange}
            onDesalCustomChange={onDesalCustomChange}
            desalQuantityType={desalQuantityTypes[product.id]}
            desalCustomQuantity={desalCustomQuantities[product.id]}
          />
        )
      })}
    </div>
  )
}

export default ProductGrid
