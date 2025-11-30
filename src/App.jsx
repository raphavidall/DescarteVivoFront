import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import MovimentarPage from './pages/MovimentarPage';
import NotificacoesPage from './pages/NotificacoesPage';
import ProfilePage from './pages/ProfilePage';
import ExtratoPage from './pages/ExtratoPage';
import LojaPage from './pages/LojaPage';

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

        {/* Rota de Notificações */}
        <Route path="/notificacoes" element={<NotificacoesPage />} />

        {/* Rota de Perfil */}
        <Route path="/perfil" element={<ProfilePage />} />

        {/* Rota de Extrato */}
        <Route path="/extrato" element={<ExtratoPage />} />

        {/* Rota de Loja */}
        <Route path="/loja" element={<LojaPage />} />

        {/* Rota 404 redireciona para login */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;