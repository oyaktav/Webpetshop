// src/components/PrivateRoute.jsx
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate, Outlet } from 'react-router-dom';

const PrivateRoute = () => {
  const { token } = useAuth();
  // Se não estiver logado, redireciona para /login
  return token ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;
