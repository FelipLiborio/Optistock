import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import projetoService from '../../services/projeto/projetoService';
import simulacaoService from '../../services/simulacao/simulacaoService';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AssessmentIcon from '@mui/icons-material/Assessment';
import './ProjectDetails.css';

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [simulacoes, setSimulacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
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
              <button 
                className="btn-report" 
                onClick={() => navigate(`/projeto/${id}/relatorio`)}
              >
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
            <div className="economia-icon">💰</div>
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
    </div>
  );
};

export default ProjectDetails;
