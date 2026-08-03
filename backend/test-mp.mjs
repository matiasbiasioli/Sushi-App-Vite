// Script de prueba: crea un pedido con paymentMethod "mercadopago"
// y nos muestra la URL de checkout que devuelve el backend.
const TOKEN_CLIENTE = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwicm9sIjoiY2xpZW50ZSIsImlhdCI6MTc4NDY4MzM1MiwiZXhwIjoxNzg1Mjg4MTUyfQ.iv6PcYrQ3N7q1L9ekE_xVwIB-0Pc7hEZIZ-RZ-tmWr8';

fetch('http://localhost:3000/api/pedidos', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TOKEN_CLIENTE}`
    },
    body: JSON.stringify({
        items: [
            { productoId: 7, cantidad: 1 }
        ],
        deliveryType: 'take_away',
        paymentMethod: 'mercadopago'
    })
})
    .then(res => res.json())
    .then(data => console.log(data))
    .catch(err => console.error(err));