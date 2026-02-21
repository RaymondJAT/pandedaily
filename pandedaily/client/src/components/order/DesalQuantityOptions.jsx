const DesalQuantityOptions = ({
  productId,
  quantityType,
  customQuantity,
  onTypeChange,
  onCustomChange,
}) => {
  return (
    <div className="space-y-2 mt-2" onClick={(e) => e.stopPropagation()}>
      <div className="flex gap-1">
        {['20', '40', 'custom'].map((type) => (
          <button
            key={type}
            onClick={() => onTypeChange(productId, type)}
            className={`flex-1 py-1 px-2 text-xs rounded ${
              quantityType === type ? 'bg-[#9C4A15] text-white' : 'bg-[#F5EFE7] text-[#2A1803]'
            }`}
          >
            {type === 'custom' ? 'Custom' : type}
          </button>
        ))}
      </div>

      {quantityType === 'custom' && (
        <input
          type="number"
          min="20"
          value={customQuantity || ''}
          onChange={(e) => onCustomChange(productId, e.target.value)}
          placeholder="Enter quantity"
          className="w-full px-2 py-1 text-xs border-2 border-[#9C4A15] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9C4A15]"
        />
      )}
    </div>
  )
}

export default DesalQuantityOptions
