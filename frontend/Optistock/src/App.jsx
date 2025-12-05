import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ProjectList from './pages/ProjectList';
import ProjectDetails from './pages/ProjectDetails';
import SimulationForm from './pages/SimulationForm';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/projetos"
            element={
              <PrivateRoute>
                <ProjectList />
              </PrivateRoute>
            }
          />
          <Route
            path="/projeto/:id"
            element={
              <PrivateRoute>
                <ProjectDetails />
              </PrivateRoute>
            }
          />
          <Route
            path="/projeto/:id/nova-simulacao"
            element={
              <PrivateRoute>
                <SimulationForm />
              </PrivateRoute>
            }
          />
          <Route path="/" element={<Navigate to="/projetos" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

