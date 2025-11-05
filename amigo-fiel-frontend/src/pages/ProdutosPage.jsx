// src/pages/ProdutosPage.jsx
import React, { useState, useEffect } from 'react';
import api from '../api';

// --- Formulário (agora direto na página) ---
const ProdutoForm = ({ produto, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    nome: '', categoria: '', preco: '', quantidade: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (produto) {
      setFormData(produto);
    } else {
      setFormData({ nome: '', categoria: '', preco: '', quantidade: '' });
    }
    setErrors({});
  }, [produto]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.nome) newErrors.nome = 'Nome não pode ser vazio.';
    if (formData.preco <= 0) newErrors.preco = 'Preço deve ser maior que zero.';
    if (formData.quantidade < 0 || formData.quantidade === '') newErrors.quantidade = 'Quantidade deve ser >= 0.';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3 style={{ marginTop: 0 }}>
        {produto ? 'Editar Produto' : 'Novo Produto'}
      </h3>
      
      <label htmlFor="nome">Nome</label>
      <input name="nome" id="nome" value={formData.nome} onChange={handleChange} required />
      {errors.nome && <small style={{ color: 'var(--pico-color-red-500)' }}>{errors.nome}</small>}

      <label htmlFor="categoria">Categoria</label>
      <input name="categoria" id="categoria" value={formData.categoria} onChange={handleChange} />

      <label htmlFor="preco">Preço (R$)</label>
      <input name="preco" id="preco" type="number" step="0.01" value={formData.preco} onChange={handleChange} required />
      {errors.preco && <small style={{ color: 'var(--pico-color-red-500)' }}>{errors.preco}</small>}
      
      <label htmlFor="quantidade">Quantidade (Estoque)</label>
      <input name="quantidade" id="quantidade" type="number" value={formData.quantidade} onChange={handleChange} required />
      {errors.quantidade && <small style={{ color: 'var(--pico-color-red-500)' }}>{errors.quantidade}</small>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gridGap: '1rem' }}>
        <button type="submit">Salvar</button>
        {produto && <button type="button" className="secondary" onClick={onCancel}>Cancelar Edição</button>}
      </div>
    </form>
  );
};


// --- Página Principal de Produtos ---
function ProdutosPage() {
  const [produtos, setProdutos] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingProduto, setEditingProduto] = useState(null);

  const fetchProdutos = async () => {
    try {
      const response = await api.get(`/produtos/?search=${searchTerm}`);
      setProdutos(response.data);
    } catch (err) {
      console.error('Erro ao buscar produtos:', err);
    }
  };

  useEffect(() => {
    fetchProdutos();
  }, [searchTerm]);

  const handleSave = async (produtoData) => {
    try {
      if (editingProduto) {
        await api.put(`/produtos/${editingProduto.id}/`, produtoData);
      } else {
        await api.post('/produtos/', produtoData);
      }
      setEditingProduto(null);
      fetchProdutos();
    } catch (err) {
      console.error('Erro ao salvar produto:', err);
      alert('Erro ao salvar.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir?')) {
      try {
        await api.delete(`/produtos/${id}/`);
        fetchProdutos();
      } catch (err) {
        console.error('Erro ao excluir:', err);
        alert('Erro ao excluir. O produto pode estar em uma venda.');
      }
    }
  };

  return (
    <div>
      <h2>Cadastro de Produto</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gridGap: '2rem' }}>
        {/* Coluna da Tabela */}
        <div>
          <input
            type="search"
            placeholder="Buscar por nome..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <figure> {/* O Pico usa <figure> para tabelas rolarem no mobile */}
            <table>
              <thead>
                <tr>
                  <th scope="col">ID</th>
                  <th scope="col">Nome</th>
                  <th scope="col">Preço</th>
                  <th scope="col">Estoque</th>
                  <th scope="col">Ações</th>
                </tr>
              </thead>
              <tbody>
                {produtos.map((p) => (
                  <tr key={p.id}>
                    <td>{p.id}</td>
                    <td>{p.nome}</td>
                    <td>R$ {p.preco}</td>
                    <td>
                      {p.quantidade}
                      {/* Alerta de Estoque Baixo (3) */}
                      {p.quantidade < 5 && 
                        <strong title="Estoque Baixo!" style={{ color: 'var(--pico-color-orange-500)', marginLeft: '8px' }}>
                          ⚠️
                        </strong>
                      }
                    </td>
                    <td>
                      <button onClick={() => setEditingProduto(p)} className="secondary" style={{ marginRight: '8px', padding: '5px 10px' }}>
                        Editar
                      </button>
                      <button onClick={() => handleDelete(p.id)} className="outline" style={{ backgroundColor: 'var(--pico-color-red-500)', color: 'white', padding: '5px 10px' }}>
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
          <ProdutoForm
            produto={editingProduto}
            onSave={handleSave}
            onCancel={() => setEditingProduto(null)}
          />
        </div>
      </div>
    </div>
  );
}

export default ProdutosPage;