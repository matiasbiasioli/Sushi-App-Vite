// src/services/api.js
const API_URL = 'http://localhost:3000/api'

function mapProduct(p) {
  return {
    id: p.id,
    name: p.nombre,
    description: p.descripcion,
    price: parseFloat(p.precio),
    pieces: p.piezas,
    imageUrl: p.imagen_url,
    available: p.disponible,
    categoryId: p.categoria_id,
    categoryName: p.categoria_nombre,
  }
}

function mapCategory(c) {
  return {
    id: c.id,
    name: c.nombre,
    order: c.orden,
  }
}

export async function getProducts() {
  const res = await fetch(`${API_URL}/productos`)
  if (!res.ok) throw new Error('Error fetching products')
  const data = await res.json()
  return data.map(mapProduct)
}

export async function getCategories() {
  const res = await fetch(`${API_URL}/categorias`)
  if (!res.ok) throw new Error('Error fetching categories')
  const data = await res.json()
  return data.map(mapCategory)
}

export async function loginUser({ email, password }) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Error al iniciar sesión')
  return data
}

export async function registerUser({ nombre, email, password, telefono }) {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nombre, email, password, telefono }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Error al registrarse')
  return data
}

export async function createOrder(orderData, token) {
  const res = await fetch(`${API_URL}/pedidos`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(orderData),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Error al crear el pedido')
  return data
}

// Trae los pedidos del usuario logueado (el backend filtra por el token, no hace falta mandar ningún id)
export async function getMyOrders(token) {
  const res = await fetch(`${API_URL}/pedidos/mios`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Error al obtener tus pedidos')
  return data
}

// --- Funciones de administración (todas requieren token de un usuario con rol 'admin') ---

// Trae TODOS los pedidos de TODOS los clientes (para gestionar desde el panel)
export async function getAdminOrders(token) {
  const res = await fetch(`${API_URL}/admin/pedidos`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Error al obtener los pedidos')
  return data
}

// Cambia el estado de un pedido puntual (ej: de "pagado" a "en_preparacion")
export async function updateOrderStatus(orderId, estado, token) {
  const res = await fetch(`${API_URL}/admin/pedidos/${orderId}/estado`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ estado }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Error al actualizar el estado')
  return data
}

// Trae TODOS los productos, incluidos los marcados como no disponibles
// (a diferencia de getProducts(), que es el endpoint público)
export async function getAdminProducts(token) {
  const res = await fetch(`${API_URL}/admin/productos`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Error al obtener los productos')
  return data
}

// Función interna reutilizada por createProduct y updateProduct.
// Arma un FormData (necesario cuando hay que mandar un archivo) a partir del objeto `data`.
// Solo agrega los campos que efectivamente tienen valor, así funciona tanto para
// creación (todos los campos) como para edición parcial (solo algunos campos).
function buildProductFormData(data) {
  const formData = new FormData()

  if (data.categoriaId !== undefined) formData.append('categoriaId', data.categoriaId)
  if (data.nombre !== undefined) formData.append('nombre', data.nombre)
  if (data.descripcion !== undefined && data.descripcion !== null) {
    formData.append('descripcion', data.descripcion)
  }
  if (data.precio !== undefined) formData.append('precio', data.precio)
  if (data.piezas !== undefined && data.piezas !== null) formData.append('piezas', data.piezas)
  if (data.disponible !== undefined) formData.append('disponible', data.disponible)
  if (data.activo !== undefined) formData.append('activo', data.activo)

  // El archivo va con la clave exacta "imagen", que es lo que espera
  // multer del lado del backend (upload.single('imagen'))
  if (data.imagen instanceof File) {
    formData.append('imagen', data.imagen)
  }

  return formData
}

// Crea un producto nuevo.
// Si `data.imagen` es un archivo (File), se manda como multipart/form-data.
// Si no hay imagen, se manda como JSON normal (más liviano).
export async function createProduct(data, token) {
  const hasImage = data.imagen instanceof File

  const res = await fetch(`${API_URL}/admin/productos`, {
    method: 'POST',
    headers: hasImage
      ? { Authorization: `Bearer ${token}` } // sin Content-Type: el navegador lo arma solo con FormData
      : { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: hasImage ? buildProductFormData(data) : JSON.stringify(data),
  })

  const result = await res.json()
  if (!res.ok) throw new Error(result.error || 'Error al crear el producto')
  return result
}

// Actualiza un producto existente (parcial). Mismo criterio que createProduct:
// FormData si hay imagen nueva, JSON si no.
export async function updateProduct(id, data, token) {
  const hasImage = data.imagen instanceof File

  const res = await fetch(`${API_URL}/admin/productos/${id}`, {
    method: 'PATCH',
    headers: hasImage
      ? { Authorization: `Bearer ${token}` }
      : { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: hasImage ? buildProductFormData(data) : JSON.stringify(data),
  })

  const result = await res.json()
  if (!res.ok) throw new Error(result.error || 'Error al actualizar el producto')
  return result
}

// Busca el estado de un pedido público, sin necesidad de estar logueado.
// Se identifica al pedido combinando teléfono + número de pedido (no requiere token).
export async function trackOrder(telefono, numeroPedido) {
  const params = new URLSearchParams({ telefono, numeroPedido })
  const res = await fetch(`${API_URL}/pedidos/estado?${params}`)
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'No encontramos ese pedido')
  return data
}

// Pide el reset de contraseña. El backend SIEMPRE responde el mismo mensaje genérico,
// exista o no el email — por eso esta función nunca debería lanzar un error "el email no existe":
// solo falla si hay un problema real de red/servidor.
export async function forgotPassword(email) {
  const res = await fetch(`${API_URL}/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Error al solicitar el reset')
  return data
}

// Confirma el reset con el token recibido por email + la nueva contraseña.
export async function resetPassword(token, nuevaPassword) {
  const res = await fetch(`${API_URL}/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, nuevaPassword }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'El link de recuperación es inválido o expiró')
  return data
}

// Consulta el estado actual del local (abierto/cerrado + horario). Público, sin token.
export async function getStoreStatus() {
  const res = await fetch(`${API_URL}/estado-local`)
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Error al consultar el estado del local')
  return data
}

// Actualiza el estado del local (solo admin). Acepta actualización parcial:
// { abierto } o { horarioApertura } o ambos juntos.
export async function updateStoreStatus(data, token) {
  const res = await fetch(`${API_URL}/admin/estado-local`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  })
  const result = await res.json()
  if (!res.ok) throw new Error(result.error || 'Error al actualizar el estado del local')
  return result
}