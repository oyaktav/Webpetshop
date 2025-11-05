// src/pages/LoginPage.jsx
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await login(username, password);
      navigate('/');
    } catch (err) {
      console.error(err);
      setError('Falha no login. Verifique seu usuário e senha.');
    }
  };

  return (
    // Usamos o "role=document" para o Pico estilizar o fundo
    <main className="container" style={{ maxWidth: '500px', marginTop: '5rem' }}>
      <article role="document">
        <form onSubmit={handleSubmit}>
          <h2 style={{ textAlign: 'center' }}>Login - Amigo Fiel</h2>
          
          <label htmlFor="username">Usuário:</label>
          <input
            type="text"
            id="username"
            name="username"
            placeholder="seu.usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          
          <label htmlFor="password">Senha:</label>
          <input
            type="password"
            id="password"
            name="password"
            placeholder="sua.senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          
          {error && (
            <p style={{ color: 'var(--pico-color-red-500)' }}>
              <strong>{error}</strong>
            </p>
          )}
          
          <button type="submit">Entrar</button>
        </form>
      </article>
    </main>
  );
}

export default LoginPage;