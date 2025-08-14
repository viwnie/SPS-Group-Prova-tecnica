import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { userService } from '../services/api';

export function Profile() {
  const { user, logout, refetchUser } = useAuth();
  const navigate = useNavigate();
  const [editData, setEditData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [localUser, setLocalUser] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setLocalUser(user);
      setEditData({
        name: user.name,
        email: user.email,
        password: '',
        confirmPassword: ''
      });
    }
  }, [user]);

  const handleEditChange = (field, value) => {
    setEditData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const startEditing = () => {
    setIsEditing(true);
    setError(null);
    setSuccess(null);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setEditData({
      name: localUser?.name || user?.name,
      email: localUser?.email || user?.email,
      password: '',
      confirmPassword: ''
    });
    setError(null);
    setSuccess(null);
  };

  const handleSaveProfile = async () => {
    if (editData.password !== editData.confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    if (editData.password && editData.password.trim().length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const updateData = {
        name: editData.name,
        email: editData.email
      };

      if (editData.password && editData.password.trim()) {
        updateData.password = editData.password.trim();
      }

      await api.put(`/users/${user.id}`, updateData);

      const updatedUser = {
        ...localUser,
        name: editData.name,
        email: editData.email
      };
      setLocalUser(updatedUser);

      setSuccess('Perfil atualizado com sucesso!');
      setIsEditing(false);

      await refetchUser();

      setEditData(prev => ({
        ...prev,
        password: '',
        confirmPassword: ''
      }));
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      setError('Erro ao atualizar perfil: ' + (error.response?.data?.message || 'Erro desconhecido'));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm(`Tem certeza que deseja remover SUA CONTA "${localUser?.name || user?.name}"? Esta ação não pode ser desfeita e você será deslogado do sistema.`)) {
      return;
    }

    try {
      setDeleteLoading(true);
      await userService.deleteUser(user.id);
      window.alert('Sua conta foi removida com sucesso! Você será redirecionado para a página de login.');
      logout();
    } catch (error) {
      console.error('Erro ao remover conta:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Erro desconhecido';

      if (errorMessage.includes('último administrador')) {
        window.alert('ATENÇÃO: Não é possível remover sua conta pois você é o último administrador do sistema. Crie outro usuário administrador antes de remover sua conta.');
      } else {
        window.alert('Erro ao remover conta: ' + errorMessage);
      }
    } finally {
      setDeleteLoading(false);
    }
  };

  if (!user && !localUser) {
    return null;
  }

  return (
    <div className=" bg-gray-50">
      <main className="max-w-3xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-medium text-gray-900">
                  Informações do Perfil
                </h2>
                {!isEditing && (
                  <button
                    onClick={startEditing}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Editar Perfil
                  </button>
                )}
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                  {error}
                </div>
              )}

              {success && (
                <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
                  {success}
                </div>
              )}

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editData.name}
                      onChange={(e) => handleEditChange('name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      disabled={loading}
                    />
                  ) : (
                    <p className="text-gray-900">{localUser?.name || user?.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={editData.email}
                      onChange={(e) => handleEditChange('email', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      disabled={loading}
                    />
                  ) : (
                    <p className="text-gray-900">{localUser?.email || user?.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Usuário
                  </label>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${(localUser?.type || user?.type) === 'admin' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                    }`}>
                    {localUser?.type || user?.type}
                  </span>
                  <p className="text-xs text-gray-500 mt-1">
                    O tipo de usuário não pode ser alterado
                  </p>
                </div>

                {isEditing && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nova Senha (opcional)
                      </label>
                      <input
                        type="password"
                        value={editData.password}
                        onChange={(e) => handleEditChange('password', e.target.value)}
                        placeholder="Deixe em branco para manter a senha atual"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        disabled={loading}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Mínimo 6 caracteres
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Confirmar Nova Senha
                      </label>
                      <input
                        type="password"
                        value={editData.confirmPassword}
                        onChange={(e) => handleEditChange('confirmPassword', e.target.value)}
                        placeholder="Confirme a nova senha"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        disabled={loading}
                      />
                    </div>
                  </>
                )}

                {isEditing && (
                  <div className="flex space-x-3 pt-4">
                    <button
                      onClick={handleSaveProfile}
                      disabled={loading}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${loading
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-green-600 hover:bg-green-700 text-white'
                        }`}
                    >
                      {loading ? 'Salvando...' : 'Salvar Alterações'}
                    </button>
                    <button
                      onClick={cancelEditing}
                      disabled={loading}
                      className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                )}
              </div>

              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-red-800 mb-2">
                    Zona de Perigo
                  </h3>
                  <p className="text-sm text-red-700 mb-4">
                    As ações abaixo são irreversíveis. Tenha muito cuidado ao utilizá-las.
                  </p>

                  <button
                    onClick={handleDeleteAccount}
                    disabled={deleteLoading}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${deleteLoading
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-red-600 hover:bg-red-700 text-white'
                      }`}
                  >
                    {deleteLoading ? 'Removendo...' : 'Remover Minha Conta'}
                  </button>

                  <p className="text-xs text-red-600 mt-2">
                    ⚠️ Esta ação removerá permanentemente sua conta e todos os dados associados.
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
