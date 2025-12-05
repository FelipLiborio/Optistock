import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import projetoService from '../../services/projeto/projetoService';
import './Projects.css';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newProject, setNewProject] = useState({ nome_grupo: '', descricao: '' });
  const navigate = useNavigate();

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const data = await projetoService.listarProjetos();
      setProjects(data);
    } catch (error) {
      console.error('Erro ao carregar projetos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      await projetoService.criarProjeto(newProject.nome_grupo, newProject.descricao);
      setShowModal(false);
      setNewProject({ nome_grupo: '', descricao: '' });
      loadProjects();
    } catch (error) {
      console.error('Erro ao criar projeto:', error);
      alert(error.message || 'Erro ao criar projeto. Tente novamente.');
    }
  };

  const handleDeleteProject = async (id_grupo, nomeProjeto) => {
    if (!window.confirm(`Tem certeza que deseja excluir o projeto "${nomeProjeto}"?\nTodas as simulações serão perdidas.`)) {
      return;
    }
    
    try {
      await projetoService.deletarProjeto(id_grupo);
      loadProjects();
    } catch (error) {
      console.error('Erro ao excluir projeto:', error);
      alert(error.message || 'Erro ao excluir projeto.');
    }
  };

  if (loading) {
    return (
      <div className="projects-page">
        <div className="loading-screen">
          <div className="spinner"></div>
          <p>Carregando projetos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="projects-page">
      <div className="projects-container">
        <header className="projects-header">
          <div>
            <h1>Meus Projetos</h1>
            <p className="projects-subtitle">Gerencie seus projetos de otimização de estoque</p>
          </div>
          <button onClick={() => setShowModal(true)} className="btn-new-project">
            <span className="btn-icon">+</span>
            Novo Projeto
          </button>
        </header>

        {projects.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📂</div>
            <h3>Nenhum projeto criado ainda</h3>
            <p>Comece criando seu primeiro projeto para otimizar o estoque</p>
            <button onClick={() => setShowModal(true)} className="btn-create-first">
              Criar Primeiro Projeto
            </button>
          </div>
        ) : (
          <div className="projects-grid">
            {projects.map((project) => (
              <div key={project.id_grupo} className="project-card">
                <div className="project-header">
                  <h3 className="project-title">{project.nome_grupo}</h3>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteProject(project.id_grupo, project.nome_grupo);
                    }}
                    className="btn-delete"
                    title="Excluir projeto"
                  >
                    ×
                  </button>
                </div>
                
                <p className="project-description">
                  {project.descricao || 'Sem descrição'}
                </p>

                <div className="project-footer">
                  <div className="project-meta">
                    <span className="meta-item">
                      <span className="meta-icon">📅</span>
                      {new Date(project.data_criacao).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  
                  <button
                    onClick={() => navigate(`/projeto/${project.id_grupo}`)}
                    className="btn-open-project"
                  >
                    Abrir
                    <span className="arrow">→</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Criar Projeto */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Criar Novo Projeto</h3>
              <button onClick={() => setShowModal(false)} className="modal-close">×</button>
            </div>
            
            <form onSubmit={handleCreateProject} className="modal-form">
              <div className="form-group">
                <label htmlFor="nome_grupo">Nome do Projeto *</label>
                <input
                  type="text"
                  id="nome_grupo"
                  value={newProject.nome_grupo}
                  onChange={(e) => setNewProject({ ...newProject, nome_grupo: e.target.value })}
                  placeholder="Ex: Planejamento 2025"
                  required
                  autoFocus
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
                <button type="button" onClick={() => setShowModal(false)} className="btn-cancel">
                  Cancelar
                </button>
                <button type="submit" className="btn-submit">
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

export default Projects;
