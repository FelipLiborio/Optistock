import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiClient } from '../services/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceDot } from 'recharts';
import './SimulationForm.css';

const SimulationForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nome: '',
    demanda: '',
    custo_pedido: '',
    custo_manutencao: ''
  });
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const calculateEOQ = (D, S, H) => {
    return Math.sqrt((2 * D * S) / H);
  };

  const calculateTotalCost = (D, S, H, Q) => {
    return (D * S) / Q + (Q * H) / 2;
  };

  const generateChartData = (D, S, H, eoq) => {
    const data = [];
    const minQ = Math.max(1, Math.floor(eoq * 0.3));
    const maxQ = Math.ceil(eoq * 2);
    const step = Math.ceil((maxQ - minQ) / 50);

    for (let Q = minQ; Q <= maxQ; Q += step) {
      const cost = calculateTotalCost(D, S, H, Q);
      data.push({
        Q: Q,
        custo: Math.round(cost),
        isOptimal: Math.abs(Q - eoq) < step
      });
    }

    return data;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const D = parseFloat(formData.demanda);
      const S = parseFloat(formData.custo_pedido);
      const H = parseFloat(formData.custo_manutencao);

      // Validações
      if (D <= 0 || S <= 0 || H <= 0) {
        alert('Todos os valores devem ser positivos!');
        setLoading(false);
        return;
      }

      // Calcular EOQ
      const eoq = calculateEOQ(D, S, H);
      const minCost = calculateTotalCost(D, S, H, eoq);

      // Calcular economia comparando com pedidos sem otimização (ex: pedidos mensais)
      const qSemOtimizacao = D / 12; // Pedidos mensais
      const custoSemOtimizacao = calculateTotalCost(D, S, H, qSemOtimizacao);
      const economia = custoSemOtimizacao - minCost;
      const economiaPercentual = (economia / custoSemOtimizacao) * 100;

      // Gerar dados do gráfico
      const chartData = generateChartData(D, S, H, eoq);

      setResults({
        eoq: Math.round(eoq),
        minCost: minCost,
        economia: economia,
        economiaPercentual: economiaPercentual,
        chartData: chartData,
        numeroPedidos: Math.ceil(D / eoq),
        intervaloReabastecimento: Math.round((eoq / D) * 365)
      });

      // Salvar no backend
      await apiClient.post(`/projetos/${id}/simulacoes`, {
        nome: formData.nome,
        demanda: D,
        custo_pedido: S,
        custo_manutencao: H
      });

    } catch (error) {
      console.error('Erro ao calcular/salvar:', error);
      alert('Erro ao processar simulação. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="label">{`Quantidade: ${payload[0].payload.Q} unidades`}</p>
          <p className="value">{`Custo Total: ${formatCurrency(payload[0].value)}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="simulation-form-container">
      <div className="simulation-header">
        <button className="btn-back" onClick={() => navigate(`/projeto/${id}`)}>
          ← Voltar
        </button>
        <h1>Nova Simulação EOQ</h1>
      </div>

      <div className="simulation-content">
        <div className="form-section">
          <div className="form-card">
            <h2>📋 Dados da Simulação</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="nome">Nome do Produto *</label>
                <input
                  type="text"
                  id="nome"
                  name="nome"
                  value={formData.nome}
                  onChange={handleChange}
                  placeholder="Ex: Pneu X200"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="demanda">
                  Demanda Anual (D) *
                  <span className="field-help">Unidades por ano</span>
                </label>
                <input
                  type="number"
                  id="demanda"
                  name="demanda"
                  value={formData.demanda}
                  onChange={handleChange}
                  placeholder="Ex: 1000"
                  min="1"
                  step="1"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="custo_pedido">
                  Custo por Pedido (S) *
                  <span className="field-help">R$ por pedido</span>
                </label>
                <input
                  type="number"
                  id="custo_pedido"
                  name="custo_pedido"
                  value={formData.custo_pedido}
                  onChange={handleChange}
                  placeholder="Ex: 100"
                  min="0.01"
                  step="0.01"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="custo_manutencao">
                  Custo de Manutenção Anual (H) *
                  <span className="field-help">R$ por unidade/ano</span>
                </label>
                <input
                  type="number"
                  id="custo_manutencao"
                  name="custo_manutencao"
                  value={formData.custo_manutencao}
                  onChange={handleChange}
                  placeholder="Ex: 5"
                  min="0.01"
                  step="0.01"
                  required
                />
              </div>

              <button 
                type="submit" 
                className="btn-calculate"
                disabled={loading}
              >
                {loading ? 'Calculando...' : '🚀 Calcular e Salvar'}
              </button>
            </form>
          </div>
        </div>

        {results && (
          <div className="results-section">
            <div className="results-cards">
              <div className="result-card highlight">
                <div className="result-icon">📦</div>
                <div className="result-info">
                  <h3>{results.eoq} unidades</h3>
                  <p>Lote Econômico de Compra (Q*)</p>
                </div>
              </div>

              <div className="result-card">
                <div className="result-icon">💰</div>
                <div className="result-info">
                  <h3>{formatCurrency(results.minCost)}</h3>
                  <p>Custo Total Mínimo Anual</p>
                </div>
              </div>

              <div className="result-card success">
                <div className="result-icon">📈</div>
                <div className="result-info">
                  <h3>{formatCurrency(results.economia)}</h3>
                  <p>Economia Estimada ({results.economiaPercentual.toFixed(1)}%)</p>
                </div>
              </div>

              <div className="result-card">
                <div className="result-icon">🔄</div>
                <div className="result-info">
                  <h3>{results.numeroPedidos} pedidos/ano</h3>
                  <p>A cada {results.intervaloReabastecimento} dias</p>
                </div>
              </div>
            </div>

            <div className="chart-card">
              <h2>📊 Curva de Custo Total</h2>
              <p className="chart-description">
                O gráfico mostra como o custo total varia com a quantidade do pedido. 
                O ponto mínimo (destacado) representa o lote econômico ideal.
              </p>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={results.chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis 
                    dataKey="Q" 
                    label={{ value: 'Quantidade do Pedido (Q)', position: 'insideBottom', offset: -10, fill: '#fff' }}
                    stroke="#fff"
                  />
                  <YAxis 
                    label={{ value: 'Custo Total (R$)', angle: -90, position: 'insideLeft', fill: '#fff' }}
                    stroke="#fff"
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ color: '#fff' }} />
                  <Line 
                    type="monotone" 
                    dataKey="custo" 
                    stroke="#4ade80" 
                    strokeWidth={3}
                    dot={false}
                    name="Custo Total"
                  />
                  <ReferenceDot 
                    x={results.eoq} 
                    y={results.minCost} 
                    r={8} 
                    fill="#fbbf24" 
                    stroke="#fff"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
              <div className="chart-legend">
                <span className="legend-item">
                  <span className="legend-dot optimal"></span>
                  Ponto Ótimo (Q* = {results.eoq})
                </span>
              </div>
            </div>

            <div className="action-buttons">
              <button 
                className="btn-new"
                onClick={() => {
                  setFormData({ nome: '', demanda: '', custo_pedido: '', custo_manutencao: '' });
                  setResults(null);
                }}
              >
                ➕ Nova Simulação
              </button>
              <button 
                className="btn-view-all"
                onClick={() => navigate(`/projeto/${id}`)}
              >
                📋 Ver Todas as Simulações
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SimulationForm;
