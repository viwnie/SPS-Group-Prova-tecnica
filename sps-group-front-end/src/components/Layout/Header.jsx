import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';

export function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);


  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavigation = (path) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
  };

  const isAdmin = user?.type === 'admin';


  const routeTitles = {
    '/': 'SPS Group - Dashboard',
    '/home': 'SPS Group - Dashboard',
    '/users': 'Gerenciamento de Usuários',
    '/profile': 'Meu Perfil',
  };

  const getPageTitle = () => {
    return routeTitles[location.pathname] || 'SPS Group - Dashboard';
  };

  const isSpecialPage = location.pathname === '/users' || location.pathname === '/profile';

  const shouldShowBackButton = isSpecialPage && location.pathname !== '/home';

  return (
    <header className={`bg-white transition-all duration-300 ${isScrolled ? 'shadow-lg' : 'shadow-sm'
      } border-b sticky top-0 z-50`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            {shouldShowBackButton && (
              <button
                onClick={() => handleNavigation("/home")}
                className="text-gray-600 hover:text-gray-900 transition-colors p-2 rounded-lg hover:bg-gray-100"
                aria-label="Voltar para o início"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            <h1 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">
              {getPageTitle()}
            </h1>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <div className="text-sm text-gray-700">
              <span className="font-medium">{user?.name || 'Usuário'}</span>
              {isAdmin && (
                <span className="ml-2 bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">
                  Admin
                </span>
              )}
            </div>
            <button
              onClick={() => handleNavigation('/profile')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 hover:shadow-md"
            >
              Meu Perfil
            </button>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 hover:shadow-md"
            >
              Sair
            </button>
          </div>

          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-600 hover:text-gray-900 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Abrir menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-gray-50">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {/* User Info */}
              <div className="px-3 py-2 text-sm text-gray-700 border-b border-gray-200">
                <div className="font-medium">{user?.name || 'Usuário'}</div>
                <div className="text-gray-500">{user?.email}</div>
                {isAdmin && (
                  <span className="inline-block mt-1 bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">
                    Administrador
                  </span>
                )}
              </div>

              <button
                onClick={() => handleNavigation('/home')}
                className="w-full text-left px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
              >
                Dashboard
              </button>

              <button
                onClick={() => handleNavigation('/profile')}
                className="w-full text-left px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
              >
                Meu Perfil
              </button>

              {isAdmin && (
                <button
                  onClick={() => handleNavigation('/users')}
                  className="w-full text-left px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                >
                  Gerenciar Usuários
                </button>
              )}

              <button
                onClick={handleLogout}
                className="w-full text-left px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50 rounded-md transition-colors"
              >
                Sair
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
