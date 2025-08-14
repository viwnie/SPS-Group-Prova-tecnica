import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Profile } from '../Profile';
import { useAuth } from '../../contexts/AuthContext';
import { userService } from '../../services/api';
import { api } from '../../services/api';

jest.mock('../../contexts/AuthContext');
jest.mock('../../services/api');

const mockUser = {
  id: 1,
  name: 'Test User',
  email: 'test@test.com',
  type: 'user'
};

describe('Profile', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAuth.mockReturnValue({
      user: mockUser,
      logout: jest.fn(),
      refetchUser: jest.fn()
    });
    api.put.mockResolvedValue({ data: mockUser });
    userService.deleteUser.mockResolvedValue({ message: 'Conta deletada com sucesso' });
  });

  describe('Rendering', () => {
    it('should render profile information correctly', () => {
      render(<Profile />);

      expect(screen.getByText('Informações do Perfil')).toBeInTheDocument();
      expect(screen.getByText('Test User')).toBeInTheDocument();
      expect(screen.getByText('test@test.com')).toBeInTheDocument();
      expect(screen.getByText('user')).toBeInTheDocument();
    });

    it('should show edit profile button', () => {
      render(<Profile />);
      expect(screen.getByText('Editar Perfil')).toBeInTheDocument();
    });

    it('should not render without user data', () => {
      useAuth.mockReturnValue({
        user: null,
        logout: jest.fn(),
        refetchUser: jest.fn()
      });

      const { container } = render(<Profile />);
      expect(container.firstChild).toBeNull();
    });
  });

  describe('Edit Profile', () => {
    it('should enter edit mode when edit button is clicked', () => {
      render(<Profile />);

      const editButton = screen.getByText('Editar Perfil');
      fireEvent.click(editButton);

      expect(screen.getByDisplayValue('Test User')).toBeInTheDocument();
      expect(screen.getByDisplayValue('test@test.com')).toBeInTheDocument();
      expect(screen.getByText('Salvar Alterações')).toBeInTheDocument();
      expect(screen.getByText('Cancelar')).toBeInTheDocument();
    });

    it('should allow editing name and email', () => {
      render(<Profile />);

      const editButton = screen.getByText('Editar Perfil');
      fireEvent.click(editButton);

      const nameInput = screen.getByDisplayValue('Test User');
      const emailInput = screen.getByDisplayValue('test@test.com');

      fireEvent.change(nameInput, { target: { value: 'Updated Name' } });
      fireEvent.change(emailInput, { target: { value: 'updated@test.com' } });

      expect(nameInput.value).toBe('Updated Name');
      expect(emailInput.value).toBe('updated@test.com');
    });

    it('should allow changing password', () => {
      render(<Profile />);

      const editButton = screen.getByText('Editar Perfil');
      fireEvent.click(editButton);

      const passwordInput = screen.getByPlaceholderText('Deixe em branco para manter a senha atual');
      const confirmPasswordInput = screen.getByPlaceholderText('Confirme a nova senha');

      fireEvent.change(passwordInput, { target: { value: 'newpassword123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'newpassword123' } });

      expect(passwordInput.value).toBe('newpassword123');
      expect(confirmPasswordInput.value).toBe('newpassword123');
    });

    it('should validate password confirmation', async () => {
      render(<Profile />);

      const editButton = screen.getByText('Editar Perfil');
      fireEvent.click(editButton);

      const passwordInput = screen.getByPlaceholderText('Deixe em branco para manter a senha atual');
      const confirmPasswordInput = screen.getByPlaceholderText('Confirme a nova senha');

      fireEvent.change(passwordInput, { target: { value: 'newpassword123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'differentpassword' } });

      const saveButton = screen.getByText('Salvar Alterações');
      fireEvent.click(saveButton);

      expect(screen.getByText('As senhas não coincidem')).toBeInTheDocument();
    });

    it('should validate password length', async () => {
      render(<Profile />);

      const editButton = screen.getByText('Editar Perfil');
      fireEvent.click(editButton);

      const passwordInput = screen.getByPlaceholderText('Deixe em branco para manter a senha atual');
      const confirmPasswordInput = screen.getByPlaceholderText('Confirme a nova senha');

      fireEvent.change(passwordInput, { target: { value: '123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: '123' } });

      const saveButton = screen.getByText('Salvar Alterações');
      fireEvent.click(saveButton);

      expect(screen.getByText('A senha deve ter pelo menos 6 caracteres')).toBeInTheDocument();
    });

    it('should save profile changes successfully', async () => {
      render(<Profile />);

      const editButton = screen.getByText('Editar Perfil');
      fireEvent.click(editButton);

      const nameInput = screen.getByDisplayValue('Test User');
      fireEvent.change(nameInput, { target: { value: 'Updated Name' } });

      const saveButton = screen.getByText('Salvar Alterações');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(api.put).toHaveBeenCalledWith('/users/1', {
          name: 'Updated Name',
          email: 'test@test.com'
        });
        expect(screen.getByText('Perfil atualizado com sucesso!')).toBeInTheDocument();
      });
    });

    it('should handle save errors', async () => {
      api.put.mockRejectedValue({ response: { data: { message: 'API Error' } } });

      render(<Profile />);

      const editButton = screen.getByText('Editar Perfil');
      fireEvent.click(editButton);

      const nameInput = screen.getByDisplayValue('Test User');
      fireEvent.change(nameInput, { target: { value: 'Updated Name' } });

      const saveButton = screen.getByText('Salvar Alterações');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText('Erro ao atualizar perfil: API Error')).toBeInTheDocument();
      });
    });

    it('should cancel editing and reset form', () => {
      render(<Profile />);

      const editButton = screen.getByText('Editar Perfil');
      fireEvent.click(editButton);

      const nameInput = screen.getByDisplayValue('Test User');
      fireEvent.change(nameInput, { target: { value: 'Changed Name' } });

      const cancelButton = screen.getByText('Cancelar');
      fireEvent.click(cancelButton);

      expect(screen.getByText('Test User')).toBeInTheDocument();
      expect(screen.getByText('Editar Perfil')).toBeInTheDocument();
    });
  });

  describe('Delete Account', () => {
    it('should show danger zone section', () => {
      render(<Profile />);

      expect(screen.getByText('Zona de Perigo')).toBeInTheDocument();
      expect(screen.getByText('Remover Minha Conta')).toBeInTheDocument();
      expect(screen.getByText('⚠️ Esta ação removerá permanentemente sua conta e todos os dados associados.')).toBeInTheDocument();
    });

    it('should confirm deletion before proceeding', async () => {
      window.confirm = jest.fn(() => true);
      const mockLogout = jest.fn();

      useAuth.mockReturnValue({
        user: mockUser,
        logout: mockLogout,
        refetchUser: jest.fn()
      });

      render(<Profile />);

      const deleteButton = screen.getByText('Remover Minha Conta');
      fireEvent.click(deleteButton);

      expect(window.confirm).toHaveBeenCalledWith(
        'Tem certeza que deseja remover SUA CONTA "Test User"? Esta ação não pode ser desfeita e você será deslogado do sistema.'
      );

      await waitFor(() => {
        expect(userService.deleteUser).toHaveBeenCalledWith(1);
        expect(mockLogout).toHaveBeenCalled();
      });
    });

    it('should handle deletion cancellation', () => {
      window.confirm = jest.fn(() => false);

      render(<Profile />);

      const deleteButton = screen.getByText('Remover Minha Conta');
      fireEvent.click(deleteButton);

      expect(window.confirm).toHaveBeenCalled();
      expect(userService.deleteUser).not.toHaveBeenCalled();
    });

    it('should handle last admin deletion error', async () => {
      window.confirm = jest.fn(() => true);
      userService.deleteUser.mockRejectedValue({
        response: { data: { message: 'Não é possível deletar sua conta. Você é o último administrador do sistema.' } }
      });

      render(<Profile />);

      const deleteButton = screen.getByText('Remover Minha Conta');
      fireEvent.click(deleteButton);

      await waitFor(() => {
        expect(screen.getByText('ATENÇÃO: Não é possível remover sua conta pois você é o último administrador do sistema. Crie outro usuário administrador antes de remover sua conta.')).toBeInTheDocument();
      });
    });

    it('should handle general deletion errors', async () => {
      window.confirm = jest.fn(() => true);
      userService.deleteUser.mockRejectedValue({
        response: { data: { message: 'General Error' } }
      });

      render(<Profile />);

      const deleteButton = screen.getByText('Remover Minha Conta');
      fireEvent.click(deleteButton);

      await waitFor(() => {
        expect(screen.getByText('Erro ao remover conta: General Error')).toBeInTheDocument();
      });
    });
  });

  describe('User Type Display', () => {
    it('should display admin type correctly', () => {
      useAuth.mockReturnValue({
        user: { ...mockUser, type: 'admin' },
        logout: jest.fn(),
        refetchUser: jest.fn()
      });

      render(<Profile />);

      expect(screen.getByText('admin')).toBeInTheDocument();
      expect(screen.getByText('O tipo de usuário não pode ser alterado')).toBeInTheDocument();
    });

    it('should display user type correctly', () => {
      render(<Profile />);

      expect(screen.getByText('user')).toBeInTheDocument();
      expect(screen.getByText('O tipo de usuário não pode ser alterado')).toBeInTheDocument();
    });
  });
});
