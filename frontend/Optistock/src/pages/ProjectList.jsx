import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../services/api';
import './ProjectList.css';

const ProjectList = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newProject, setNewProject] = useState({ nome: '', descricao: '' });
  const navigate = useNavigate();

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const response = await apiClient.get('/projetos');
      setProjects(response.data);
    } catch (error) {
      console.error('Erro ao carregar projetos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      await apiClient.post('/projetos', newProject);
      setShowModal(false);
      setNewProject({ nome: '', descricao: '' });
      loadProjects();
    } catch (error) {
      console.error('Erro ao criar projeto:', error);
      alert('Erro ao criar projeto. Tente novamente.');
    }
  };

  const handleDeleteProject = async (id) => {
    if (!window.confirm('Deseja realmente excluir este projeto?')) return;
    
    try {
      await apiClient.delete(`/projetos/${id}`);
      loadProjects();
    } catch (error) {
      console.error('Erro ao excluir projeto:', error);
      alert('Erro ao excluir projeto.');
    }
  };

  if (loading) {
    return (
      <div className="project-list-container">
        <div className="loading">Carregando projetos...</div>
      </div>
    );
  }

  return (
    <div className="project-list-container">
      <div className="project-list-header">
        <div>
          <h1>Meus Projetos</h1>
          <p className="subtitle">Gerencie seus projetos de otimização de estoque</p>
        </div>
        <button className="btn-new-project" onClick={() => setShowModal(true)}>
          + Novo Projeto
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📦</div>
          <h2>Nenhum projeto criado ainda</h2>
          <p>Crie seu primeiro projeto para começar a otimizar seu estoque</p>
          <button className="btn-primary" onClick={() => setShowModal(true)}>
            Criar Primeiro Projeto
          </button>
        </div>
      ) : (
        <div className="projects-grid">
          {projects.map((project) => (
            <div key={project.id} className="project-card">
              <div className="project-card-header">
                <h3>{project.nome}</h3>
                <button 
                  className="btn-delete-small"
                  onClick={() => handleDeleteProject(project.id)}
                  title="Excluir projeto"
                >
                  ×
                </button>
              </div>
              <p className="project-description">{project.descricao}</p>
              <div className="project-stats">
                <div className="stat">
                  <span className="stat-value">{project.total_simulacoes || 0}</span>
                  <span className="stat-label">Simulações</span>
                </div>
              </div>
              <button 
                className="btn-view-simulations"
                onClick={() => navigate(`/projeto/${project.id}`)}
              >
                Ver Simulações →
              </button>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Novo Projeto</h2>
              <button className="btn-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleCreateProject}>
              <div className="form-group">
                <label htmlFor="nome">Nome do Projeto *</label>
                <input
                  type="text"
                  id="nome"
                  value={newProject.nome}
                  onChange={(e) => setNewProject({ ...newProject, nome: e.target.value })}
                  placeholder="Ex: Estoque de Pneus 2024"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="descricao">Descrição</label>
                <textarea
                  id="descricao"
                  value={newProject.descricao}
                  onChange={(e) => setNewProject({ ...newProject, descricao: e.target.value })}
                  placeholder="Descreva o objetivo deste projeto..."
                  rows="4"
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  Criar Projeto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectList;
