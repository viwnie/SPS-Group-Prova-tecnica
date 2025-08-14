import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export function Home() {
  const { user, loading, error, logout } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className=" bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className=" bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p className="font-bold">Erro</p>
            <p>{error}</p>
          </div>
          <button
            onClick={logout}
            className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md"
          >
            Voltar ao Login
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className=" bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Usuário não encontrado</p>
          <button
            onClick={logout}
            className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md"
          >
            Voltar ao Login
          </button>
        </div>
      </div>
    );
  }

  const isAdmin = user.type === 'admin';

  if (!isAdmin) {
    return (
      <div className=" bg-gray-50">
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  Bem-vindo
                </h2>
                <p className="text-gray-600 mb-6">
                  Você está logado como <strong>{user.name}</strong> ({user.email})
                </p>
                <div className="border-t border-gray-200 pt-6">
                  <div className="mt-8 text-center">
                    <div className="text-8xl mb-4">😢</div>
                    <p className="text-lg text-gray-700 font-medium">
                      Acesso Restrito ao Dashboard
                    </p>
                    <p className="text-gray-600 mt-2 max-w-md mx-auto">
                      Para acessar funcionalidades administrativas, solicite permissão a um administrador do sistema.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className=" bg-gray-50">
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Bem-vindo
              </h2>
              <p className="text-gray-600 mb-6">
                Você está logado como <strong>{user.name}</strong> ({user.email})
              </p>
              <div className="mt-8 text-center">
                <div className="text-8xl mb-4">😊</div>
                <p className="text-lg text-gray-700 font-medium">
                  Dashboard Administrativo
                </p>
                <p className="text-gray-600 mt-2 max-w-md mx-auto">
                  Atualize, crie e gerencie usuários, altere suas informações e muito mais.
                </p>
              </div>
              <div className="border-t border-gray-200 pt-6">
                <div className="flex justify-center">
                  <button
                    onClick={() => navigate('/users')}
                    className="px-8 py-4 rounded-lg text-lg font-semibold transition-colors bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    Gerenciar Usuários
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
