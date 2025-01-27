import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom'; // Importa useNavigate
import './OrderSummary.css'; // Asegúrate de tener los estilos preparados

const OrderSummary = () => {
  const location = useLocation();
  const { cartItems = [], totalPrice = 0, user = {} } = location.state || {};
  const navigate = useNavigate();

  
  console.log('Datos recibidos en OrderSummary:', { cartItems, totalPrice, user });

  
  // Datos predeterminados de la empresa
  const companyInfo = {
    name: 'ICARO S.R.L',
    address: 'Av. Siempre Viva 742',
    city: 'Springfield',
    state: 'Illinois',
    phone: '(011) 456-7890',
    email: 'livebeatpass@ecommerce.com',
  };

  const [deliveryOption, setDeliveryOption] = useState('delivery'); // Default: envío a domicilio
  const [finalTotal, setFinalTotal] = useState(totalPrice); // Total final con envío

  // Actualizar el total al cambiar la opción de entrega
  useEffect(() => {
    console.log('Opción de entrega seleccionada:', deliveryOption);
    if (deliveryOption === 'delivery') {
      setFinalTotal(totalPrice + 5000); // Agregar costo de envío
      console.log('Costo de envío agregado: $5000');
    } else {
      setFinalTotal(totalPrice); // Sin costo adicional
      console.log('Sin costo de envío');
    }
  }, [deliveryOption, totalPrice]);

  const handleConfirmOrder = () => {
    const shippingAddress = deliveryOption === 'delivery'
      ? `${user.street}, ${user.city}, ${user.state}, ${user.zipCode}`
      : `${companyInfo.address}, ${companyInfo.city}, ${companyInfo.state}`;

    console.log('Confirmando la orden con los siguientes datos:', {
      customerDni: user?.dni,
      cartItems,
      totalPrice,
      deliveryOption,
      shippingAddress,
    });

    // Aquí se realiza la llamada para guardar la orden en la base de datos
    fetch('http://localhost:5000/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerDni: user?.dni,
        cartItems,
        totalPrice: finalTotal,
        deliveryOption, // Enviar estado del envío
        shippingAddress,
      }),
    })
    .then((res) => {
      if (!res.ok) {
        return res.text().then((text) => {
          console.error('Error recibido del servidor:', text);
          throw new Error(text);
        });
      }
      return res.json();
      })
      .then((data) => {
        console.log('Orden confirmada con éxito:', data);
        alert(`Compra confirmada con éxito. Número de orden: ${data.ticketNumber}`);
        navigate('/'); // Redirige a la pagina principal
      })
      .catch((err) => {
        console.error('Error al confirmar la compra:', err.message);
        alert(`Ocurrió un error al confirmar la compra: ${err.message}`);
      });
  };

  return (
    <div className="order-summary">
      <h1>Resumen de Compra</h1>

      {/* Detalle de los productos */}
      <h2>Productos</h2>
      <ul>
        {cartItems.map((item) => (
          <li key={item.id} className="order-item">
            <span>{item.name}</span>
            <span>${item.price.toFixed(2)} x {item.quantity}</span>
          </li>
        ))}
      </ul>

      <p className="order-total">Total: ${finalTotal.toFixed(2)}</p>

      {/* Detalle del costo de envío */}
      {deliveryOption === 'delivery' && (
        <p className="delivery-cost">Costo de Envío: $5000</p>
      )}

      {/* Datos del usuario */}
      <h2>Datos del Usuario</h2>
      <p>Nombre: {user?.firstName || 'No disponible'} {user?.lastName || ''}</p>
      <p>Email: {user.email}</p>
      <p>Teléfono: {user?.phone || 'No disponible'}</p>

      {/* Dirección de envío */}
      <h2>Dirección de Envío</h2>
      <div className="delivery-options" style={{ display: 'flex', gap: '3rem', justifyContent: 'flex-start' }}>
        <label className="delivery-option">
          <input
            type="radio"
            name="deliveryOption"
            value="delivery"
            checked={deliveryOption === 'delivery'}
            onChange={() => setDeliveryOption('delivery')}
          />
          Envío a domicilio
        </label>
        <label className="delivery-option">
          <input
            type="radio"
            name="deliveryOption"
            value="pickup"
            checked={deliveryOption === 'pickup'}
            onChange={() => setDeliveryOption('pickup')}
          />
          Retirar por el domicilio de la empresa
        </label>
      </div>
      <p style={{ marginTop: '1.5rem' }}>
        Dirección seleccionada: {deliveryOption === 'delivery'
          ? `${user.street}, ${user.city}, ${user.state}, ${user.zipCode}`
          : `${companyInfo.address}, ${companyInfo.city}, ${companyInfo.state}`}
      </p>

      {/* Datos de la empresa */}
      <h2>Datos de la Empresa</h2>
      <p>Nombre: {companyInfo.name}</p>
      <p>Dirección: {companyInfo.address}, {companyInfo.city}, {companyInfo.state}</p>
      <p>Teléfono: {companyInfo.phone}</p>
      <p>Email: {companyInfo.email}</p>

      {/* Confirmación */}
      <button className="btn confirm-btn" onClick={handleConfirmOrder}>
        Confirmar Compra
      </button>
    </div>
  );
};

export default OrderSummary;
