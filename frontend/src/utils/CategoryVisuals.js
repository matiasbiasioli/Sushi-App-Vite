// src/utils/categoryVisuals.js
// Mapeo entre el nombre de cada categoría (tal como viene de la base de datos)
// y su ícono + color representativo. Si agregás una categoría nueva en MySQL
// y no la sumás acá, cae en el "default" (un plato genérico), así nunca se rompe visualmente.
import { Soup, Beef, IceCream, Beer, Salad, UtensilsCrossed } from 'lucide-react'

const CATEGORY_VISUALS = {
  'Rolls': { icon: Soup, color: 'text-acento', bg: 'bg-acento/10' },
  'Combos': { icon: UtensilsCrossed, color: 'text-wasabi', bg: 'bg-wasabi/10' },
  'Bebidas': { icon: Beer, color: 'text-arroz', bg: 'bg-arroz/10' },
  'Postres': { icon: IceCream, color: 'text-acento', bg: 'bg-acento/10' },
  'Platos calientes': { icon: Beef, color: 'text-wasabi', bg: 'bg-wasabi/10' },
  'Entradas': { icon: Salad, color: 'text-arroz', bg: 'bg-arroz/10' },
}

const DEFAULT_VISUAL = { icon: UtensilsCrossed, color: 'text-arroz/50', bg: 'bg-superficie' }

export function getCategoryVisual(categoryName) {
  return CATEGORY_VISUALS[categoryName] || DEFAULT_VISUAL
}