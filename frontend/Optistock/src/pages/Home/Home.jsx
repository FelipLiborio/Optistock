import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../../services/auth/authService';
import projetoService from '../../services/projeto/projetoService';
import FolderIcon from '@mui/icons-material/Folder';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import WavingHandIcon from '@mui/icons-material/WavingHand';
import './Home.css';

const Home = () => {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({ totalProjects: 0, memberSince: '' });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadHomeData();
  }, []);

  const loadHomeData = async () => {
    try {
      const token = authService.getToken();
      
      if (!token) {
        navigate('/login');
        return;
      }

      const [userData, projectsData] = await Promise.all([
        authService.getUserData(),
        projetoService.listarProjetos()
      ]);

      setUser(userData);
      setStats({
        totalProjects: projectsData.length,
        memberSince: userData.data_criacao ? new Date(userData.data_criacao).toLocaleDateString('pt-BR', { 
          year: 'numeric', 
          month: 'long' 
        }) : 'Data não disponível'
      });
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      if (error.message.includes('Token') || error.message.includes('401')) {
        authService.removeToken();
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  const getUserName = () => {
    if (!user) return 'Usuário';
    return user.nome || user.email?.split('@')[0] || 'Usuário';
  };

  if (loading) {
    return (
      <div className="home-page">
        <div className="loading-screen">
          <div className="spinner"></div>
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="home-page">
      <div className="home-container">
        <header className="dashboard-header">
          <h1>
            {getGreeting()}, <span className="highlight">{getUserName()}</span>! <WavingHandIcon sx={{ fontSize: 48, verticalAlign: 'middle' }} />
          </h1>
          <p className="header-subtitle">Seja bem-vindo ao OptiStock</p>
        </header>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon"><FolderIcon sx={{ fontSize: 48 }} /></div>
            <div className="stat-content">
              <span className="stat-number">{stats.totalProjects}</span>
              <span className="stat-label">Projeto{stats.totalProjects !== 1 ? 's' : ''} Ativo{stats.totalProjects !== 1 ? 's' : ''}</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon"><CalendarMonthIcon sx={{ fontSize: 48 }} /></div>
            <div className="stat-content">
              <span className="stat-number">Membro desde</span>
              <span className="stat-label">{stats.memberSince}</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon"><ShowChartIcon sx={{ fontSize: 48 }} /></div>
            <div className="stat-content">
              <span className="stat-number">Otimização LEC</span>
              <span className="stat-label">Fórmula de Wilson</span>
            </div>
          </div>
        </div>

        <div className="quick-actions">
          <h2>Acesso Rápido</h2>
          <div className="actions-grid">
            <button 
              className="action-card"
              onClick={() => navigate('/projetos')}
            >
              <span className="action-icon"><FolderIcon sx={{ fontSize: 48 }} /></span>
              <h3>Meus Projetos</h3>
              <p>Gerencie e visualize todos os seus projetos de otimização</p>
              <span className="action-arrow">→</span>
            </button>

            <button 
              className="action-card"
              onClick={() => navigate('/sobre')}
            >
              <span className="action-icon"><ShowChartIcon sx={{ fontSize: 48 }} /></span>
              <h3>Sobre o LEC</h3>
              <p>Entenda como funciona a otimização de estoque</p>
              <span className="action-arrow">→</span>
            </button>
          </div>
        </div>

        <div className="info-section">
          <h2>O que é o OptiStock?</h2>
          <p>
            O OptiStock é uma ferramenta profissional para otimização de estoque utilizando o 
            <strong> Lote Econômico de Compra (LEC)</strong>, também conhecido como Fórmula de Wilson.
            Nossa plataforma calcula a quantidade ideal de compra que minimiza custos totais de 
            armazenamento e pedidos.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;

