
import { useState, useEffect } from "react";
import CustomInput from "../components/CustomInput";
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useForm } from '../hooks/useForm';
import { useApi } from '../hooks/useApi';

export function AuthTabs() {
  const [activeTab, setActiveTab] = useState("login");
  const [success, setSuccess] = useState("");

  const navigate = useNavigate();
  const { login: authLogin, isAuthenticated } = useAuth();
  const { execute: executeApi, loading, error, clearError } = useApi();

  const loginForm = useForm({ email: "", password: "" });
  const registerForm = useForm({
    name: "",
    email: "",
    confirmEmail: "",
    password: "",
    confirmPassword: ""
  });

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/home');
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!loginForm.formData.email || !loginForm.formData.password) {
      loginForm.setFieldError('email', 'Preencha todos os campos');
      return;
    }

    try {
      const response = await executeApi(
        () => authService.login(loginForm.formData.email, loginForm.formData.password)
      );
      authLogin(response.token);
      navigate('/home');
    } catch (error) {
      console.error('Erro no login:', error);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (registerForm.formData.email !== registerForm.formData.confirmEmail) {
      registerForm.setFieldError('confirmEmail', 'Os e-mails não coincidem');
      return;
    }

    if (registerForm.formData.password !== registerForm.formData.confirmPassword) {
      registerForm.setFieldError('confirmPassword', 'As senhas não coincidem');
      return;
    }

    try {
      const userData = {
        name: registerForm.formData.name,
        email: registerForm.formData.email,
        password: registerForm.formData.password
      };

      await executeApi(() => authService.register(userData));
      setActiveTab("login");
      registerForm.resetForm();
      setSuccess("Usuário registrado com sucesso! Faça login para continuar.");
    } catch (error) {
      console.error('Erro no registro:', error);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    clearError();
    setSuccess("");

    if (tab === "login") {
      registerForm.resetForm();
    } else {
      loginForm.resetForm();
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="flex border-b border-gray-300">
          <button
            onClick={() => handleTabChange("login")}
            className={`flex-1 py-2 text-center ${activeTab === "login"
              ? "border-b-2 border-blue-500 text-blue-600"
              : "text-gray-500 hover:text-gray-700"
              }`}
          >
            Login
          </button>
          <button
            onClick={() => handleTabChange("register")}
            className={`flex-1 py-2 text-center ${activeTab === "register"
              ? "border-b-2 border-blue-500 text-blue-600"
              : "text-gray-500 hover:text-gray-700"
              }`}
          >
            Registro
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            {success}
          </div>
        )}

        {activeTab === "login" ? (
          <form onSubmit={handleLogin} className="space-y-6">
            <CustomInput
              label="Email"
              type="email"
              name="email"
              value={loginForm.formData.email}
              onChange={loginForm.handleInputChange}
              error={loginForm.errors.email}
              required
            />
            <CustomInput
              label="Senha"
              type="password"
              name="password"
              value={loginForm.formData.password}
              onChange={loginForm.handleInputChange}
              error={loginForm.errors.password}
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="space-y-6">
            <CustomInput
              label="Nome"
              type="text"
              name="name"
              value={registerForm.formData.name}
              onChange={registerForm.handleInputChange}
              error={registerForm.errors.name}
              required
            />
            <CustomInput
              label="Email"
              type="email"
              name="email"
              value={registerForm.formData.email}
              onChange={registerForm.handleInputChange}
              error={registerForm.errors.email}
              required
            />
            <CustomInput
              label="Confirmar Email"
              type="email"
              name="confirmEmail"
              value={registerForm.formData.confirmEmail}
              onChange={registerForm.handleInputChange}
              error={registerForm.errors.confirmEmail}
              required
            />
            <CustomInput
              label="Senha"
              type="password"
              name="password"
              value={registerForm.formData.password}
              onChange={registerForm.handleInputChange}
              error={registerForm.errors.password}
              required
            />
            <CustomInput
              label="Confirmar Senha"
              type="password"
              name="confirmPassword"
              value={registerForm.formData.confirmPassword}
              onChange={registerForm.handleInputChange}
              error={registerForm.errors.confirmPassword}
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
            >
              {loading ? "Registrando..." : "Registrar"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}