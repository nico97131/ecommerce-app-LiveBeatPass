import React from 'react';

const Cart = ({ cartItems, onConfirmOrder }) => {
  // Calcular el total de precios
  const totalPrice = cartItems.reduce((total, item) => total + item.price, 0);

  return (
    <div className="cart-sidebar">
      <h3>Tu Carrito</h3>
      <ul className="cart-items">
        {cartItems.map((item, index) => (
          <li key={index} className="cart-item">
            <span>{item.name}</span>
            <span>${item.price.toFixed(2)}</span>
          </li>
        ))}
      </ul>
      <div className="cart-total">
        <strong>Total:</strong> ${totalPrice.toFixed(2)}
      </div>
      <button className="btn confirm-btn" onClick={onConfirmOrder}>
        Confirmar Orden
      </button>
    </div>
  );
};

export default Cart;
