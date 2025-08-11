
import { useState } from "react";
import CustomInput from "../components/CustomInput";

export function AuthTabs() {
  const [activeTab, setActiveTab] = useState("login");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [registerData, setRegisterData] = useState({ name: "", email: "", confirmEmail: "", password: "", confirmPassword: "" });

  const handleLogin = (e) => {
    e.preventDefault();
    console.log(loginData);
  }

  const handleRegister = (e) => {
    e.preventDefault();
    console.log(registerData);
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
                className="w-full py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Entrar
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
                className="w-full py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Registrar
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}