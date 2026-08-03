import { readFileSync } from 'fs';

const imagenBuffer = readFileSync('C:/Users/matia/Desktop/Lara/tigre.jpg'); // podés usar la misma u otra distinta
const TOKEN_ADMIN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Mywicm9sIjoiYWRtaW4iLCJpYXQiOjE3ODQ4NTU3ODUsImV4cCI6MTc4NTQ2MDU4NX0.TPIc1AEyEa1-3jvBLHsJWS4ARx5t3xVFQH8sIjzzDtE';

const formData = new FormData();
formData.append('nombre', 'Producto de prueba post-fix (editado)');
formData.append('imagen', new Blob([imagenBuffer]), 'nueva-imagen.jpg');

// Usá el productoId real que te devolvió la prueba anterior (28, en tu caso)
fetch('http://localhost:3000/api/admin/productos/28', {
    method: 'PATCH',
    headers: {
        'Authorization': `Bearer ${TOKEN_ADMIN}`
    },
    body: formData
})
    .then(res => res.json())
    .then(data => console.log('EDITAR:', data))
    .catch(err => console.error(err));