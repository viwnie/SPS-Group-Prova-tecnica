import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { UsersManagement } from '../UsersManagement';
import { useAuth } from '../../contexts/AuthContext';
import { userService } from '../../services/api';

jest.mock('../../contexts/AuthContext');
jest.mock('../../services/api');

const mockUser = {
  id: 1,
  name: 'Admin User',
  email: 'admin@test.com',
  type: 'admin'
};

const mockUsers = [
  { id: 1, name: 'Admin User', email: 'admin@test.com', type: 'admin' },
  { id: 2, name: 'Regular User', email: 'user@test.com', type: 'user' }
];

describe('UsersManagement', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAuth.mockReturnValue({
      user: mockUser,
      logout: jest.fn(),
      refetchUser: jest.fn()
    });
    userService.getAllUsers.mockResolvedValue(mockUsers);
    userService.deleteUser.mockResolvedValue({ message: 'Usuário deletado com sucesso' });
    userService.updateUser.mockResolvedValue({ user: mockUsers[0] });
    userService.createUser.mockResolvedValue({ user: mockUsers[1] });
  });

  describe('Rendering', () => {
    it('should render users management page for admin user', async () => {
      render(<UsersManagement />);

      await waitFor(() => {
        expect(screen.getByText('Lista de Usuários (2)')).toBeInTheDocument();
      });
    });

    it('should not render for non-admin user', () => {
      useAuth.mockReturnValue({
        user: { ...mockUser, type: 'user' },
        logout: jest.fn(),
        refetchUser: jest.fn()
      });

      const { container } = render(<UsersManagement />);
      expect(container.firstChild).toBeNull();
    });

    it('should show loading state initially', () => {
      render(<UsersManagement />);
      expect(screen.getByText('Carregando usuários...')).toBeInTheDocument();
    });
  });

  describe('User List', () => {
    it('should display all users in table', async () => {
      render(<UsersManagement />);

      await waitFor(() => {
        expect(screen.getByText('Admin User')).toBeInTheDocument();
        expect(screen.getByText('Regular User')).toBeInTheDocument();
        expect(screen.getByText('admin@test.com')).toBeInTheDocument();
        expect(screen.getByText('user@test.com')).toBeInTheDocument();
      });
    });

    it('should show correct user types with badges', async () => {
      render(<UsersManagement />);

      await waitFor(() => {
        expect(screen.getByText('admin')).toBeInTheDocument();
        expect(screen.getByText('user')).toBeInTheDocument();
      });
    });
  });

  describe('User Actions', () => {
    it('should allow editing user information', async () => {
      render(<UsersManagement />);

      await waitFor(() => {
        expect(screen.getByText('Editar')).toBeInTheDocument();
      });

      const editButtons = screen.getAllByText('Editar');
      fireEvent.click(editButtons[0]);

      expect(screen.getByDisplayValue('Admin User')).toBeInTheDocument();
      expect(screen.getByDisplayValue('admin@test.com')).toBeInTheDocument();
    });

    it('should allow saving edited user information', async () => {
      render(<UsersManagement />);

      await waitFor(() => {
        const editButtons = screen.getAllByText('Editar');
        fireEvent.click(editButtons[0]);
      });

      const nameInput = screen.getByDisplayValue('Admin User');
      fireEvent.change(nameInput, { target: { value: 'Updated Name' } });

      const saveButton = screen.getByText('Salvar');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(userService.updateUser).toHaveBeenCalledWith(1, {
          name: 'Updated Name',
          email: 'admin@test.com',
          type: 'admin'
        });
      });
    });

    it('should allow deleting users', async () => {
      window.confirm = jest.fn(() => true);

      render(<UsersManagement />);

      await waitFor(() => {
        const deleteButtons = screen.getAllByText('Remover');
        fireEvent.click(deleteButtons[1]);
      });

      expect(window.confirm).toHaveBeenCalledWith(
        'Tem certeza que deseja remover o usuário "Regular User"? Esta ação não pode ser desfeita.'
      );
      expect(userService.deleteUser).toHaveBeenCalledWith(2);
    });
  });

  describe('Self-Deletion', () => {
    it('should allow admin to delete own account', async () => {
      window.confirm = jest.fn(() => true);
      const mockLogout = jest.fn();

      useAuth.mockReturnValue({
        user: mockUser,
        logout: mockLogout,
        refetchUser: jest.fn()
      });

      render(<UsersManagement />);

      await waitFor(() => {
        const deleteButtons = screen.getAllByText('Remover Conta');
        fireEvent.click(deleteButtons[0]);
      });

      expect(window.confirm).toHaveBeenCalledWith(
        'Tem certeza que deseja remover SUA PRÓPRIA CONTA "Admin User"? Esta ação não pode ser desfeita e você será deslogado do sistema.'
      );

      await waitFor(() => {
        expect(userService.deleteUser).toHaveBeenCalledWith(1);
        expect(mockLogout).toHaveBeenCalled();
      });
    });

    it('should show different button text for self-deletion', async () => {
      render(<UsersManagement />);

      await waitFor(() => {
        expect(screen.getByText('Remover Conta')).toBeInTheDocument();
        expect(screen.getByText('Remover')).toBeInTheDocument();
      });
    });
  });

  describe('Create User', () => {
    it('should open create user modal', async () => {
      render(<UsersManagement />);

      await waitFor(() => {
        const createButton = screen.getByText('Criar Usuário');
        fireEvent.click(createButton);
      });

      expect(screen.getByText('Criar Novo Usuário')).toBeInTheDocument();
    });

    it('should create new user successfully', async () => {
      render(<UsersManagement />);

      await waitFor(() => {
        const createButton = screen.getByText('Criar Usuário');
        fireEvent.click(createButton);
      });

      const nameInput = screen.getByPlaceholderText('Nome completo');
      const emailInput = screen.getByPlaceholderText('email@exemplo.com');
      const passwordInput = screen.getByPlaceholderText('Mínimo 6 caracteres');

      fireEvent.change(nameInput, { target: { value: 'New User' } });
      fireEvent.change(emailInput, { target: { value: 'newuser@test.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });

      const submitButton = screen.getByText('Criar Usuário');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(userService.createUser).toHaveBeenCalledWith({
          name: 'New User',
          email: 'newuser@test.com',
          password: 'password123',
          type: 'user'
        });
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      userService.getAllUsers.mockRejectedValue(new Error('API Error'));

      render(<UsersManagement />);

      await waitFor(() => {
        expect(screen.getByText('Erro ao carregar lista de usuários')).toBeInTheDocument();
      });
    });

    it('should handle last admin deletion error', async () => {
      window.confirm = jest.fn(() => true);
      userService.deleteUser.mockRejectedValue(new Error('Não é possível deletar sua conta. Você é o último administrador do sistema.'));

      render(<UsersManagement />);

      await waitFor(() => {
        const deleteButtons = screen.getAllByText('Remover Conta');
        fireEvent.click(deleteButtons[0]);
      });

      await waitFor(() => {
        expect(screen.getByText('ATENÇÃO: Não é possível remover sua conta pois você é o último administrador do sistema. Crie outro usuário administrador antes de remover sua conta.')).toBeInTheDocument();
      });
    });
  });
});
