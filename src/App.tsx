import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './auth/useAuth';
import Login from './routes/Login';
import Dashboard from './routes/Dashboard';
import ExpedientesList from './routes/ExpedientesList';
import ExpedienteView from './routes/ExpedienteView';
import Catalogos from './routes/Catalogos';
import Usuarios from './routes/Usuarios';
import Informes from './routes/Informes';
import Layout from './components/layout/Layout';
import RequireAuth from './components/auth/RequireAuth';
import RequireRole from './components/auth/RequireRole';

function App() {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <Router basename="/expedientes">
      <Routes>
        <Route path="/login" element={currentUser ? <Navigate to="/" /> : <Login />} />
        
        <Route element={<RequireAuth><Layout /></RequireAuth>}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/expedientes" element={<ExpedientesList />} />
          <Route path="/expedientes/:id" element={<ExpedienteView />} />
          <Route path="/informes" element={<Informes />} />
          
          <Route 
            path="/catalogos" 
            element={
              <RequireRole roles={['admin']}>
                <Catalogos />
              </RequireRole>
            } 
          />
          
          <Route 
            path="/usuarios" 
            element={
              <RequireRole roles={['admin']}>
                <Usuarios />
              </RequireRole>
            } 
          />
        </Route>
        
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
