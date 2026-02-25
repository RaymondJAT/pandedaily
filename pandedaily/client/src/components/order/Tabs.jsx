const Tabs = ({ categories, activeCategory, onCategoryChange, getProductCount }) => {
  const visibleCategories = categories.filter(
    (category) => category.id === 'all' || getProductCount(category.id) > 0,
  )

  return (
    <div className="flex overflow-x-auto pb-4 mb-4 gap-2 scrollbar-hide shrink-0">
      {visibleCategories.map((category) => {
        const Icon = category.icon
        const isActive = activeCategory === category.id
        const count = getProductCount(category.id)

        return (
          <button
            key={category.id}
            onClick={() => onCategoryChange(category.id)}
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
  )
}

export default Tabs
