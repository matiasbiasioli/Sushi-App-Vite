// src/pages/LoginPage.jsx
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate, useLocation } from "react-router-dom";

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const cameFromCheckout = location.state?.from === "checkout";

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-fondo flex items-center justify-center p-4">
      <div className="bg-superficie rounded-2xl w-full max-w-sm p-6">
        <h1 className="font-display text-arroz text-2xl font-bold text-center mb-6">
          Iniciar Sesión
        </h1>

        <button
          type="button"
          disabled
          className="w-full py-3 rounded-full bg-fondo text-arroz/40 font-semibold cursor-not-allowed mb-4"
        >
          Continuar con Google
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px bg-fondo" />
          <span className="text-arroz/40 text-xs">o con tu email</span>
          <div className="flex-1 h-px bg-fondo" />
        </div>

        {cameFromCheckout && (
          <p className="text-arroz/70 text-sm text-center mb-4">
            Iniciá sesión para completar tu pedido
          </p>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tuemail@ejemplo.com"
            className="w-full bg-fondo text-arroz rounded-xl px-4 py-3 text-sm placeholder:text-arroz/30 outline-none focus:ring-2 focus:ring-acento"
          />
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Contraseña"
            className="w-full bg-fondo text-arroz rounded-xl px-4 py-3 text-sm placeholder:text-arroz/30 outline-none focus:ring-2 focus:ring-acento"
          />

          {error && <p className="text-acento text-sm text-center">{error}</p>}

          <p className="text-arroz/70 text-sm text-center">
            ¿No tenés cuenta?{" "}
            <Link to="/register" className="text-acento font-medium">
              Registrate
            </Link>
          </p>

          <p className="text-arroz/50 text-xs text-center">
            <Link
              to="/forgot-password"
              className="hover:text-arroz/80 transition-colors"
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </p>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-full bg-acento text-arroz font-semibold hover:brightness-110 transition-all disabled:opacity-50"
          >
            {loading ? "Ingresando..." : "Ingresar"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
