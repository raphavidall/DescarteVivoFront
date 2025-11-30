import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../layouts/AuthLayout';
import api from '../services/api';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/auth/login', { email, senha });

      localStorage.setItem('token', response.data.accessToken);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      navigate('/dashboard');

    } catch (error) {
      console.error(error);
      alert("Falha no login. Verifique suas credenciais.");
    }
  };

  return (
    <AuthLayout>
      <form onSubmit={handleLogin} className="space-y-6">

        {/* Campo USUÁRIO */}
        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
          <label className="w-24 font-black text-xl md:text-2xl whitespace-nowrap">
            Usuário
          </label>
          <input
            type="email"
            required
            placeholder="Digite seu usuário (email)"
            className="flex-1 bg-brand-gray py-3 px-6 rounded-full outline-none focus:ring-2 focus:ring-black transition-all"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {/* Campo SENHA */}
        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
          <label className="w-24 font-black text-xl md:text-2xl whitespace-nowrap">
            Senha
          </label>
          <input
            type="password"
            required
            placeholder="Digite sua senha"
            className="flex-1 bg-brand-gray py-3 px-6 rounded-full outline-none focus:ring-2 focus:ring-black transition-all"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
          />
        </div>

        {/* Link Esqueci a Senha */}
        <div className="text-right">
          <a href="#" className="text-sm text-gray-600 hover:text-black hover:underline">
            Esqueci minha senha
          </a>
        </div>

        {/* Botão LOGIN */}
        <div className="pt-4">
          <button
            type="submit"
            className="w-full bg-black text-white font-black text-xl py-4 rounded-xl hover:bg-gray-800 transition-transform active:scale-95 shadow-lg"
          >
            Acessar Perfil
          </button>
        </div>

        {/* Link CADASTRAR */}
        <div className="text-center pt-2">
          <Link to="/register" className="text-black font-medium underline hover:text-brand-brown">
            Cadastrar um Novo Perfil
          </Link>
        </div>

      </form>
    </AuthLayout>
  );
};

export default LoginPage;