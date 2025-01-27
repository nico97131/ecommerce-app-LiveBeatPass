import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './pages/Layout';
import AuthPage from './pages/AuthPage';
import ProductList from './pages/ProductList';
import OrderSummary from './pages/OrderSummary';

const App = () => {
  const [user, setUser] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);

  const handleLogin = (userData) => {
    setUser(userData); // Actualiza el estado global del usuario
    localStorage.setItem('token', userData.token); // Guarda el token en localStorage
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('token'); // Elimina el token al cerrar sesión
  };

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <Layout user={user} onLogout={handleLogout}>
              <ProductList
                user={user}
                cartItems={cartItems}
                setCartItems={setCartItems}
                totalPrice={totalPrice}
                setTotalPrice={setTotalPrice}
              />
            </Layout>
          }
        />
        <Route path="/auth" element={<AuthPage onLogin={handleLogin} />} />
        <Route
          path="/order-summary"
          element={
            <OrderSummary
              user={user}
              cartItems={cartItems}
              totalPrice={totalPrice}
            />
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
