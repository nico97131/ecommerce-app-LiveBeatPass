import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMusic } from '@fortawesome/free-solid-svg-icons';

const Navbar = ({ user, onLogout }) => {
  const navigate = useNavigate();

  const handleLoginRedirect = () => {
    navigate('/auth'); // Redirige al login o registro
  };

  return (
    <nav className="navbar">
      <div className="container">
        <h1 className="logo">
          <FontAwesomeIcon icon={faMusic} style={{ marginRight: '10px' }} />
          Live Beat Pass
        </h1>
        <div className="nav-links">
          {user ? (
            <>
              <span className="user-info">Hola, {user.email}</span>
              <button className="btn logout-btn" onClick={onLogout}>
                Cerrar sesión
              </button>
            </>
          ) : (
            <button className="btn login-btn" onClick={handleLoginRedirect}>
              Iniciar sesión
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
