// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { BrowserRouter } from 'react-router-dom';

// 1. Importa o Pico.css (Base)
import '@picocss/pico/css/pico.min.css';

// 2. Importa NOSSAS customizações de cor
// ESTA LINHA É A MAIS IMPORTANTE
import './App.css'; 

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);