import React from 'react';
import bgCalu from '../assets/bg-calu.svg';

const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen w-full flex">
      
      {/* --- LADO ESQUERDO (Apenas Desktop) --- */}
      <div className="hidden md:flex w-5/12 bg-brand-dark relative flex-col items-center justify-start pt-20 p-8 text-center">
        
        {/* Imagem de Fundo/Mascote */}
        <img 
          src={bgCalu} 
          alt="Mascote Calu" 
          className="absolute inset-0 w-full h-full object-cover z-0"
        />

        {/* Balão de Texto */}
        <div className="relative z-10 bg-white p-6 rounded-2xl shadow-xl max-w-sm">
          <h2 className="text-xl font-bold mb-2 text-left">Bem-vindo!</h2>
          <p className="text-gray-700 text-sm text-left mb-4">
            Cadastre um novo perfil ou acesse um perfil existente informando seu usuário e senha.
          </p>
          <p className="font-black text-left">@calumascote</p>
        </div>
      </div>

      {/* --- LADO DIREITO (Formulário) --- */}
      <div className="w-full md:w-7/12 bg-white flex flex-col justify-center items-center p-6 md:p-12">
        <div className="w-full max-w-md space-y-8">
          
          <div className="text-center md:text-right mb-10">
            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter leading-none">
              Descarte-Vivo
            </h1>
            <h2 className="text-2xl md:text-3xl font-light text-gray-600">
              Fortaleza
            </h2>
          </div>

          {children}

        </div>
      </div>
    </div>
  );
};

export default AuthLayout;