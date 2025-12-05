import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiClient } from '../services/api';
import './ProjectDetails.css';

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [simulations, setSimulations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProjectData();
  }, [id]);

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

  const calculateEOQ = (D, S, H) => {
    if (!D || !S || !H) return 0;
    return Math.sqrt((2 * D * S) / H);
  };

  const calculateTotalCost = (D, S, H, Q) => {
    if (!Q) return 0;
    return (D * S) / Q + (Q * H) / 2;
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
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
                const eoq = calculateEOQ(sim.demanda, sim.custo_pedido, sim.custo_manutencao);
                const totalCost = calculateTotalCost(
                  sim.demanda,
                  sim.custo_pedido,
                  sim.custo_manutencao,
                  eoq
                );

                return (
                  <tr key={sim.id}>
                    <td className="product-name">{sim.nome}</td>
                    <td>{sim.demanda.toLocaleString('pt-BR')} un/ano</td>
                    <td>{formatCurrency(sim.custo_pedido)}</td>
                    <td>{formatCurrency(sim.custo_manutencao)}</td>
                    <td className="eoq-value">{Math.round(eoq)} unidades</td>
                    <td className="cost-value">{formatCurrency(totalCost)}</td>
                    <td>
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
                  const eoq = calculateEOQ(sim.demanda, sim.custo_pedido, sim.custo_manutencao);
                  return acc + calculateTotalCost(sim.demanda, sim.custo_pedido, sim.custo_manutencao, eoq);
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
