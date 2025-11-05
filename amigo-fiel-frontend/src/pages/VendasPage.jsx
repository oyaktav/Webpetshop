// src/pages/VendasPage.jsx
import React, { useState, useEffect } from 'react';
import api from '../api';

function VendasPage() {
  const [clientes, setClientes] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // 1. Novo estado para guardar o HISTÓRICO de vendas
  const [salesHistory, setSalesHistory] = useState([]);

  const [form, setForm] = useState({
    cliente: '',
    produto: '',
    quantidade: 1,
    data_venda: new Date().toISOString().slice(0, 16),
  });
  
  const [error, setError] = useState(null);
  const [resumo, setResumo] = useState(null);

  // 2. Criamos uma função separada para buscar o histórico
  const fetchSalesHistory = async () => {
    try {
      // Adicionamos um "cachebuster" para forçar o refresh
      const res = await api.get(`/vendas/?cachebust=${new Date().getTime()}`);
      setSalesHistory(res.data);
    } catch (err) {
      console.error("Erro ao buscar histórico de vendas", err);
      // Não definimos o erro principal aqui, para não confundir o usuário
    }
  };

  const fetchInitialData = async () => {
    setIsLoading(true);
    try {
      // O Promise.all agora busca produtos e clientes
      const [produtosRes, clientesRes] = await Promise.all([
        api.get('/produtos/'),
        api.get('/clientes/')
      ]);
      setProdutos(produtosRes.data);
      setClientes(clientesRes.data);
    } catch (err) {
      console.error("Erro ao carregar dados:", err);
      setError("Não foi possível carregar clientes e produtos.");
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchInitialData();
    fetchSalesHistory(); // 3. Buscamos o histórico ao carregar a página
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  // Esta é a sua função handleSubmit com o 'catch' inteligente
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setResumo(null);

    if (form.quantidade <= 0) {
      setError("Quantidade deve ser positiva.");
      return;
    }
    if (!form.produto) {
        setError("Selecione um produto.");
        return;
    }

    try {
      const response = await api.post('/vendas/', {
        ...form,
        cliente: form.cliente ? parseInt(form.cliente) : null,
        produto: parseInt(form.produto),
        quantidade: parseInt(form.quantidade),
      });
      
      setResumo(response.data);
      fetchInitialData(); // Atualiza estoque na lista
      fetchSalesHistory(); // 4. ATUALIZA o histórico após a nova venda
      
      setForm(prev => ({ ...prev, produto: '', quantidade: 1, cliente: '', data_venda: new Date().toISOString().slice(0, 16) }));

    } catch (err) {
      console.error("Erro completo:", err.response);
      let errorMsg = "Erro desconhecido ao registrar a venda.";
      if (err.response && err.response.data) {
        if (err.response.data.erro) {
          errorMsg = err.response.data.erro;
        } else {
          const errors = Object.values(err.response.data);
          if (errors.length > 0 && Array.isArray(errors[0])) {
            errorMsg = errors[0][0];
          } else if (errors.length > 0) {
            errorMsg = String(errors[0]);
          }
        }
      }
      setError(errorMsg);
    }
  };

  if (isLoading) {
    return <progress />;
  }

  return (
    <div>
      <h2>Gestão de Vendas</h2>
      
      {/* --- GRID DO FORMULÁRIO E RESUMO (Igual a antes) --- */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gridGap: '2rem' }}>
        
        {/* Coluna 1: Formulário de Venda */}
        <form onSubmit={handleSubmit}>
          <h3 style={{ marginTop: 0 }}>Registrar Nova Venda</h3>
          
          <label htmlFor="data_venda">Data da Venda</label>
          <input
            type="datetime-local"
            name="data_venda"
            id="data_venda"
            value={form.data_venda}
            onChange={handleChange}
            required
          />

          <label htmlFor="cliente">Cliente</label>
          <select name="cliente" id="cliente" value={form.cliente} onChange={handleChange}>
            <option value="">(Cliente não informado)</option>
            {clientes.map(c => (
              <option key={c.id} value={c.id}>{c.nome}</option>
            ))}
          </select>

          <label htmlFor="produto">Produto</label>
          <select name="produto" id="produto" value={form.produto} onChange={handleChange} required>
            <option value="">Selecione um produto...</option>
            {produtos.map(p => (
              <option key={p.id} value={p.id} disabled={p.quantidade === 0}>
                {p.nome} (Estoque: {p.quantidade})
              </option>
            ))}
          </select>

          <label htmlFor="quantidade">Quantidade</label>
          <input
            type="number"
            name="quantidade"
            id="quantidade"
            value={form.quantidade}
            onChange={handleChange}
            min="1"
            required
          />

          <button type="submit" style={{ backgroundColor: 'var(--pico-color-green-500)', borderColor: 'var(--pico-color-green-500)' }}>
            Confirmar Venda
          </button>
        </form>

        {/* Coluna 2: Erros e Resumo */}
        <div>
          {error && (
            <article style={{ background: 'var(--pico-color-red-100)', borderColor: 'var(--pico-color-red-300)' }}>
              <h4 style={{ color: 'var(--pico-color-red-700)' }}>Falha ao Registrar Venda!</h4>
              <p style={{ color: 'var(--pico-color-red-700)' }}>{error}</p>
            </article>
          )}

          {/* O resumo da ÚLTIMA venda ainda aparece aqui */}
          {resumo && (
            <article style={{ background: 'var(--pico-color-green-100)', borderColor: 'var(--pico-color-green-300)' }}>
              <h4 style={{ color: 'var(--pico-color-green-700)' }}>Venda Realizada com Sucesso!</h4>
              <h2 style={{ color: 'var(--pico-color-green-700)', margin: 0 }}>R$ {resumo.valor_total}</h2>
              <p>em {new Date(resumo.data_venda).toLocaleString('pt-BR')}</p>
              <hr />
              <p><strong>Cliente:</strong> {resumo.cliente ? resumo.cliente.nome : 'Não informado'}</p>
              <p><strong>Produto:</strong> {resumo.produto.nome}</p>
              <p><strong>Quantidade:</strong> {resumo.quantidade}</p>
            </article>
          )}
        </div>
      </div>

      {/* --- 5. NOVA SEÇÃO DE HISTÓRICO DE VENDAS --- */}
      {/* ESTA É A PARTE QUE ESTAVA FALTANDO NO SEU ARQUIVO ANTIGO */}
      <div style={{ marginTop: '3rem' }}>
        <h2>Histórico de Vendas</h2>
        <figure>
          <table>
            <thead>
              <tr>
                <th scope="col">Data</th>
                <th scope="col">Cliente</th>
                <th scope="col">Produto</th>
                <th scope="col">Qtd.</th>
                <th scope="col">Valor Total</th>
                <th scope="col">Vendedor</th>
              </tr>
            </thead>
            <tbody>
              {salesHistory.length === 0 ? (
                <tr>
                  <td colSpan="6">Nenhuma venda registrada ainda.</td>
                </tr>
              ) : (
                salesHistory.map((venda) => (
                  <tr key={venda.id}>
                    <td>{new Date(venda.data_venda).toLocaleString('pt-BR')}</td>
                    <td>{venda.cliente ? venda.cliente.nome : 'Não informado'}</td>
                    <td>{venda.produto ? venda.produto.nome : 'N/A'}</td>
                    <td>{venda.quantidade}</td>
                    <td>R$ {venda.valor_total}</td>
                    <td>{venda.usuario ? venda.usuario.username : 'N/D'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </figure>
      </div>

    </div>
  );
}

export default VendasPage;