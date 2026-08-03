// src/pages/HomePage.jsx
import { useState, useEffect, useRef } from "react";
import ProductGrid from "../components/products/ProductGrid";
import CategoryShowcase from "../components/products/CategoryShowcase";
import CompactCategoryBar from "../components/products/CompactCategoryBar";
import useProducts from "../hooks/useProducts";
import useCategories from "../hooks/useCategories";
import { useStoreStatus } from "../context/StoreStatusContext";
import StoreClosedBanner from "../components/common/StoreClosedBanner";

function HomePage() {
  const { products, loading: loadingProducts } = useProducts();
  const { categories, loading: loadingCategories } = useCategories();
  const { abierto, horarioApertura } = useStoreStatus();

  // showCompact: true cuando el usuario ya scrolleó más allá de la sección grande de cards
  const [showCompact, setShowCompact] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);
  const showcaseRef = useRef(null);

  // Mantenemos activeCategory sincronizado con la primera categoría disponible, una vez que cargan
  useEffect(() => {
    if (categories.length > 0 && activeCategory === null) {
      setActiveCategory(categories[0].id);
    }
  }, [categories, activeCategory]);

  // Observamos la sección grande de categorías (CategoryShowcase): apenas deja de estar
  // visible en pantalla (el usuario scrolleó hacia abajo, más allá de ella), activamos
  // la barra compacta. Cuando vuelve a estar visible (el usuario scrolleó para arriba
  // de nuevo), la ocultamos.
  useEffect(() => {
    if (!showcaseRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowCompact(!entry.isIntersecting);
      },
      { threshold: 0 }, // se dispara apenas el elemento empieza a salir de la pantalla
    );

    observer.observe(showcaseRef.current);

    // Limpieza: dejamos de observar cuando el componente se desmonta
    return () => observer.disconnect();
  }, [loadingCategories]); // reconectamos el observer una vez que el showcase ya se renderizó con datos reales

  function handleCategoryClick(categoryId) {
    setActiveCategory(categoryId);
    const section = document.getElementById(`category-${categoryId}`);
    if (section) {
      section.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  if (loadingProducts || loadingCategories) {
    return <p className="text-arroz p-8">Cargando...</p>;
  }

  return (
    <>
      {/* Barra compacta: siempre montada, pero se desliza fuera de vista con CSS
          cuando showCompact es false, en vez de aparecer/desaparecer de golpe */}
      <div
        className={`fixed top-[64px] left-0 right-0 z-40 transition-all duration-200 ${
          showCompact
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 -translate-y-2 pointer-events-none"
        }`}
      >
        <CompactCategoryBar
          categories={categories}
          activeCategory={activeCategory}
          onCategoryClick={handleCategoryClick}
        />
      </div>

      {!abierto && (
        <div className="max-w-6xl mx-auto px-4 pt-6">
          <StoreClosedBanner horarioApertura={horarioApertura} />
        </div>
      )}

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div ref={showcaseRef}>
          <CategoryShowcase categories={categories} />
        </div>

        {categories.map((category) => {
          const categoryProducts = products.filter(
            (p) => p.categoryId === category.id,
          );

          return (
            <section
              key={category.id}
              id={`category-${category.id}`}
              className="mb-10 scroll-mt-32"
            >
              <h2 className="font-display text-2xl font-bold text-arroz mb-4">
                {category.name}
              </h2>
              <ProductGrid products={categoryProducts} />
            </section>
          );
        })}
      </main>
    </>
  );
}

export default HomePage;
