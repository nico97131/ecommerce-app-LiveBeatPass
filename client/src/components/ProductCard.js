import React from 'react';

const ProductCard = ({ product, isLoggedIn }) => {
  return (
    <div className="product-card">
      <img src={product.image} alt={product.name} />
      <h3>{product.name}</h3>
      <p>${parseFloat(product.price).toFixed(2)}</p>
      <button
        onClick={() =>
          isLoggedIn
            ? alert(`¡Agregaste ${product.name} al carrito!`)
            : alert('Debes iniciar sesión para agregar productos al carrito')
        }
        disabled={!isLoggedIn}
      >
        {isLoggedIn ? 'Agregar al carrito' : 'Inicia sesión'}
      </button>
    </div>
  );
};


export default ProductCard;
