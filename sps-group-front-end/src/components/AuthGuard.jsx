import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getItem } from '../utils/storage';

export function AuthGuard({ children }) {
  const { isAuthenticated, loading, hasInitialized } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Só executa verificações se a autenticação já foi inicializada
    if (!hasInitialized) {
      return;
    }

    const token = getItem('token');

    if (!token && location.pathname !== '/') {
      navigate('/', { replace: true });
      return;
    }

    if (!isAuthenticated && location.pathname !== '/') {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, hasInitialized, navigate, location.pathname]);

  // Mostra loading apenas enquanto a autenticação está sendo verificada
  if (loading || !hasInitialized) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated && location.pathname !== '/') {
    return null;
  }

  return children;
}
