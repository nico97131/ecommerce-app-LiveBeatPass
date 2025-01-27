import React, { useState } from 'react';
import './RegisterForm.css';


const RegisterForm = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    dni: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    zip_code: '',
    role: 'user', // Valor predeterminado
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Datos enviados al servidor:', formData); // Log de los datos enviados
  
    try {
      const response = await fetch('http://localhost:5000/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
  
      console.log('Estado de la respuesta del servidor:', response.status); // Log del estado de la respuesta
  
      if (response.ok) {
        const responseData = await response.text();
        console.log('Respuesta del servidor:', responseData); // Log de la respuesta del servidor
        alert('Usuario registrado con éxito.');
        setFormData({
          email: '',
          password: '',
          firstName: '',
          lastName: '',
          dni: '',
          phone: '',
          street: '',
          city: '',
          state: '',
          postalCode: '',
          role: 'user', // Valor predeterminado
        });
      } else {
        const errorData = await response.text();
        console.error('Error del servidor:', errorData); // Log de errores del servidor
        alert(`Error al registrar: ${errorData}`);
      }
    } catch (error) {
      console.error('Error en la solicitud:', error); // Log de errores de conexión
      alert('Hubo un problema al conectar con el servidor.');
    }
  };
  

  return (
    <form className="auth-container" onSubmit={handleSubmit}>
      <h1 className="auth-title">Registro</h1>
      <div className="form-sections">
        {/* Credenciales */}
        <div className="form-section">
          <h3>Credenciales</h3>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
              required
            />
          </div>
          <div className="form-group">
            <label>Contraseña</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Contraseña"
              required
            />
          </div>
        </div>

        {/* Datos Personales */}
        <div className="form-section">
          <h3>Datos Personales</h3>
          <div className="form-group">
            <label>Nombre</label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="Nombre"
              required
            />
          </div>
          <div className="form-group">
            <label>Apellido</label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Apellido"
              required
            />
          </div>
          <div className="form-group">
            <label>DNI</label>
            <input
              type="text"
              name="dni"
              value={formData.dni}
              onChange={handleChange}
              placeholder="DNI"
              required
            />
          </div>
          <div className="form-group">
            <label>Teléfono</label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Teléfono"
              required
            />
          </div>
        </div>

        {/* Domicilio */}
        <div className="form-section">
          <h3>Domicilio</h3>
          <div className="form-group">
            <label>Calle</label>
            <input
              type="text"
              name="street"
              value={formData.street}
              onChange={handleChange}
              placeholder="Calle"
              required
            />
          </div>
          <div className="form-group">
            <label>Ciudad</label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              placeholder="Ciudad"
              required
            />
          </div>
          <div className="form-group">
            <label>Estado</label>
            <input
              type="text"
              name="state"
              value={formData.state}
              onChange={handleChange}
              placeholder="Estado"
              required
            />
          </div>
          <div className="form-group">
            <label>Código Postal</label>
            <input
              type="text"
              name="zip_code"
              value={formData.zip_code}
              onChange={handleChange}
              placeholder="Código Postal"
              required
            />
          </div>
        </div>
      </div>

      <button className="form-button" type="submit">
        Registrarse
      </button>
    </form>
  );
};

export default RegisterForm;
