// src/pages/ClientesPage.jsx
import React, { useState, useEffect } from 'react';
import api from '../api';

// --- Formulário (agora direto na página) ---
const ClienteForm = ({ cliente, onSave, onCancel }) => {
  const [formData, setFormData] = useState({ nome: '', telefone: '', email: '' });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (cliente) {
      setFormData(cliente);
    } else {
      setFormData({ nome: '', telefone: '', email: '' });
    }
    setErrors({});
  }, [cliente]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.nome) newErrors.nome = 'Nome não pode ser vazio.';
    if (!formData.email.includes('@') || !formData.email.includes('.')) {
      newErrors.email = 'E-mail inválido. Deve conter @ e .';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3 style={{ marginTop: 0 }}>
        {cliente ? 'Editar Cliente' : 'Novo Cliente'}
      </h3>
      
      <label htmlFor="nome">Nome</label>
      <input name="nome" id="nome" value={formData.nome} onChange={handleChange} required />
      {errors.nome && <small style={{ color: 'var(--pico-color-red-500)' }}>{errors.nome}</small>}

      <label htmlFor="telefone">Telefone</label>
      <input name="telefone" id="telefone" type="tel" value={formData.telefone} onChange={handleChange} />
      
      <label htmlFor="email">E-mail</label>
      <input name="email" id="email" type="email" value={formData.email} onChange={handleChange} required />
      {errors.email && <small style={{ color: 'var(--pico-color-red-500)' }}>{errors.email}</small>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gridGap: '1rem' }}>
        <button type="submit">Salvar</button>
        {cliente && <button type="button" className="secondary" onClick={onCancel}>Cancelar Edição</button>}
      </div>
    </form>
  );
};


// --- Página Principal de Clientes ---
function ClientesPage() {
  const [clientes, setClientes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingCliente, setEditingCliente] = useState(null);

  const fetchClientes = async () => {
    try {
      const response = await api.get(`/clientes/?search=${searchTerm}`);
      setClientes(response.data);
    } catch (err) {
      console.error('Erro ao buscar clientes:', err);
    }
  };

  useEffect(() => {
    fetchClientes();
  }, [searchTerm]);

  const handleSave = async (clienteData) => {
    try {
      if (editingCliente) {
        await api.put(`/clientes/${editingCliente.id}/`, clienteData);
      } else {
        await api.post('/clientes/', clienteData);
      }
      setEditingCliente(null);
      fetchClientes();
    } catch (err) {
      console.error('Erro ao salvar cliente:', err);
      alert('Erro ao salvar. O e-mail já pode estar cadastrado.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir?')) {
      try {
        await api.delete(`/clientes/${id}/`);
        fetchClientes();
      } catch (err) {
        console.error('Erro ao excluir:', err);
        alert('Erro ao excluir. O cliente pode estar em uma venda.');
      }
    }
  };

  return (
    <div>
      <h2>Cadastro de Cliente</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gridGap: '2rem' }}>
        {/* Coluna da Tabela */}
        <div>
          <input
            type="search"
            placeholder="Buscar por nome..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <figure>
            <table>
              <thead>
                <tr>
                  <th scope="col">ID</th>
                  <th scope="col">Nome</th>
                  <th scope="col">Telefone</th>
                  <th scope="col">E-mail</th>
                  <th scope="col">Ações</th>
                </tr>
              </thead>
              <tbody>
                {clientes.map((c) => (
                  <tr key={c.id}>
                    <td>{c.id}</td>
                    <td>{c.nome}</td>
                    <td>{c.telefone}</td>
                    <td>{c.email}</td>
                    <td>
                      <button onClick={() => setEditingCliente(c)} className="secondary" style={{ marginRight: '8px', padding: '5px 10px' }}>
                        Editar
                      </button>
                      <button onClick={() => handleDelete(c.id)} className="outline" style={{ backgroundColor: 'var(--pico-color-red-500)', color: 'white', padding: '5px 10px' }}>
                        Excluir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </figure>
        </div>
        
        {/* Coluna do Formulário */}
        <div>
          <ClienteForm
            cliente={editingCliente}
            onSave={handleSave}
            onCancel={() => setEditingCliente(null)}
          />
        </div>
      </div>
    </div>
  );
}

export default ClientesPage;