// src/components/layout/CategoryNav.jsx
import { useState } from 'react'
import { getCategoryVisual } from '../../utils/categoryVisuals'

function CategoryNav({ categories }) {
  const [activeCategory, setActiveCategory] = useState(categories[0]?.id)

  function handleCategoryClick(categoryId) {
    setActiveCategory(categoryId)
    const section = document.getElementById(`category-${categoryId}`)
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <nav className="sticky top-16 z-40 bg-fondo border-b border-superficie">
      <div className="max-w-6xl mx-auto px-4 flex gap-2 overflow-x-auto scrollbar-hide py-3">
        {categories.map(category => {
          const { icon: Icon } = getCategoryVisual(category.name)

          return (
            <button
              key={category.id}
              onClick={() => handleCategoryClick(category.id)}
              className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-body whitespace-nowrap transition-colors ${
                activeCategory === category.id
                  ? 'bg-acento text-arroz'
                  : 'bg-superficie text-arroz/70 hover:text-arroz'
              }`}
            >
              <Icon size={14} />
              {category.name}
            </button>
          )
        })}
      </div>
    </nav>
  )
}

export default CategoryNav