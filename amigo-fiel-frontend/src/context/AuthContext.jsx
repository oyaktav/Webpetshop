// src/context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../api';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('accessToken'));

  useEffect(() => {
    // Se tiver token, define o usuário ao carregar
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUser({ username: decoded.username, id: decoded.user_id });
      } catch (e) {
        console.error("Token inválido", e);
        setToken(null);
        localStorage.removeItem('accessToken');
      }
    }
  }, [token]);

  const login = async (username, password) => {
    // (1) Chama a API de /token/
    const response = await api.post('/token/', { username, password });
    const accessToken = response.data.access;
    
    setToken(accessToken);
    localStorage.setItem('accessToken', accessToken);
    
    const decoded = jwtDecode(accessToken);
    setUser({ username: decoded.username, id: decoded.user_id });
  };

  const logout = () => {
    // (2) Opção de "Logout"
    setUser(null);
    setToken(null);
    localStorage.removeItem('accessToken');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);