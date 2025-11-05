// src/App.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';

// Importe as páginas
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ProdutosPage from './pages/ProdutosPage';
import ClientesPage from './pages/ClientesPage';
import VendasPage from './pages/VendasPage';

function App() {
  return (
    <Routes>
      {/* Rota pública */}
      <Route path="/login" element={<LoginPage />} />

      {/* Rotas privadas (só acessa logado) */}
      <Route element={<PrivateRoute />}>
        <Route element={<Layout />}> {/* (2) O Layout é o Dashboard */}
          <Route path="/" element={<DashboardPage />} />
          <Route path="/produtos" element={<ProdutosPage />} /> {/* (3) */}
          <Route path="/clientes" element={<ClientesPage />} /> {/* (4) */}
          <Route path="/vendas" element={<VendasPage />} /> {/* (5) */}
        </Route>
      </Route>
    </Routes>
  );
}

export default App;