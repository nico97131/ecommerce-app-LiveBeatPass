import React, { useState } from 'react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import './AuthPage.css';

const AuthPage = ({ onLogin }) => {
  const [showLogin, setShowLogin] = useState(true);

  const handleLogin = (userData) => {
    // Asegúrate de que todos los datos del usuario se pasen correctamente
    const user = {
      email: userData.email || '',
      firstName: userData.firstName || '',
      lastName: userData.lastName || '',
      phone: userData.phone || '',
      dni: userData.dni || '',
      street: userData.street || '',
      city: userData.city || '',
      state: userData.state || '',
      zipCode: userData.zipCode || '',
      role: userData.role
    };

    console.log('Usuario autenticado:', user); // Agrega un log para depurar

    // Llama a la función onLogin y pasa el usuario completo
    onLogin(user);

    // Almacena el token en el localStorage si está presente
    if (userData.token) {
      localStorage.setItem('token', userData.token);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h1 className="auth-title">
          {showLogin ? 'Bienvenido' : 'Únete a Nosotros'}
        </h1>
        <p className="auth-subtitle">
          {showLogin
            ? 'Si ya tienes una cuenta, inicia sesión para continuar:'
            : 'Regístrate y comienza tu experiencia personalizada con nosotros.'}
        </p>
        <div className="auth-form-wrapper">
          {showLogin ? (
            <>
              <LoginForm onLogin={handleLogin} />
              <p className="auth-toggle">
                ¿No tienes una cuenta?{' '}
                <button
  onClick={() => setShowLogin(false)}
  className="text-white bg-blue-600 hover:bg-blue-700 py-2 px-4 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105"
>
  Regístrate
</button>
              </p>
            </>
          ) : (
            <>
              <RegisterForm />
              <p className="auth-toggle">
                ¿Ya tienes una cuenta?{' '}
                <button
  onClick={() => setShowLogin(true)}
  className="text-white bg-green-600 hover:bg-green-700 py-2 px-4 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105"
>
  Inicia Sesión
</button>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
