import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../layouts/AuthLayout';
import api from '../services/api';

const RegisterPage = () => {
  // Estado único para todos os campos do formulário
  const [formData, setFormData] = useState({
    nome_completo: '',
    email: '',
    documento: '', // CPF
    senha: '',
    confirmarSenha: ''
  });
  
  const navigate = useNavigate();

  // Função genérica para atualizar o estado quando o usuário digita
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value // Usa o 'name' do input para saber qual campo atualizar
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    // Validação simples de senha
    if (formData.senha !== formData.confirmarSenha) {
      alert("As senhas não coincidem.");
      return;
    }

    try {
      // Envia para o backend. O tipo_documento é fixo como CPF por enquanto.
      await api.post('/auth/register', {
        nome_completo: formData.nome_completo,
        email: formData.email,
        documento: formData.documento,
        senha: formData.senha,
        tipo_documento: 'CPF'
      });
      
      alert("Cadastro realizado com sucesso! Faça login para continuar.");
      // Redireciona o usuário de volta para a tela de login
      navigate('/');
      
    } catch (error) {
      console.error(error);
      // Tenta mostrar a mensagem de erro do backend, se houver
      const errorMessage = error.response?.data?.message || "Falha no cadastro. Verifique os dados.";
      alert(errorMessage);
    }
  };

  // Estilo padrão para os inputs
  const inputStyle = "flex-1 bg-brand-gray py-3 px-6 rounded-full outline-none focus:ring-2 focus:ring-black transition-all w-full md:w-auto";
  // Estilo para os labels
  const labelStyle = "w-full md:w-32 font-black text-xl md:text-2xl whitespace-nowrap mb-2 md:mb-0";

  return (
    <AuthLayout>
      <form onSubmit={handleRegister} className="space-y-5">
        
        {/* Campo: Nome Completo */}
        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
          <label className={labelStyle}>Nome</label>
          <input 
            type="text"
            name="nome_completo"
            required
            placeholder="Seu nome completo"
            className={inputStyle}
            onChange={handleChange}
          />
        </div>

        {/* Campo: E-mail */}
        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
          <label className={labelStyle}>E-mail</label>
          <input 
            type="email"
            name="email"
            required
            placeholder="Seu melhor e-mail"
            className={inputStyle}
            onChange={handleChange}
          />
        </div>

        {/* Campo: CPF */}
        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
          <label className={labelStyle}>CPF</label>
          <input 
            type="text"
            name="documento"
            required
            placeholder="Apenas números"
            maxLength={11} // Limita a 11 dígitos
            className={inputStyle}
            onChange={handleChange}
          />
        </div>

        {/* Campo: Senha */}
        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
          <label className={labelStyle}>Senha</label>
          <input 
            type="password"
            name="senha"
            required
            placeholder="Crie uma senha segura"
            className={inputStyle}
            onChange={handleChange}
          />
        </div>

        {/* Campo: Confirmar Senha */}
        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
          <label className={labelStyle}>Confirmar</label>
          <input 
            type="password"
            name="confirmarSenha"
            required
            placeholder="Repita a senha"
            className={inputStyle}
            onChange={handleChange}
          />
        </div>

        {/* Botão CADASTRAR */}
        <div className="pt-4">
          <button 
            type="submit" 
            className="w-full bg-black text-white font-black text-xl py-4 rounded-xl hover:bg-gray-800 transition-transform active:scale-95 shadow-lg"
          >
            Cadastrar Perfil
          </button>
        </div>

        {/* Link VOLTAR PARA LOGIN */}
        <div className="text-center pt-2">
          <Link to="/" className="text-black font-medium underline hover:text-brand-brown">
            Já tenho conta (Acessar Perfil)
          </Link>
        </div>

      </form>
    </AuthLayout>
  );
};

export default RegisterPage;