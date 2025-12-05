import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

const Dashboard = () => {
  const { user, logout } = useAuth();

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1 className="dashboard-title">OptiStock</h1>
        <div className="user-section">
          <span className="user-name">Olá, {user?.nome}</span>
          <button onClick={logout} className="logout-button">
            Sair
          </button>
        </div>
      </header>

      <main className="dashboard-content">
        <div className="welcome-card">
          <h2>Bem-vindo ao OptiStock!</h2>
          <p>Sistema de Otimização de Estoque</p>
          <div className="user-info">
            <p><strong>Email:</strong> {user?.email}</p>
            <p><strong>Membro desde:</strong> {new Date(user?.data_criacao).toLocaleDateString()}</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
