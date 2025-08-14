import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { userService } from '../services/api';
import { getItem, removeItem, setItem } from '../utils/storage';
import { useNavigate, useLocation } from 'react-router-dom';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasInitialized, setHasInitialized] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const isInitializedRef = useRef(false);
  const isFetchingRef = useRef(false);
  const lastFetchTimeRef = useRef(0);
  const CACHE_DURATION = 5 * 60 * 1000;

  const fetchUserData = useCallback(async (force = false) => {
    if (isFetchingRef.current) {
      return;
    }

    if (!force && isInitializedRef.current && user) {
      const now = Date.now();
      if (now - lastFetchTimeRef.current < CACHE_DURATION) {
        return;
      }
    }

    try {
      isFetchingRef.current = true;
      setLoading(true);
      setError(null);

      const token = getItem('token');
      if (!token) {
        setLoading(false);
        setHasInitialized(true);
        isInitializedRef.current = true;
        return;
      }

      const userData = await userService.getProfile();
      setUser(userData);
      setHasInitialized(true);
      isInitializedRef.current = true;
      lastFetchTimeRef.current = Date.now();
    } catch (error) {
      setError(error.message || 'Erro ao carregar dados do usuário');

      if (error.message?.includes('Token inválido') || error.message?.includes('Token não fornecido')) {
        removeItem('token');
        if (location.pathname !== '/') {
          navigate('/', { replace: true });
        }
      }
      setHasInitialized(true);
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, [navigate, location.pathname]); // Removido 'user' da dependência para evitar loop

  const login = useCallback((token) => {
    setItem('token', token);
    isInitializedRef.current = false;
    lastFetchTimeRef.current = 0;
    fetchUserData(true);
  }, [fetchUserData]);

  const logout = useCallback(() => {
    removeItem('token');
    setUser(null);
    setError(null);
    setHasInitialized(false);
    isInitializedRef.current = false;
    lastFetchTimeRef.current = 0;
    isFetchingRef.current = false;
    navigate('/', { replace: true });
  }, [navigate]);

  const refetchUser = useCallback(() => {
    // Evita múltiplas chamadas simultâneas
    if (isFetchingRef.current) {
      return;
    }
    fetchUserData(true);
  }, [fetchUserData]);

  useEffect(() => {
    if (!hasInitialized && !isInitializedRef.current) {
      fetchUserData();
    }
  }, [hasInitialized, fetchUserData]);

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    refetchUser,
    isAuthenticated: !!user,
    hasInitialized
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}
