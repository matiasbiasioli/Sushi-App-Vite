# 🍣 Sushi App

Web de pedidos online para un local de sushi en Buenos Aires. 

Permite a los clientes explorar el menú por categorías, armar su pedido, elegir entre delivery o take away, pagar en efectivo o con Mercado Pago, y hacer seguimiento de su compra — con un panel de administración completo para gestionar productos, pedidos y el estado del local.

---

## ✨ Funcionalidades

### Para clientes
- Catálogo de productos organizado por categorías, con imágenes reales
- Carrito de compras con modal de confirmación al agregar productos
- Checkout paso a paso: carrito → tipo de entrega (delivery/take away) → forma de pago
- Registro e inicio de sesión, con recuperación de contraseña por email
- Pago en efectivo o con Mercado Pago (Checkout Pro)
- Historial de pedidos propios ("Mis pedidos") con estado en tiempo real
- Consulta de estado de pedido sin necesidad de tener cuenta (con teléfono + número de pedido)
- Aviso visible cuando el local está cerrado, con horario de reapertura

### Para el administrador
- Gestión de productos: crear, editar, subir imagen (vía Cloudinary), marcar sin stock, eliminar (soft delete) y reactivar
- Gestión de pedidos: ver todos los pedidos con datos del cliente, cambiar su estado
- Control de apertura/cierre del local, con mensaje de horario personalizable

---

## 🛠️ Stack tecnológico

**Frontend**
- React + Vite
- React Router (rutas y navegación)
- Tailwind CSS v4
- lucide-react (íconos)

**Backend**
- Node.js + Express
- MySQL (vía `mysql2`)
- JWT (`jsonwebtoken`) + `bcryptjs` para autenticación
- Multer (subida de archivos)

**Servicios externos**
- **Cloudinary** — almacenamiento y entrega de imágenes de productos
- **Resend** — envío de emails transaccionales (recuperación de contraseña)
- **Mercado Pago** (Checkout Pro) — procesamiento de pagos, modo sandbox/test

**Hosting de destino**
- Hostinger (plan Business)

---

## 🗄️ Modelo de datos (MySQL)

| Tabla | Descripción |
|---|---|
| `usuarios` | Clientes y administradores (diferenciados por `rol`) |
| `categorias` | Categorías del menú (Rolls, Combos, Bebidas, etc.) |
| `productos` | Productos del catálogo, con `disponible` (stock) y `activo` (soft delete) por separado |
| `pedidos` | Pedidos realizados, con `numero_pedido` reiniciado diariamente y `estado` |
| `items_pedido` | Detalle de productos y cantidades de cada pedido |
| `estado_local` | Fila única con el estado abierto/cerrado del local y su horario |

---

## 📌 Notas de diseño

- **Convención de idioma:** el código (variables, funciones, componentes) está en inglés; la base de datos está en español. El mapeo entre ambos idiomas se centraliza en `frontend/src/services/api.js`.
- **Seguridad de contraseñas:** nunca se almacenan en texto plano — se guardan hasheadas con `bcrypt`. La recuperación de contraseña usa tokens de un solo uso con vencimiento de 1 hora.
- **Soft delete de productos:** eliminar un producto no borra la fila de la base (para no romper el historial de pedidos que lo referencian) — se marca `activo = false`.
- **Precios recalculados en el servidor:** al crear un pedido, el backend nunca confía en los precios que manda el cliente; los vuelve a calcular consultando la tabla `productos`.

---

**Desarrollado por Savia Digital** — Buenos Aires, Argentina