// src/pages/RegisterPage.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    setLoading(true);
    try {
      await register(nombre, email, password, telefono);
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
          Registrarse
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="text"
            required
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Nombre completo"
            className="w-full bg-fondo text-arroz rounded-xl px-4 py-3 text-sm placeholder:text-arroz/30 outline-none focus:ring-2 focus:ring-acento"
          />
          <input
            type="tel"
            required
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            placeholder="Teléfono (ej: 1123456789)"
            className="w-full bg-fondo text-arroz rounded-xl px-4 py-3 text-sm placeholder:text-arroz/30 outline-none focus:ring-2 focus:ring-acento"
          />
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
          <input
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Repetí tu contraseña"
            className="w-full bg-fondo text-arroz rounded-xl px-4 py-3 text-sm placeholder:text-arroz/30 outline-none focus:ring-2 focus:ring-acento"
          />

          {error && <p className="text-acento text-sm text-center">{error}</p>}a

          <p className="text-arroz/70 text-sm text-center">
            ¿Ya tenés cuenta?{" "}
            <Link to="/login" className="text-acento font-medium">
              Iniciar sesión
            </Link>
          </p>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-full bg-acento text-arroz font-semibold hover:brightness-110 transition-all disabled:opacity-50"
          >
            {loading ? "Creando cuenta..." : "Crear cuenta"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default RegisterPage;
