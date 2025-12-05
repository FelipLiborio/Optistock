import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NotFoundRedirect = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Carregando...</p>
      </div>
    );
  }

  return isAuthenticated ? <Navigate to="/home" replace /> : <Navigate to="/login" replace />;
};

export default NotFoundRedirect;
