// src/components/products/CategoryShowcase.jsx
// Sección destacada en la home: cards grandes por categoría, con ícono y color.
// Al tocar una, hace scroll suave hasta esa sección del catálogo (mismo patrón que CategoryNav).
import { getCategoryVisual } from '../../utils/categoryVisuals'

function CategoryShowcase({ categories }) {
  function handleClick(categoryId) {
    const section = document.getElementById(`category-${categoryId}`)
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-12">
      {categories.map(category => {
        const { icon: Icon, color, bg } = getCategoryVisual(category.name)

        return (
          <button
            key={category.id}
            onClick={() => handleClick(category.id)}
            className={`${bg} rounded-2xl p-6 flex flex-col items-center gap-3 hover:scale-[1.02] transition-transform`}
          >
            <Icon size={32} className={color} />
            <span className="text-arroz font-display font-semibold text-sm">
              {category.name}
            </span>
          </button>
        )
      })}
    </div>
  )
}

export default CategoryShowcase