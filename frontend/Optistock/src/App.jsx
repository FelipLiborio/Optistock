import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import NotFoundRedirect from './components/NotFoundRedirect';
import Layout from './components/Layout/Layout';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Home from './pages/Home/Home';
import Projects from './pages/Projects/Projects';
import About from './pages/About/About';
import ProjectDetails from './pages/ProjectDetails/ProjectDetails';
import SimulationForm from './pages/SimulationForm';
import Report from './pages/Report';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Layout><Home /></Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/home"
            element={
              <PrivateRoute>
                <Layout><Home /></Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/projetos"
            element={
              <PrivateRoute>
                <Layout><Projects /></Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/sobre"
            element={
              <PrivateRoute>
                <Layout><About /></Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/projeto/:id"
            element={
              <PrivateRoute>
                <Layout><ProjectDetails /></Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/projeto/:id/nova-simulacao"
            element={
              <PrivateRoute>
                <Layout><SimulationForm /></Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/projeto/:id/relatorio"
            element={
              <PrivateRoute>
                <Layout><Report /></Layout>
              </PrivateRoute>
            }
          />
          <Route path="*" element={<NotFoundRedirect />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;


