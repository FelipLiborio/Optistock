import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import authService from '../../services/auth/authService';
import HomeIcon from '@mui/icons-material/Home';
import FolderIcon from '@mui/icons-material/Folder';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import InsightsIcon from '@mui/icons-material/Insights';
import LogoutIcon from '@mui/icons-material/Logout';
import './Sidebar.css';

const Sidebar = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    authService.removeToken();
    navigate('/login');
  };

  const menuItems = [
    { 
      id: 'home', 
      label: 'Início', 
      icon: <HomeIcon />, 
      path: '/home' 
    },
    { 
      id: 'projects', 
      label: 'Projetos', 
      icon: <FolderIcon />, 
      path: '/projetos' 
    },
    { 
      id: 'about', 
      label: 'Sobre o LEC', 
      icon: <ShowChartIcon />, 
      path: '/sobre' 
    },
  ];

  const isActive = (path) => {
    return location.pathname === path || 
           (path === '/projetos' && location.pathname.startsWith('/projeto'));
  };

  return (
    <aside 
      className={`sidebar ${isExpanded ? 'expanded' : ''}`}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <span className="logo-icon"><InsightsIcon /></span>
          {isExpanded && <span className="logo-text">OptiStock</span>}
        </div>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <button
            key={item.id}
            className={`sidebar-item ${isActive(item.path) ? 'active' : ''}`}
            onClick={() => navigate(item.path)}
            title={!isExpanded ? item.label : ''}
          >
            <span className="item-icon">{item.icon}</span>
            {isExpanded && <span className="item-label">{item.label}</span>}
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button
          className="sidebar-item logout"
          onClick={handleLogout}
          title={!isExpanded ? 'Sair' : ''}
        >
          <span className="item-icon"><LogoutIcon /></span>
          {isExpanded && <span className="item-label">Sair</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
