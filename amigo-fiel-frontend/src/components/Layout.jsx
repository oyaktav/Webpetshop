// src/components/Layout.jsx
import React from 'react';
// Usamos o Link normal do React Router
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div>
      <nav className="container-fluid"> {/* Barra de navegação com largura total */}
        <ul>
          <li><strong>Pet Shop Amigo Fiel</strong></li>
        </ul>
        <ul>
          {/* O Link do React Router é renderizado como <a> e o Pico estiliza */}
          <li><Link to="/produtos">Produtos</Link></li>
          <li><Link to="/clientes">Clientes</Link></li>
          <li><Link to="/vendas">Gestão de Vendas</Link></li>
        </ul>
        <ul>
          {user && <li>Olá, {user.username}!</li>}
          <li>
            <button onClick={handleLogout} className="secondary outline">
              Logout
            </button>
          </li>
        </ul>
      </nav>

      {/* Conteúdo principal com a classe que criamos no App.css */}
      <main className="container">
        <Outlet /> 
      </main>
    </div>
  );
}

export default Layout;