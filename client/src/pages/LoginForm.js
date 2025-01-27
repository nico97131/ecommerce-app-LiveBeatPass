import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginForm.css';

const LoginForm = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      console.log('Intentando iniciar sesión con:', { email, password }); // Log de las credenciales ingresadas

      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      console.log('Respuesta del servidor:', response.status); // Log del estado de la respuesta

      if (response.ok) {
        const { token, user } = await response.json();
        console.log('Datos completos del usuario recibidos:', user); // Log para depuración
        localStorage.setItem('token', token); // Guarda el token en localStorage
        console.log('Token guardado en localStorage:', token); // Log adicional

        onLogin({
          email: user.email || '',
          firstName: user.firstName || 'No disponible',
          lastName: user.lastName || 'No disponible',
          phone: user.phone || 'No disponible',
          dni: user.dni || '',
          street: user.street || '',
          city: user.city || '',
          state: user.state || '',
          zipCode: user.zipCode || '',
          role: user.role, // Asegúrate de pasar el rol recibido
        }); // Envía todos los datos al estado global

        console.log('Datos pasados a onLogin:', {
          email: user.email || '',
          firstName: user.firstName || 'No disponible',
          lastName: user.lastName || 'No disponible',
          phone: user.phone || 'No disponible',
          dni: user.dni || '',
          street: user.street || '',
          city: user.city || '',
          state: user.state || '',
          zipCode: user.zipCode || '',
          role: user.role,
        }); // Log para confirmar datos enviados a onLogin

        navigate('/'); // Redirige a la página principal
      } else {
        const errorMessage = await response.text();
        console.log('Error de autenticación:', errorMessage); // Log del error recibido
        setError(errorMessage);
      }
    } catch (err) {
      console.error('Error al conectar con el servidor:', err); // Log del error de conexión
      setError('Error al conectar con el servidor.');
    }
  };

  return (
    <form className="login-form" onSubmit={handleSubmit}>
      {error && <p className="error-message">{error}</p>}
      <div className="form-group">
        <label>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="form-group">
        <label>Contraseña</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      <button type="submit" className="btn">Iniciar Sesión</button>
    </form>
  );
};

export default LoginForm;
