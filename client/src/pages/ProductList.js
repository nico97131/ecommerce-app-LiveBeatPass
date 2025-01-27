import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import defaultImagePre from './entradapre.jpg'; // Imagen cuando no hay sesión activa
import defaultImage from './entrada.jpg'; // Importa la imagen predeterminada
import './ProductList.css'; // Asegúrate de tener el archivo de estilos

const ProductList = ({ user }) => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [isCartVisible, setIsCartVisible] = useState(false);
  const [totalPrice, setTotalPrice] = useState(0);
  const [filters, setFilters] = useState({
    name: '',
    maxPrice: '',
    minPrice: '',
    category: '',
    sortOrder: '',
  });
  const [newProduct, setNewProduct] = useState({ name: '', price: 0, stock: 0, category: '' });


  useEffect(() => {
    console.log('Estado inicial del usuario:', user); // Verificar el usuario al cargar
    fetch('http://localhost:5000/api/products')
      .then((res) => {
        console.log('Estado de la respuesta:', res.status); // Log del estado HTTP
        if (!res.ok) {
          throw new Error(`Error al cargar productos: ${res.statusText}`);
        }
        return res.json();
      })
      .then((data) => {
        console.log('Productos cargados desde el backend:', data); // Log para verificar los productos cargados
        setProducts(data);
        setFilteredProducts(data);
      })
      .catch((err) => console.error('Error al cargar productos:', err));
  }, []);

  const applyFilters = () => {
    console.log('Aplicando filtros:', filters); // Log para verificar los filtros aplicados
    let filtered = [...products];

    // Filtrar por nombre
    if (filters.name) {
      filtered = filtered.filter((product) =>
        product.name.toLowerCase().includes(filters.name.toLowerCase())
      );
    }

    // Filtrar por precio mínimo
    if (filters.minPrice) {
      filtered = filtered.filter(
        (product) => product.price >= parseFloat(filters.minPrice)
      );
    }

    // Filtrar por precio máximo
    if (filters.maxPrice) {
      filtered = filtered.filter(
        (product) => product.price <= parseFloat(filters.maxPrice)
      );
    }

    // Filtrar por categoría
    if (filters.category) {
      filtered = filtered.filter(
        (product) => product.category === filters.category
      );
    }

    // Ordenar por precio
    if (filters.sortOrder === 'asc') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (filters.sortOrder === 'desc') {
      filtered.sort((a, b) => b.price - a.price);
    }

    setFilteredProducts(filtered);
  };

  useEffect(() => {
    applyFilters();
  }, [filters, products]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  const handleAddToCart = (product) => {
    if (user?.role === 'admin') {
      alert('Los administradores no pueden agregar productos al carrito.');
      return;
    }

    if (!user) {
      alert('Por favor, inicia sesión para agregar productos al carrito.');
      return;
    }

    if (product.stock <= 0) {
      alert('No hay stock disponible para este producto.');
      return;
    }

    console.log('Producto agregado al carrito:', product); // Log del producto añadido

    // Agregar producto al carrito
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === product.id);
      if (existingItem) {
        return prevItems.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        return [...prevItems, { ...product, quantity: 1 }];
      }
    });

    // Calcular nuevo total
    setTotalPrice((prevTotal) => prevTotal + product.price);

    // Mostrar el carrito
    setIsCartVisible(true);

    // Reducir el stock del producto
    fetch('http://localhost:5000/api/products/reduce-stock', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId: product.id, quantity: 1 }),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error('No se pudo actualizar el stock');
        }
        setProducts((prevProducts) =>
          prevProducts.map((p) =>
            p.id === product.id ? { ...p, stock: p.stock - 1 } : p
          )
        );
      })
      .catch((err) => console.error('Error al reducir stock:', err));
  };

  const handleDecreaseQuantity = (productId) => {
    setCartItems((prevItems) => {
      return prevItems
        .map((item) =>
          item.id === productId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0);
    });

    const product = cartItems.find((item) => item.id === productId);
    if (product) {
      setTotalPrice((prevTotal) => Math.max(prevTotal - product.price, 0));
    }
  };

  const handleConfirmOrder = () => {

    if (user?.role === 'admin') {
      alert('Los administradores no pueden realizar compras.');
      return;
    }
    
    if (cartItems.length === 0) {
      alert('El carrito está vacío');
      return;
    }

    const customerDni = user?.dni;
    const validCartItems = cartItems.filter(
      (item) => !isNaN(parseFloat(item.price)) && parseFloat(item.price) > 0
    );

    if (validCartItems.length !== cartItems.length) {
      alert('Algunos productos tienen datos inválidos. Por favor, revisa tu carrito.');
      return;
    }

    if (totalPrice <= 0) {
      alert('El precio total no es válido. Por favor, revisa tu carrito.');
      console.error('Precio total inválido:', totalPrice);
      return;
    }

    console.log('Confirmando orden con:', { customerDni, validCartItems, totalPrice }); // Log de confirmación

    navigate('/order-summary', {
      state: {
        cartItems: validCartItems,
        totalPrice,
        user,
      },
    });
  };

  // NUEVO: Manejar cambios en los inputs para editar productos
  const handleInputChange = (e, productId) => {
    const { name, value } = e.target;
    setProducts((prevProducts) =>
      prevProducts.map((product) =>
        product.id === productId ? { ...product, [name]: value } : product
      )
    );
  };


  return (
    <div className="product-list">
      <h2 className="section-title">Cartelera de Eventos</h2>

      {/* Filtros */}
      <div className="filters">
        <input
          type="text"
          name="name"
          placeholder="Buscar por nombre"
          value={filters.name}
          onChange={handleFilterChange}
          className="filter-input"
        />
        <input
          type="number"
          name="minPrice"
          placeholder="Precio mínimo"
          value={filters.minPrice}
          onChange={handleFilterChange}
          className="filter-input"
        />
        <input
          type="number"
          name="maxPrice"
          placeholder="Precio máximo"
          value={filters.maxPrice}
          onChange={handleFilterChange}
          className="filter-input"
        />
        <select
          name="sortOrder"
          value={filters.sortOrder}
          onChange={handleFilterChange}
          className="filter-select"
        >
          <option value="">Ordenar por precio</option>
          <option value="asc">Ascendente</option>
          <option value="desc">Descendente</option>
        </select>
        <select
          name="category"
          value={filters.category}
          onChange={handleFilterChange}
          className="filter-select"
        >
          <option value="">Seleccionar categoría</option>
          {Array.from(new Set(products.map((p) => p.category))).map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      {/* Lista de productos */}
      <div className="product-grid">
        {filteredProducts.map((product) => (
          <div key={product.id} className="product-card">
            <img
              src={user ? (product.image || defaultImage) : defaultImagePre} // Cambia la imagen según si hay sesión activa
              alt={product.name}
              className="product-image"
            />
            <h3 className="product-name">{product.name}</h3>
            <p className="product-price">${product.price.toFixed(2)}</p>
            <p className="product-stock">Stock: {user ? product.stock : 'Inicia sesión'}</p>
            
            {user?.role !== 'admin' && (
  <button
    className="btn add-to-cart-btn"
    onClick={() => handleAddToCart(product)}
  >
    Agregar al carrito
  </button>
)}
          </div>
        ))}
      </div>

      {/* Carrito flotante */}
      {isCartVisible && (
        <div className="cart-sidebar">
          <h3>Tu Carrito</h3>
          <p>Total de productos: {cartItems.length}</p>
          <p>
            Unidades seleccionadas:{' '}
            {cartItems.reduce((acc, item) => acc + item.quantity, 0)}
          </p>
          <ul className="cart-items">
            {cartItems.map((item) => (
              <li key={item.id} className="cart-item">
                <span>{item.name}</span>
                <span>
                  ${item.price.toFixed(2)} x {item.quantity}
                </span>
                <button
                  className="btn decrease-btn"
                  onClick={() => handleDecreaseQuantity(item.id)}
                >
                  -
                </button>
              </li>
            ))}
          </ul>
          <p className="cart-total">Total: ${totalPrice.toFixed(2)}</p>
          <button className="btn confirm-btn" onClick={handleConfirmOrder}>
            Confirmar Compra
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductList;
