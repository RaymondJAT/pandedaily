import { FiPackage } from 'react-icons/fi'
import DesalQuantityOptions from './DesalQuantityOptions'

const ProductCard = ({
  product,
  isSelected,
  selectedProduct,
  isDesal,
  onSelect,
  onQuantityChange,
  onDesalTypeChange,
  onDesalCustomChange,
  desalQuantityType,
  desalCustomQuantity,
}) => {
  return (
    <div
      className={`border-2 rounded-lg p-3 cursor-pointer transition-all ${
        isSelected ? 'border-[#9C4A15] bg-[#F5EFE7]' : 'border-gray-200 hover:border-[#9C4A15]'
      }`}
      onClick={onSelect}
    >
      <div className="flex flex-col">
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

          {isDesal && (
            <div className="mb-2">
              <span className="inline-block text-[10px] px-2 py-0.5 bg-amber-100 text-amber-700 rounded">
                Min 20
              </span>
            </div>
          )}

          {isSelected && isDesal && (
            <DesalQuantityOptions
              productId={product.id}
              quantityType={desalQuantityType}
              customQuantity={desalCustomQuantity}
              onTypeChange={onDesalTypeChange}
              onCustomChange={onDesalCustomChange}
            />
          )}

          {isSelected && !isDesal && (
            <div className="flex items-center gap-2 mt-2" onClick={(e) => e.stopPropagation()}>
              <span className="text-xs font-medium" style={{ color: '#9C4A15' }}>
                Qty:
              </span>
              <input
                type="number"
                min={1}
                value={selectedProduct?.quantity || 1}
                onChange={(e) => onQuantityChange(product.id, e.target.value)}
                className="w-16 px-2 py-0.5 text-sm border-2 border-[#9C4A15] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9C4A15] text-center"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProductCard
