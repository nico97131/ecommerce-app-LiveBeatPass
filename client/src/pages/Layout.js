import React from 'react';
import Navbar from '../components/Navbar';
import ProductList from './ProductList';
import Cart from './Cart';
import AdminPanel from './AdminPanel';

const Layout = ({ user, onLogout }) => {
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar onLogout={onLogout} user={user} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {user?.role === 'admin' ? (
          <AdminPanel />
        ) : (
          <ProductList user={user} />
        )}
      </div>
    </div>
  );
};

export default Layout;
