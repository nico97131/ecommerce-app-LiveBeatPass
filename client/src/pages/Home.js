import React, { useEffect, useState } from 'react';
import ProductCard from '../components/ProductCard';

const Home = () => {
  const [products, setProducts] = useState([]); // Estado para almacenar productos
  const [loading, setLoading] = useState(true); // Estado para manejar la carga

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/products');
        const data = await response.json();
        console.log('Productos recibidos:', data); // Ver los productos recibidos
        setProducts(data); // Actualizar el estado
      } catch (error) {
        console.error('Error al obtener los productos:', error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchProducts();
  }, []);
  
  

  // Si está cargando, mostrar un mensaje de carga
  if (loading) {
    return <h2 style={{ textAlign: 'center', marginTop: '2rem' }}>Cargando productos...</h2>;
  }

  // Si no hay productos, mostrar un mensaje
  if (products.length === 0) {
    return <h2 style={{ textAlign: 'center', marginTop: '2rem' }}>No hay productos disponibles.</h2>;
  }

  return (
    <div className="home">
      <h1 style={{ textAlign: 'center', margin: '2rem 0' }}>Nuestros Productos</h1>
      <div className="products-grid">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default Home;
