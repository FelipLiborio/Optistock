import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiClient } from '../services/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Scatter, ScatterChart, ZAxis, ReferenceDot } from 'recharts';
import './ProjectDetails.css';

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [simulations, setSimulations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSimulation, setSelectedSimulation] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [loadingChart, setLoadingChart] = useState(false);

  const loadProjectData = async () => {
    try {
      const [projectRes, simulationsRes] = await Promise.all([
        apiClient.get(`/projetos/${id}`),
        apiClient.get(`/projetos/${id}/simulacoes`)
      ]);
      setProject(projectRes.data);
      setSimulations(simulationsRes.data);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      alert('Erro ao carregar projeto.');
      navigate('/projetos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjectData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleDeleteSimulation = async (simulationId) => {
    if (!window.confirm('Deseja realmente excluir esta simulação?')) return;

    try {
      await apiClient.delete(`/simulacoes/${simulationId}`);
      loadProjectData();
    } catch (error) {
      console.error('Erro ao excluir simulação:', error);
      alert('Erro ao excluir simulação.');
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const loadChartData = async (simulationId) => {
    setLoadingChart(true);
    try {
      console.log('Carregando dados do gráfico para simulação:', simulationId);
      const response = await apiClient.get(`/projetos/${id}/simulacoes/${simulationId}/grafico`);
      console.log('Resposta da API:', response.data);
      const data = response.data;
      
      // Transforma os dados para o formato do Recharts
      const chartPoints = data.valores_lote.map((lote, index) => ({
        lote: lote,
        custo: data.valores_custo[index]
      }));

      const selectedSim = simulations.find(s => s.id === simulationId);
      console.log('Simulação selecionada:', selectedSim);
      
      setChartData({
        points: chartPoints,
        optimal: data.ponto_otimo,
        current: data.ponto_atual
      });
      
      setSelectedSimulation(selectedSim);
    } catch (error) {
      console.error('Erro ao carregar dados do gráfico:', error);
      alert('Erro ao carregar gráfico: ' + (error.response?.data?.detail || error.message));
    } finally {
      setLoadingChart(false);
    }
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ backgroundColor: 'white', padding: '10px', border: '1px solid #ccc', borderRadius: '5px' }}>
          <p><strong>Lote:</strong> {Math.round(payload[0].payload.lote)} unidades</p>
          <p><strong>Custo:</strong> {formatCurrency(payload[0].payload.custo)}</p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="project-details-container">
        <div className="loading">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="project-details-container">
      <div className="project-details-header">
        <button className="btn-back" onClick={() => navigate('/projetos')}>
          ← Voltar
        </button>
        <div className="project-info">
          <h1>{project?.nome}</h1>
          <p className="project-desc">{project?.descricao}</p>
        </div>
        <button 
          className="btn-new-simulation"
          onClick={() => navigate(`/projeto/${id}/nova-simulacao`)}
        >
          + Nova Simulação
        </button>
      </div>

      {simulations.length === 0 ? (
        <div className="empty-simulations">
          <div className="empty-icon">📊</div>
          <h2>Nenhuma simulação criada</h2>
          <p>Crie sua primeira simulação para otimizar o estoque</p>
          <button 
            className="btn-primary"
            onClick={() => navigate(`/projeto/${id}/nova-simulacao`)}
          >
            Criar Primeira Simulação
          </button>
        </div>
      ) : (
        <div className="simulations-table-container">
          <table className="simulations-table">
            <thead>
              <tr>
                <th>Produto</th>
                <th>Demanda (D)</th>
                <th>Custo Pedido (S)</th>
                <th>Custo Manutenção (H)</th>
                <th>Lote Econômico (Q*)</th>
                <th>Custo Total Mínimo</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {simulations.map((sim) => {
                return (
                  <tr key={sim.id}>
                    <td className="product-name">{sim.nome_produto}</td>
                    <td>{sim.demanda_anual.toLocaleString('pt-BR')} un/ano</td>
                    <td>{formatCurrency(sim.custo_pedido)}</td>
                    <td>{formatCurrency(sim.custo_manutencao)}</td>
                    <td className="eoq-value">{Math.round(sim.lote_otimo_calculado)} unidades</td>
                    <td className="cost-value">{formatCurrency(sim.custo_total_otimo)}</td>
                    <td>
                      <button
                        className="btn-action"
                        onClick={() => loadChartData(sim.id)}
                        title="Ver gráfico"
                      >
                        📊
                      </button>
                      <button
                        className="btn-delete-sim"
                        onClick={() => handleDeleteSimulation(sim.id)}
                        title="Excluir simulação"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {chartData && selectedSimulation && (
        <div className="chart-container">
          <div className="chart-header">
            <h2>Análise de Custo Total - {selectedSimulation.nome_produto}</h2>
            <button className="btn-close-chart" onClick={() => setChartData(null)}>✕</button>
          </div>
          {loadingChart ? (
            <div className="loading">Carregando gráfico...</div>
          ) : (
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={chartData.points} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="lote" 
                  label={{ value: 'Tamanho do Lote (unidades)', position: 'insideBottom', offset: -10 }}
                />
                <YAxis 
                  label={{ value: 'Custo Total (R$)', angle: -90, position: 'insideLeft' }}
                  tickFormatter={(value) => `R$ ${value.toFixed(0)}`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="custo" 
                  stroke="#8884d8" 
                  name="Custo Total"
                  dot={false}
                  strokeWidth={2}
                />
                {chartData.optimal && (
                  <ReferenceDot
                    x={chartData.optimal.lote}
                    y={chartData.optimal.custo}
                    r={8}
                    fill="green"
                    stroke="darkgreen"
                    strokeWidth={2}
                    label={{ value: '★ Ponto Ótimo', position: 'top', fill: 'green', fontWeight: 'bold' }}
                  />
                )}
                {chartData.current && (
                  <ReferenceDot
                    x={chartData.current.lote}
                    y={chartData.current.custo}
                    r={8}
                    fill="orange"
                    stroke="darkorange"
                    strokeWidth={2}
                    label={{ value: '● Lote Atual', position: 'bottom', fill: 'orange', fontWeight: 'bold' }}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          )}
          <div className="chart-info">
            <div className="info-box optimal">
              <h4>🎯 Ponto Ótimo</h4>
              <p><strong>Lote:</strong> {Math.round(chartData.optimal.lote)} unidades</p>
              <p><strong>Custo:</strong> {formatCurrency(chartData.optimal.custo)}</p>
            </div>
            {chartData.current && (
              <div className="info-box current">
                <h4>📦 Lote Atual da Empresa</h4>
                <p><strong>Lote:</strong> {Math.round(chartData.current.lote)} unidades</p>
                <p><strong>Custo:</strong> {formatCurrency(chartData.current.custo)}</p>
                <p className="savings"><strong>Economia Potencial:</strong> {formatCurrency(chartData.current.custo - chartData.optimal.custo)}</p>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="summary-cards">
        <div className="summary-card">
          <div className="summary-icon">📦</div>
          <div className="summary-info">
            <h3>{simulations.length}</h3>
            <p>Simulações Criadas</p>
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-icon">💰</div>
          <div className="summary-info">
            <h3>
              {formatCurrency(
                simulations.reduce((acc, sim) => {
                  return acc + (sim.custo_total_otimo || 0);
                }, 0)
              )}
            </h3>
            <p>Custo Total Projetado</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails;
