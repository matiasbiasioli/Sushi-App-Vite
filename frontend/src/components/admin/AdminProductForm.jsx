// src/components/admin/AdminProductForm.jsx
// Formulario reutilizable para crear un producto nuevo O editar uno existente.
// Si recibe `product` (prop), arranca con esos datos precargados (modo edición).
import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { createProduct, updateProduct } from '../../services/api'
import { ImageOff } from 'lucide-react'

function AdminProductForm({ product, categories, onSaved, onCancel }) {
  const { token } = useAuth()
  const isEditing = Boolean(product)

  const [categoriaId, setCategoriaId] = useState(product?.categoria_id || '')
  const [nombre, setNombre] = useState(product?.nombre || '')
  const [descripcion, setDescripcion] = useState(product?.descripcion || '')
  const [precio, setPrecio] = useState(product?.precio || '')
  const [piezas, setPiezas] = useState(product?.piezas || '')

  // Estado para el archivo de imagen seleccionado (null si no se eligió ninguno nuevo)
  const [imageFile, setImageFile] = useState(null)
  // URL para mostrar la preview: arranca con la imagen actual del producto (si estamos editando),
  // y se reemplaza por la del archivo nuevo apenas el usuario elige uno
  const [previewUrl, setPreviewUrl] = useState(product?.imagen_url || null)

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // Cuando el usuario elige un archivo en el <input type="file">
  function handleFileChange(e) {
    const file = e.target.files[0]
    if (!file) return

    setImageFile(file)
    // URL.createObjectURL genera una URL temporal, válida solo en este navegador,
    // que apunta al archivo elegido sin necesidad de subirlo todavía — sirve para la preview
    setPreviewUrl(URL.createObjectURL(file))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSaving(true)

    // Armamos el objeto de datos. El campo `imagen` solo se incluye si el usuario
    // eligió un archivo nuevo — si no, no se manda nada y el backend deja la imagen actual intacta.
    const data = {
      categoriaId: Number(categoriaId),
      nombre,
      descripcion: descripcion || null,
      precio: parseFloat(precio),
      piezas: piezas ? Number(piezas) : null,
    }

    if (imageFile) {
      data.imagen = imageFile
    }

    try {
      if (isEditing) {
        await updateProduct(product.id, data, token)
      } else {
        await createProduct(data, token)
      }
      onSaved()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-superficie rounded-2xl p-4 flex flex-col gap-3 mb-4">
      <h3 className="text-arroz font-semibold text-sm">
        {isEditing ? 'Editar producto' : 'Nuevo producto'}
      </h3>

      {/* Preview de la imagen: muestra la actual, la recién elegida, o un placeholder si no hay ninguna */}
      <div className="w-full aspect-video rounded-xl bg-fondo flex items-center justify-center overflow-hidden">
        {previewUrl ? (
          <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
        ) : (
          <ImageOff size={28} className="text-arroz/30" />
        )}
      </div>

      <div>
        <label className="text-arroz/70 text-xs block mb-1">
          {isEditing ? 'Cambiar imagen (opcional)' : 'Imagen (opcional)'}
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="w-full text-arroz text-xs file:mr-3 file:py-2 file:px-3 file:rounded-full file:border-0 file:bg-acento file:text-arroz file:text-xs file:font-semibold file:cursor-pointer"
        />
      </div>

      <select
        value={categoriaId}
        onChange={e => setCategoriaId(e.target.value)}
        required
        className="bg-fondo text-arroz rounded-xl px-3 py-2 text-sm outline-none"
      >
        <option value="" disabled>Elegí una categoría</option>
        {categories.map(cat => (
          <option key={cat.id} value={cat.id}>{cat.name}</option>
        ))}
      </select>

      <input
        type="text"
        required
        value={nombre}
        onChange={e => setNombre(e.target.value)}
        placeholder="Nombre del producto"
        className="bg-fondo text-arroz rounded-xl px-3 py-2 text-sm placeholder:text-arroz/30 outline-none"
      />

      <textarea
        value={descripcion}
        onChange={e => setDescripcion(e.target.value)}
        placeholder="Descripción (opcional)"
        rows={2}
        className="bg-fondo text-arroz rounded-xl px-3 py-2 text-sm placeholder:text-arroz/30 outline-none resize-none"
      />

      <div className="flex gap-3">
        <input
          type="number"
          step="0.01"
          required
          value={precio}
          onChange={e => setPrecio(e.target.value)}
          placeholder="Precio"
          className="flex-1 bg-fondo text-arroz rounded-xl px-3 py-2 text-sm placeholder:text-arroz/30 outline-none"
        />
        <input
          type="number"
          value={piezas}
          onChange={e => setPiezas(e.target.value)}
          placeholder="Piezas (opcional)"
          className="flex-1 bg-fondo text-arroz rounded-xl px-3 py-2 text-sm placeholder:text-arroz/30 outline-none"
        />
      </div>

      {error && <p className="text-acento text-sm">{error}</p>}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={saving}
          className="flex-1 py-2.5 rounded-full bg-acento text-arroz font-semibold text-sm hover:brightness-110 transition-all disabled:opacity-50"
        >
          {saving ? 'Guardando...' : 'Guardar'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-2.5 rounded-full bg-fondo text-arroz font-semibold text-sm hover:bg-fondo/70 transition-all"
        >
          Cancelar
        </button>
      </div>
    </form>
  )
}

export default AdminProductForm