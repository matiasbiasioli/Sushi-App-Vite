// src/components/layout/Footer.jsx
// Footer decorativo con estructura similar a sitios de delivery de comida.
// La mayoría de los links son solo visuales (no llevan a ninguna página real todavía) —
// solo "Mi perfil" y "Dónde está mi pedido" son funcionales de verdad.
import { Link } from 'react-router-dom'

function Footer() {
  return (
    <footer className="bg-superficie border-t border-fondo mt-16">
      <div className="max-w-6xl mx-auto px-4 py-10 grid grid-cols-2 md:grid-cols-4 gap-8">
        
        {/* Logo + tagline */}
        <div className="col-span-2 md:col-span-1">
          <h2 className="font-display text-xl text-arroz tracking-wide mb-2">
            SU<span className="text-acento">SHI</span>
          </h2>
          <p className="text-arroz/50 text-xs">
            Sushi fresco, directo a tu puerta.
          </p>
        </div>

        {/* Tu cuenta */}
        <div>
          <h3 className="text-arroz text-sm font-semibold mb-3">Tu cuenta</h3>
          <ul className="flex flex-col gap-2">
            <li>
              <Link to="/profile" className="text-arroz/50 text-xs hover:text-arroz transition-colors">
                Mi perfil
              </Link>
            </li>
            <li>
              <span className="text-arroz/50 text-xs">Popcoins</span>
            </li>
            <li>
              <span className="text-arroz/50 text-xs">Dar de baja mi cuenta</span>
            </li>
          </ul>
        </div>

        {/* Ayuda */}
        <div>
          <h3 className="text-arroz text-sm font-semibold mb-3">Ayuda</h3>
          <ul className="flex flex-col gap-2">
            <li>
              <Link
                to="/donde-esta-mi-pedido"
                className="text-arroz/50 text-xs hover:text-arroz transition-colors"
              >
                Dónde está mi pedido
              </Link>
            </li>
            <li>
              <span className="text-arroz/50 text-xs">Preguntas frecuentes</span>
            </li>
            <li>
              <span className="text-arroz/50 text-xs">Reclamos</span>
            </li>
          </ul>
        </div>

        {/* Local */}
        <div>
          <h3 className="text-arroz text-sm font-semibold mb-3">Local</h3>
          <ul className="flex flex-col gap-2">
            <li>
              <span className="text-arroz/50 text-xs">Locales</span>
            </li>
            <li>
              <span className="text-arroz/50 text-xs">Área de cobertura</span>
            </li>
            <li>
              <span className="text-arroz/50 text-xs">Legales</span>
            </li>
          </ul>
        </div>

      </div>

      <div className="border-t border-fondo px-4 py-4 text-center">
        <p className="text-arroz/30 text-xs">
          © {new Date().getFullYear()} Sushi App — Hecho por Savia Digital
        </p>
      </div>
    </footer>
  )
}

export default Footer