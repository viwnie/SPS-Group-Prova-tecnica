import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthTabs } from './pages/authTabs';
import { Home } from './pages/Home';
import { UsersManagement } from './pages/UsersManagement';
import { Profile } from './pages/Profile';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AuthGuard } from './components/AuthGuard';
import { AuthProvider } from './contexts/AuthContext';
import { Layout } from './components/Layout/Layout';

function App() {
  return (
    <Router>
      <AuthProvider>
        <AuthGuard>
          <Routes>
            <Route path="/" element={<AuthTabs />} />
            <Route path="/home" element={
              <ProtectedRoute>
                <Layout>
                  <Home />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/users" element={
              <ProtectedRoute>
                <Layout>
                  <UsersManagement />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <Layout>
                  <Profile />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthGuard>
      </AuthProvider>
    </Router>
  );
}

export default App;
