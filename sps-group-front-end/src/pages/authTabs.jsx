
import { useState, useEffect } from "react";
import CustomInput from "../components/CustomInput";
import { getItem } from '../utils/storage';
import { useNavigate } from 'react-router-dom';
import { login, register } from '../services/api';
import { entrar } from '../services/auth';

export function AuthTabs() {
  const [activeTab, setActiveTab] = useState("login");
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [registerData, setRegisterData] = useState({ name: "", email: "", confirmEmail: "", password: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const token = getItem('token')

    if (token) {
      navigate('/home')
    }
  }, [navigate])

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await login(loginData.email, loginData.password);
      entrar(response.token);
      navigate('/home');
    } catch (error) {
      setError(error.message || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (registerData.email !== registerData.confirmEmail) {
      setError("Os e-mails não coincidem");
      setLoading(false);
      return;
    }

    if (registerData.password !== registerData.confirmPassword) {
      setError("As senhas não coincidem");
      setLoading(false);
      return;
    }

    try {
      const userData = {
        name: registerData.name,
        email: registerData.email,
        password: registerData.password,
        type: "Admin"
      };

      await register(userData);
      setActiveTab("login");
      setError("");
      alert("Usuário registrado com sucesso! Faça login para continuar.");
    } catch (error) {
      setError(error.message || 'Erro ao fazer registro');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="flex border-b border-gray-300">
          <button
            onClick={() => setActiveTab("login")}
            className={`flex-1 py-2 text-center ${activeTab === "login"
              ? "border-b-2 border-indigo-600 font-semibold text-indigo-600"
              : "text-gray-500 hover:text-gray-700"
              }`}
          >
            Login
          </button>
          <button
            onClick={() => setActiveTab("register")}
            className={`flex-1 py-2 text-center ${activeTab === "register"
              ? "border-b-2 border-indigo-600 font-semibold text-indigo-600"
              : "text-gray-500 hover:text-gray-700"
              }`}
          >
            Registrar
          </button>
        </div>

        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {activeTab === "login" ? (
            <form className="space-y-6" onSubmit={handleLogin}>
              <CustomInput
                label="E-mail"
                type="email"
                name="email"
                value={loginData.email}
                onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                placeholder="Digite seu e-mail"
                required
              />

              <CustomInput
                label="Senha"
                type="password"
                name="password"
                value={loginData.password}
                onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                placeholder="Digite sua senha"
                required
              />

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-2 px-4 text-white rounded-md ${loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700'
                  }`}
              >
                {loading ? 'Entrando...' : 'Entrar'}
              </button>
            </form>
          ) : (
            <form className="space-y-6" onSubmit={handleRegister}>
              <CustomInput
                label="Nome completo"
                type="text"
                name="nome"
                value={registerData.name}
                onChange={(e) =>
                  setRegisterData({ ...registerData, name: e.target.value })
                }
                placeholder="Digite seu nome completo"
                required
              />

              <CustomInput
                label="E-mail"
                type="email"
                name="email"
                value={registerData.email}
                onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                placeholder="Digite seu e-mail"
                required
              />


              <CustomInput
                label="Confirmar E-mail"
                type="email"
                name="confirmEmail"
                value={registerData.confirmEmail}
                onChange={(e) => setRegisterData({ ...registerData, confirmEmail: e.target.value })}
                placeholder="Digite seu e-mail"
                required
              />

              <CustomInput
                label="Senha"
                type="password"
                name="password"
                value={registerData.password}
                onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                placeholder="Digite sua senha"
                required
              />

              <CustomInput
                label="Confirmar Senha"
                type="password"
                name="confirmPassword"
                value={registerData.confirmPassword}
                onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                placeholder="Digite sua senha novamente"
                required
              />

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-2 px-4 text-white rounded-md ${loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700'
                  }`}
              >
                {loading ? 'Registrando...' : 'Registrar'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}