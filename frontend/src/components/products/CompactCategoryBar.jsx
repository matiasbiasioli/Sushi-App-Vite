// src/components/products/CompactCategoryBar.jsx
import { getCategoryVisual } from '../../utils/categoryVisuals'

function CompactCategoryBar({ categories, activeCategory, onCategoryClick }) {
  return (
    <nav className="bg-fondo border-b border-superficie">
      <div className="max-w-6xl mx-auto px-4 flex justify-center gap-2 overflow-x-auto scrollbar-hide py-3">
        {categories.map(category => {
          const { icon: Icon, color } = getCategoryVisual(category.name)
          const isActive = activeCategory === category.id

          return (
            <button
              key={category.id}
              onClick={() => onCategoryClick(category.id)}
              className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-body whitespace-nowrap transition-colors ${
                isActive ? 'bg-acento text-arroz' : 'bg-superficie text-arroz/70 hover:text-arroz'
              }`}
            >
              <Icon size={14} className={isActive ? 'text-arroz' : color} />
              {category.name}
            </button>
          )
        })}
      </div>
    </nav>
  )
}

export default CompactCategoryBar