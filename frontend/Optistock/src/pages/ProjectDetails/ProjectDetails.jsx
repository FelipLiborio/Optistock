import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import projetoService from '../../services/projeto/projetoService';
import simulacaoService from '../../services/simulacao/simulacaoService';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AssessmentIcon from '@mui/icons-material/Assessment';
import SavingsIcon from '@mui/icons-material/Savings';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceDot, Area, ComposedChart, ReferenceArea } from 'recharts';
import './ProjectDetails.css';

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [simulacoes, setSimulacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showChartModal, setShowChartModal] = useState(false);
  const [selectedSimulacao, setSelectedSimulacao] = useState(null);
  const [editingSimulacao, setEditingSimulacao] = useState(null);
  const [newSimulacao, setNewSimulacao] = useState({
    nome_produto: '',
    demanda_anual: '',
    custo_pedido: '',
    custo_manutencao: '',
    lote_atual_empresa: ''
  });

  useEffect(() => {
    loadProjectData();
  }, [id]);

  const loadProjectData = async () => {
    try {
      const [projectData, simulacoesData] = await Promise.all([
        projetoService.obterProjeto(id),
        simulacaoService.listarSimulacoes(id)
      ]);
      setProject(projectData);
      setSimulacoes(simulacoesData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      alert('Erro ao carregar projeto. Voltando para lista de projetos.');
      navigate('/projetos');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSimulacao = async (e) => {
    e.preventDefault();
    try {
      const dados = {
        nome_produto: newSimulacao.nome_produto,
        demanda_anual: parseFloat(newSimulacao.demanda_anual),
        custo_pedido: parseFloat(newSimulacao.custo_pedido),
        custo_manutencao: parseFloat(newSimulacao.custo_manutencao),
        lote_atual_empresa: newSimulacao.lote_atual_empresa ? parseFloat(newSimulacao.lote_atual_empresa) : null
      };
      
      await simulacaoService.criarSimulacao(id, dados);
      setShowModal(false);
      setNewSimulacao({
        nome_produto: '',
        demanda_anual: '',
        custo_pedido: '',
        custo_manutencao: '',
        lote_atual_empresa: ''
      });
      loadProjectData();
    } catch (error) {
      console.error('Erro ao criar simulação:', error);
      alert(error.message || 'Erro ao criar simulação');
    }
  };

  const handleEditSimulacao = (simulacao) => {
    setEditingSimulacao({
      id: simulacao.id,
      nome_produto: simulacao.nome_produto,
      demanda_anual: simulacao.demanda_anual.toString(),
      custo_pedido: simulacao.custo_pedido.toString(),
      custo_manutencao: simulacao.custo_manutencao.toString(),
      lote_atual_empresa: simulacao.lote_atual_empresa ? simulacao.lote_atual_empresa.toString() : ''
    });
    setShowEditModal(true);
  };

  const handleUpdateSimulacao = async (e) => {
    e.preventDefault();
    try {
      const dados = {
        nome_produto: editingSimulacao.nome_produto,
        demanda_anual: parseFloat(editingSimulacao.demanda_anual),
        custo_pedido: parseFloat(editingSimulacao.custo_pedido),
        custo_manutencao: parseFloat(editingSimulacao.custo_manutencao),
        lote_atual_empresa: editingSimulacao.lote_atual_empresa ? parseFloat(editingSimulacao.lote_atual_empresa) : null
      };
      
      await simulacaoService.atualizarSimulacao(id, editingSimulacao.id, dados);
      setShowEditModal(false);
      setEditingSimulacao(null);
      loadProjectData();
    } catch (error) {
      console.error('Erro ao atualizar simulação:', error);
      alert(error.message || 'Erro ao atualizar simulação');
    }
  };

  const handleDeleteSimulacao = async (idSimulacao, nomeProduto) => {
    if (!window.confirm(`Tem certeza que deseja excluir a simulação "${nomeProduto}"?`)) {
      return;
    }
    
    try {
      await simulacaoService.deletarSimulacao(id, idSimulacao);
      loadProjectData();
    } catch (error) {
      console.error('Erro ao excluir simulação:', error);
      alert(error.message || 'Erro ao excluir simulação');
    }
  };

  const calcularEconomiaTotal = () => {
    return simulacoes.reduce((total, sim) => total + (sim.economia_anual || 0), 0);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const calculateTotalCost = (D, S, H, Q) => {
    return (D * S) / Q + (Q * H) / 2;
  };

  const calculateOrderingCost = (D, S, Q) => {
    return (D * S) / Q;
  };

  const calculateHoldingCost = (H, Q) => {
    return (Q * H) / 2;
  };

  const generateChartData = (simulacao) => {
    const D = simulacao.demanda_anual;
    const S = simulacao.custo_pedido;
    const H = simulacao.custo_manutencao;
    const eoq = simulacao.lote_otimo_calculado;
    
    const data = [];
    const minQ = Math.max(1, Math.floor(eoq * 0.3));
    const maxQ = Math.ceil(eoq * 2);
    const step = Math.max(1, Math.ceil((maxQ - minQ) / 50));

    for (let Q = minQ; Q <= maxQ; Q += step) {
      const totalCost = calculateTotalCost(D, S, H, Q);
      const orderingCost = calculateOrderingCost(D, S, Q);
      const holdingCost = calculateHoldingCost(H, Q);
      
      data.push({
        Q: Q,
        custoTotal: Math.round(totalCost),
        custoPedido: Math.round(orderingCost),
        custoManutencao: Math.round(holdingCost),
        isOptimal: Math.abs(Q - eoq) < step * 2
      });
    }

    return data;
  };

  const handleShowChart = (simulacao) => {
    setSelectedSimulacao(simulacao);
    setShowChartModal(true);
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="chart-tooltip">
          <p className="tooltip-title">📊 Quantidade: {data.Q} unidades</p>
          <div className="tooltip-divider"></div>
          <p className="tooltip-item total">
            <span className="tooltip-label">💰 Custo Total:</span>
            <span className="tooltip-value">{formatCurrency(data.custoTotal)}</span>
          </p>
          <p className="tooltip-item">
            <span className="tooltip-label">📦 Custo de Pedido:</span>
            <span className="tooltip-value">{formatCurrency(data.custoPedido)}</span>
          </p>
          <p className="tooltip-item">
            <span className="tooltip-label">🏪 Custo de Manutenção:</span>
            <span className="tooltip-value">{formatCurrency(data.custoManutencao)}</span>
          </p>
          {data.isOptimal && (
            <p className="tooltip-optimal">⭐ Ponto Ótimo!</p>
          )}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="project-details-page">
        <div className="loading-screen">
          <div className="spinner"></div>
          <p>Carregando projeto...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return null;
  }

  return (
    <div className="project-details-page">
      <div className="project-details-container">
        {/* Cabeçalho */}
        <header className="project-details-header">
          <button onClick={() => navigate('/projetos')} className="btn-back">
            <ArrowBackIcon sx={{ fontSize: 20 }} />
            Voltar
          </button>
          
          <div className="project-info">
            <h1>{project.nome_grupo}</h1>
            <p className="project-desc">{project.descricao || 'Sem descrição'}</p>
          </div>

          <div className="header-actions">
            <button onClick={() => setShowModal(true)} className="btn-new-simulation">
              <AddIcon sx={{ fontSize: 20 }} />
              Nova Simulação
            </button>
            {simulacoes.length > 0 && (
              <button className="btn-report" disabled>
                <AssessmentIcon sx={{ fontSize: 20 }} />
                Relatório
              </button>
            )}
          </div>
        </header>

        {/* Card de Economia Total */}
        {simulacoes.length > 0 && (
          <div className="economia-card">
            <div className="economia-content">
              <span className="economia-label">Economia Total Anual</span>
              <span className="economia-value">{formatCurrency(calcularEconomiaTotal())}</span>
            </div>
            <div className="economia-icon">
              <SavingsIcon sx={{ fontSize: 64, color: '#4ade80' }} />
            </div>
          </div>
        )}

        {/* Tabela de Simulações */}
        {simulacoes.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📊</div>
            <h3>Nenhuma simulação criada</h3>
            <p>Comece criando sua primeira simulação de produto</p>
            <button onClick={() => setShowModal(true)} className="btn-create-first">
              <AddIcon sx={{ fontSize: 20 }} />
              Criar Primeira Simulação
            </button>
          </div>
        ) : (
          <div className="simulacoes-section">
            <h2>Simulações</h2>
            <div className="table-wrapper">
              <table className="simulacoes-table">
                <thead>
                  <tr>
                    <th>Produto</th>
                    <th>Demanda Anual</th>
                    <th>Lote Atual</th>
                    <th>Lote LEC</th>
                    <th>Economia</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {simulacoes.map((sim) => (
                    <tr key={sim.id}>
                      <td className="product-name">{sim.nome_produto}</td>
                      <td>{sim.demanda_anual.toLocaleString('pt-BR')} un/ano</td>
                      <td>{sim.lote_atual_empresa ? `${sim.lote_atual_empresa.toFixed(0)} un` : '-'}</td>
                      <td className="lec-value">{sim.lote_otimo_calculado.toFixed(0)} un</td>
                      <td>
                        <span className={`economia ${(sim.economia_anual || 0) > 0 ? 'positive' : 'neutral'}`}>
                          {sim.economia_anual ? formatCurrency(sim.economia_anual) : '-'}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button
                            onClick={() => handleShowChart(sim)}
                            className="btn-action btn-chart"
                            title="Ver Gráfico"
                          >
                            <ShowChartIcon sx={{ fontSize: 16 }} />
                          </button>
                          <button
                            onClick={() => handleEditSimulacao(sim)}
                            className="btn-action btn-edit"
                            title="Editar"
                          >
                            <EditIcon sx={{ fontSize: 16 }} />
                          </button>
                          <button
                            onClick={() => handleDeleteSimulacao(sim.id, sim.nome_produto)}
                            className="btn-action btn-delete"
                            title="Excluir"
                          >
                            <DeleteIcon sx={{ fontSize: 16 }} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Modal Nova Simulação */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Nova Simulação</h3>
              <button onClick={() => setShowModal(false)} className="modal-close">×</button>
            </div>
            
            <form onSubmit={handleCreateSimulacao} className="modal-form">
              <div className="form-group">
                <label htmlFor="nome_produto">Nome do Produto *</label>
                <input
                  type="text"
                  id="nome_produto"
                  value={newSimulacao.nome_produto}
                  onChange={(e) => setNewSimulacao({ ...newSimulacao, nome_produto: e.target.value })}
                  placeholder="Ex: Parafuso M8"
                  required
                  autoFocus
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="demanda_anual">Demanda Anual (D) *</label>
                  <input
                    type="number"
                    id="demanda_anual"
                    value={newSimulacao.demanda_anual}
                    onChange={(e) => setNewSimulacao({ ...newSimulacao, demanda_anual: e.target.value })}
                    placeholder="1000"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="custo_pedido">Custo do Pedido (S) *</label>
                  <input
                    type="number"
                    id="custo_pedido"
                    value={newSimulacao.custo_pedido}
                    onChange={(e) => setNewSimulacao({ ...newSimulacao, custo_pedido: e.target.value })}
                    placeholder="50.00"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="custo_manutencao">Custo de Manutenção (H) *</label>
                  <input
                    type="number"
                    id="custo_manutencao"
                    value={newSimulacao.custo_manutencao}
                    onChange={(e) => setNewSimulacao({ ...newSimulacao, custo_manutencao: e.target.value })}
                    placeholder="5.00"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="lote_atual_empresa">Lote Atual (Opcional)</label>
                  <input
                    type="number"
                    id="lote_atual_empresa"
                    value={newSimulacao.lote_atual_empresa}
                    onChange={(e) => setNewSimulacao({ ...newSimulacao, lote_atual_empresa: e.target.value })}
                    placeholder="100"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setShowModal(false)} className="btn-cancel">
                  Cancelar
                </button>
                <button type="submit" className="btn-submit">
                  Calcular e Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Editar Simulação */}
      {showEditModal && editingSimulacao && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Editar Simulação</h3>
              <button onClick={() => setShowEditModal(false)} className="modal-close">×</button>
            </div>
            
            <form onSubmit={handleUpdateSimulacao} className="modal-form">
              <div className="form-group">
                <label htmlFor="edit_nome_produto">Nome do Produto *</label>
                <input
                  type="text"
                  id="edit_nome_produto"
                  value={editingSimulacao.nome_produto}
                  onChange={(e) => setEditingSimulacao({ ...editingSimulacao, nome_produto: e.target.value })}
                  required
                  autoFocus
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="edit_demanda_anual">Demanda Anual (D) *</label>
                  <input
                    type="number"
                    id="edit_demanda_anual"
                    value={editingSimulacao.demanda_anual}
                    onChange={(e) => setEditingSimulacao({ ...editingSimulacao, demanda_anual: e.target.value })}
                    min="0"
                    step="0.01"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="edit_custo_pedido">Custo do Pedido (S) *</label>
                  <input
                    type="number"
                    id="edit_custo_pedido"
                    value={editingSimulacao.custo_pedido}
                    onChange={(e) => setEditingSimulacao({ ...editingSimulacao, custo_pedido: e.target.value })}
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="edit_custo_manutencao">Custo de Manutenção (H) *</label>
                  <input
                    type="number"
                    id="edit_custo_manutencao"
                    value={editingSimulacao.custo_manutencao}
                    onChange={(e) => setEditingSimulacao({ ...editingSimulacao, custo_manutencao: e.target.value })}
                    min="0"
                    step="0.01"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="edit_lote_atual_empresa">Lote Atual (Opcional)</label>
                  <input
                    type="number"
                    id="edit_lote_atual_empresa"
                    value={editingSimulacao.lote_atual_empresa}
                    onChange={(e) => setEditingSimulacao({ ...editingSimulacao, lote_atual_empresa: e.target.value })}
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setShowEditModal(false)} className="btn-cancel">
                  Cancelar
                </button>
                <button type="submit" className="btn-submit">
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal do Gráfico */}
      {showChartModal && selectedSimulacao && (() => {
        const chartData = generateChartData(selectedSimulacao);
        const eoq = selectedSimulacao.lote_otimo_calculado;
        const minCost = calculateTotalCost(
          selectedSimulacao.demanda_anual,
          selectedSimulacao.custo_pedido,
          selectedSimulacao.custo_manutencao,
          eoq
        );

        return (
          <div className="modal-overlay" onClick={() => setShowChartModal(false)}>
            <div className="modal-content modal-chart" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>📊 Gráfico: {selectedSimulacao.nome_produto}</h3>
                <button onClick={() => setShowChartModal(false)} className="modal-close">×</button>
              </div>
              
              <div className="chart-container">
                <p className="chart-description">
                  <strong>A Fórmula de Wilson em ação!</strong> O gráfico mostra a curva característica em forma de "U", 
                  onde o custo total diminui até o ponto ótimo e depois volta a subir. 
                  O ponto dourado ⭐ marca o <strong>Lote Econômico de Compra (Q* = {eoq.toFixed(0)})</strong>, 
                  que minimiza os custos totais.
                </p>
                
                <ResponsiveContainer width="100%" height={450}>
                  <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                    <defs>
                      <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4ade80" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#4ade80" stopOpacity={0.05}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(102, 126, 234, 0.2)" />
                    <XAxis 
                      dataKey="Q" 
                      label={{ value: 'Quantidade do Pedido (Q)', position: 'insideBottom', offset: -10, fill: '#667eea', fontSize: 14 }}
                      stroke="#667eea"
                      tick={{ fill: '#667eea' }}
                    />
                    <YAxis 
                      label={{ value: 'Custo (R$)', angle: -90, position: 'insideLeft', fill: '#667eea', fontSize: 14 }}
                      stroke="#667eea"
                      tick={{ fill: '#667eea' }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend 
                      wrapperStyle={{ color: '#667eea', paddingTop: '10px' }}
                      iconType="line"
                    />
                    
                    <ReferenceArea
                      x1={Math.max(1, eoq - eoq * 0.1)}
                      x2={eoq + eoq * 0.1}
                      fill="#fbbf24"
                      fillOpacity={0.1}
                      stroke="#fbbf24"
                      strokeDasharray="3 3"
                    />
                    
                    <Area
                      type="monotone"
                      dataKey="custoTotal"
                      fill="url(#colorTotal)"
                      stroke="none"
                    />
                    
                    <Line 
                      type="monotone" 
                      dataKey="custoTotal" 
                      stroke="#4ade80" 
                      strokeWidth={4}
                      dot={false}
                      name="💰 Custo Total"
                      activeDot={{ r: 6, fill: '#4ade80', stroke: '#fff', strokeWidth: 2 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="custoPedido" 
                      stroke="#60a5fa" 
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={false}
                      name="📦 Custo de Pedido"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="custoManutencao" 
                      stroke="#f472b6" 
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={false}
                      name="🏪 Custo de Manutenção"
                    />
                    
                    <ReferenceDot 
                      x={eoq} 
                      y={minCost} 
                      r={10} 
                      fill="#fbbf24" 
                      stroke="#fff"
                      strokeWidth={3}
                      label={{ value: '⭐', position: 'top', fill: '#fbbf24', fontSize: 20, offset: 10 }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
                
                <div className="chart-legend-extended">
                  <div className="legend-group">
                    <span className="legend-item">
                      <span className="legend-line total"></span>
                      Custo Total (U-shaped)
                    </span>
                    <span className="legend-item">
                      <span className="legend-line pedido"></span>
                      Custo de Pedido (decresce)
                    </span>
                    <span className="legend-item">
                      <span className="legend-line manutencao"></span>
                      Custo de Manutenção (cresce)
                    </span>
                  </div>
                  <div className="optimal-info">
                    <span className="legend-dot optimal"></span>
                    <strong>Ponto Ótimo: Q* = {eoq.toFixed(0)} unidades</strong>
                    <span className="optimal-cost">{formatCurrency(minCost)}/ano</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default ProjectDetails;
