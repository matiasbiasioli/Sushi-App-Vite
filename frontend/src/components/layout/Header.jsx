// src/components/layout/Header.jsx
import { ShoppingCart, User, Shield, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";

function Header({ onCartClick }) {
  const { totalCount } = useCart();
  const { isAuthenticated, user } = useAuth();

  return (
    <header className="sticky top-0 z-50 bg-fondo/95 backdrop-blur-sm border-b border-superficie">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="font-display text-2xl text-arroz tracking-wide">
          SU<span className="text-acento">SHI</span>
        </Link>

        <Link
          to="/donde-esta-mi-pedido"
          className="hidden sm:flex items-center gap-1.5 text-arroz/70 text-xs hover:text-arroz transition-colors"
        >
          <Search size={14} />
          ¿Dónde está mi pedido?
        </Link>

        <div className="flex items-center gap-2">
          {isAuthenticated && user?.rol === "admin" && (
            <Link
              to="/admin"
              className="flex items-center justify-center w-11 h-11 rounded-full bg-superficie hover:bg-superficie/70 transition-colors"
              aria-label="Panel de administración"
            >
              <Shield size={20} className="text-arroz" />
            </Link>
          )}

          <Link
            to={isAuthenticated ? "/profile" : "/login"}
            className="flex items-center justify-center w-11 h-11 rounded-full bg-superficie hover:bg-superficie/70 transition-colors"
            aria-label={isAuthenticated ? "Mi perfil" : "Iniciar sesión"}
          >
            <User size={20} className="text-arroz" />
          </Link>

          <button
            onClick={onCartClick}
            className="relative flex items-center justify-center w-11 h-11 rounded-full bg-superficie hover:bg-superficie/70 transition-colors"
            aria-label="Abrir carrito"
          >
            <ShoppingCart size={22} className="text-arroz" />

            {totalCount > 0 && (
              <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-5 h-5 px-1 rounded-full bg-acento text-arroz text-xs font-bold">
                {totalCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;
