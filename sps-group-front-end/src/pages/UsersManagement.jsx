import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { userService } from '../services/api';

export function UsersManagement() {
  const { user, logout, refetchUser } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [editData, setEditData] = useState({});
  const [editLoading, setEditLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createData, setCreateData] = useState({
    name: '',
    email: '',
    password: '',
    type: 'user'
  });
  const [createLoading, setCreateLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const hasFetchedRef = useRef(false);
  const isFetchingRef = useRef(false);

  const fetchUsers = useCallback(async () => {
    if (isFetchingRef.current) {
      return;
    }

    try {
      isFetchingRef.current = true;
      setLoading(true);
      const usersData = await userService.getAllUsers();
      setUsers(usersData);
      hasFetchedRef.current = true;
      setIsInitialized(true);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      setError('Erro ao carregar lista de usuários');
      setIsInitialized(true);
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, []);

  useEffect(() => {
    if (!user || user.type !== 'admin') {
      navigate('/home');
      return;
    }
  }, [user?.type, navigate]);

  useEffect(() => {
    if (!user || user.type !== 'admin' || isInitialized) {
      return;
    }

    if (!hasFetchedRef.current && !isFetchingRef.current) {
      fetchUsers();
    }
  }, [user?.type, fetchUsers, isInitialized]);

  const startEditing = (userItem) => {
    setEditingUser(userItem.id);
    setEditData({
      name: userItem.name,
      email: userItem.email,
      type: userItem.type,
      password: ''
    });
  };

  const cancelEditing = () => {
    setEditingUser(null);
    setEditData({});
  };

  const handleEditChange = (field, value) => {
    setEditData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveEdit = async (userId) => {
    try {
      setEditLoading(true);

      const updateData = {
        name: editData.name,
        email: editData.email,
        type: editData.type
      };

      if (editData.password && editData.password.trim()) {
        if (editData.password.trim().length < 6) {
          window.alert('A senha deve ter pelo menos 6 caracteres');
          setEditLoading(false);
          return;
        }
        updateData.password = editData.password.trim();
      }

      await userService.updateUser(userId, updateData);

      await refreshUsers();
      setEditingUser(null);
      setEditData({});
      window.alert('Usuário atualizado com sucesso!');

      if (userId === user.id && editData.type === 'user') {
        window.alert('Seus privilégios de administrador foram removidos. Você será redirecionado para a página inicial.');

        setEditingUser(null);
        setEditData({});
        setEditLoading(false);

        logout();
        return;
      }
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      const errorMessage = error.message || 'Erro desconhecido';
      window.alert('Erro ao atualizar usuário: ' + errorMessage);

      if (errorMessage.includes('não pode remover seus próprios privilégios')) {
        window.alert('ATENÇÃO: Por segurança, você não pode remover seus próprios privilégios de administrador. Peça a outro admin para fazer essa alteração.');
      }
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    const isSelfDelete = userId === user.id;
    const confirmMessage = isSelfDelete
      ? `Tem certeza que deseja remover SUA PRÓPRIA CONTA "${userName}"? Esta ação não pode ser desfeita e você será deslogado do sistema.`
      : `Tem certeza que deseja remover o usuário "${userName}"? Esta ação não pode ser desfeita.`;

    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      setDeleteLoading(true);
      await userService.deleteUser(userId);

      if (isSelfDelete) {
        window.alert('Sua conta foi removida com sucesso! Você será redirecionado para a página de login.');
        logout();
        return;
      }

      await refreshUsers();
      window.alert('Usuário removido com sucesso!');
    } catch (error) {
      console.error('Erro ao remover usuário:', error);
      const errorMessage = error.message || 'Erro desconhecido';

      if (errorMessage.includes('último administrador')) {
        window.alert('ATENÇÃO: Não é possível remover sua conta pois você é o último administrador do sistema. Crie outro usuário administrador antes de remover sua conta.');
      } else {
        window.alert('Erro ao remover usuário: ' + errorMessage);
      }
    } finally {
      setDeleteLoading(false);
    }
  };

  const openCreateModal = () => {
    setShowCreateModal(true);
    setCreateData({
      name: '',
      email: '',
      password: '',
      type: 'user'
    });
  };

  const closeCreateModal = () => {
    setShowCreateModal(false);
    setCreateData({
      name: '',
      email: '',
      password: '',
      type: 'user'
    });
  };

  const handleCreateChange = (field, value) => {
    setCreateData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCreateUser = async () => {
    if (!createData.name.trim()) {
      window.alert('Nome é obrigatório');
      return;
    }

    if (!createData.email.trim()) {
      window.alert('Email é obrigatório');
      return;
    }

    if (!createData.password.trim()) {
      window.alert('Senha é obrigatória');
      return;
    }

    if (createData.password.trim().length < 6) {
      window.alert('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    try {
      setCreateLoading(true);

      const newUserData = {
        name: createData.name.trim(),
        email: createData.email.trim(),
        password: createData.password.trim(),
        type: createData.type
      };

      await userService.createUser(newUserData);

      await refreshUsers();
      closeCreateModal();
      window.alert('Usuário criado com sucesso!');
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      const errorMessage = error.message || 'Erro desconhecido';
      window.alert('Erro ao criar usuário: ' + errorMessage);
    } finally {
      setCreateLoading(false);
    }
  };

  const refreshUsers = async () => {
    try {
      setLoading(true);
      const usersData = await userService.getAllUsers();
      setUsers(usersData);
    } catch (error) {
      console.error('Erro ao atualizar lista de usuários:', error);
      setError('Erro ao atualizar lista de usuários');
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.type !== 'admin') {
    return null;
  }

  if (loading) {
    return (
      <div className="bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando usuários...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50">
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-medium text-gray-900">
                  Lista de Usuários ({users.length})
                </h2>
                <div className="flex space-x-3">
                  <button
                    onClick={openCreateModal}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Criar Usuário
                  </button>
                  <button
                    onClick={fetchUsers}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Atualizar
                  </button>
                </div>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                  {error}
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nome
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tipo
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ações
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Remover
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((userItem) => (
                      <tr key={userItem.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {userItem.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {editingUser === userItem.id ? (
                            <input
                              type="text"
                              value={editData.name}
                              onChange={(e) => handleEditChange('name', e.target.value)}
                              className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                          ) : (
                            userItem.name
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {editingUser === userItem.id ? (
                            <input
                              type="email"
                              value={editData.email}
                              onChange={(e) => handleEditChange('email', e.target.value)}
                              className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                          ) : (
                            userItem.email
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {editingUser === userItem.id ? (
                            <select
                              value={editData.type}
                              onChange={(e) => handleEditChange('type', e.target.value)}
                              className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                              <option value="user">user</option>
                              <option value="admin">admin</option>
                            </select>
                          ) : (
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${userItem.type === 'admin'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-green-100 text-green-800'
                              }`}>
                              {userItem.type}
                            </span>
                          )}
                          {editingUser === userItem.id && userItem.id === user.id && (
                            <p className="text-xs text-gray-500 mt-1">
                              ⚠️ Alterar seu tipo pode afetar seu acesso ao sistema
                            </p>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {editingUser === userItem.id ? (
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleSaveEdit(userItem.id)}
                                disabled={editLoading}
                                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${editLoading
                                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                  : 'bg-green-600 hover:bg-green-700 text-white'
                                  }`}
                              >
                                {editLoading ? 'Salvando...' : 'Salvar'}
                              </button>
                              <button
                                onClick={cancelEditing}
                                disabled={editLoading}
                                className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-3 py-1 rounded-md text-xs font-medium transition-colors"
                              >
                                Cancelar
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => startEditing(userItem)}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-xs font-medium transition-colors"
                            >
                              Editar
                            </button>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <button
                            onClick={() => handleDeleteUser(userItem.id, userItem.name)}
                            disabled={deleteLoading}
                            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${deleteLoading
                              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                              : userItem.id === user.id
                                ? 'bg-orange-600 hover:bg-orange-700 text-white'
                                : 'bg-red-600 hover:bg-red-700 text-white'
                              }`}
                            title={userItem.id === user.id ? 'Remover sua própria conta' : 'Remover usuário'}
                          >
                            {deleteLoading ? 'Removendo...' : userItem.id === user.id ? 'Remover Conta' : 'Remover'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {editingUser && (
                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                  <h4 className="text-sm font-medium text-yellow-800 mb-2">Alterando Senha (Opcional)</h4>
                  <input
                    type="password"
                    value={editData.password}
                    onChange={(e) => handleEditChange('password', e.target.value)}
                    placeholder="Deixe em branco para manter a senha atual"
                    className="w-full px-3 py-2 border border-yellow-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                  <p className="text-xs text-yellow-600 mt-1">
                    Digite uma nova senha apenas se desejar alterá-la. Mínimo 6 caracteres.
                  </p>

                  {editingUser === user.id && (
                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
                      <p className="text-xs text-blue-800 font-medium">
                        ⚠️ Editando seu próprio perfil
                      </p>
                      <p className="text-xs text-blue-600 mt-1">
                        Você pode alterar seu tipo de usuário. Se se tornar usuário comum, será redirecionado para a página inicial.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Criar Novo Usuário
                </h3>
                <button
                  onClick={closeCreateModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome *
                  </label>
                  <input
                    type="text"
                    value={createData.name}
                    onChange={(e) => handleCreateChange('name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Nome completo"
                    disabled={createLoading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={createData.email}
                    onChange={(e) => handleCreateChange('email', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="email@exemplo.com"
                    disabled={createLoading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Senha *
                  </label>
                  <input
                    type="password"
                    value={createData.password}
                    onChange={(e) => handleCreateChange('password', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Mínimo 6 caracteres"
                    disabled={createLoading}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Mínimo 6 caracteres
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo de Usuário
                  </label>
                  <select
                    value={createData.type}
                    onChange={(e) => handleCreateChange('type', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    disabled={createLoading}
                  >
                    <option value="user">Usuário Comum</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={handleCreateUser}
                    disabled={createLoading}
                    className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${createLoading
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-green-600 hover:bg-green-700 text-white'
                      }`}
                  >
                    {createLoading ? 'Criando...' : 'Criar Usuário'}
                  </button>
                  <button
                    onClick={closeCreateModal}
                    disabled={createLoading}
                    className="flex-1 px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-md text-sm font-medium transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
