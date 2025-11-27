import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import MovimentarPage from './pages/MovimentarPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rotas de Login */}
        <Route path="/" element={<LoginPage />} />
        <Route path="/login" element={<LoginPage />} />
        
        {/* Rota de Cadastro */}
        <Route path="/register" element={<RegisterPage />} />

        {/* Rota de Dashboard */}
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/movimentar" element={<MovimentarPage />} />
        <Route path="/loja" element={
            <div className="p-10 text-center">
                <h1 className="text-2xl font-bold">Loja em Construção 🚧</h1>
                <a href="/dashboard" className="text-blue-500 underline">Voltar</a>
            </div>
        } />
        
        
        {/* Rota 404 redireciona para login */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;