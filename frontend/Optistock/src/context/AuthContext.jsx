import { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/auth/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = authService.getToken();
      if (token && !authService.isTokenExpired(token)) {
        const userData = authService.getUserDataFromToken(token);
        setUser(userData);
        setIsAuthenticated(true);
      } else {
        authService.removeToken();
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error);
      authService.removeToken();
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, senha) => {
    try {
      const response = await authService.login(email, senha);
      authService.setToken(response.token);
      const userData = authService.getUserDataFromToken(response.token);
      setUser(userData);
      setIsAuthenticated(true);
      return response;
    } catch (error) {
      throw error;
    }
  };

  const register = async (nome, email, senha) => {
    try {
      const response = await authService.register(nome, email, senha);
      authService.setToken(response.token);
      const userData = authService.getUserDataFromToken(response.token);
      setUser(userData);
      setIsAuthenticated(true);
      return response;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    authService.removeToken();
    setUser(null);
    setIsAuthenticated(false);
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

