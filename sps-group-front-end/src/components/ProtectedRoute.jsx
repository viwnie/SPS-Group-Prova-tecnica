import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getItem } from '../utils/storage';
import { useAuth } from '../contexts/AuthContext';

export function ProtectedRoute({ children }) {
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useAuth();

  useEffect(() => {
    const checkAuth = () => {
      const token = getItem('token');

      if (!token) {
        navigate('/', { replace: true });
        return;
      }

      if (!authLoading && !isAuthenticated) {
        navigate('/', { replace: true });
        return;
      }

      if (!authLoading) {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [navigate, isAuthenticated, authLoading]);

  if (isLoading || authLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return children;
}
