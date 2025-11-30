import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Bell, Menu, X } from 'lucide-react';
import api from '../services/api';
import logo from '../assets/logo-nav.svg';

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // ESTADOS
    const [unreadCount, setUnreadCount] = useState(0);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // --- MUDANÇA 1: Estado para guardar os dados do usuário ---
    const [userData, setUserData] = useState({
        nome: 'User',
        saldo: 0
    });

    // EFEITO: Carregar Notificações E Dados do Usuário
    useEffect(() => {
        const token = localStorage.getItem('token');
        const localUser = JSON.parse(localStorage.getItem('user'));

        if (token && localUser) {
            // 1. Busca Notificações (Badge)
            api.get('/notificacoes').then(res => {
                const count = res.data.filter(n => !n.lida && n.tipo === 'SOLICITACAO').length;
                setUnreadCount(count);
            }).catch(err => console.log("Erro badge"));

            // 2. Busca Dados Frescos do Usuário (Saldo Atualizado)
            // Buscamos na API em vez de usar só o localStorage, pois o saldo muda.
            api.get(`/usuarios/${localUser.id}`).then(res => {
                setUserData({
                    nome: res.data.nome_completo,
                    saldo: res.data.saldo_moedas
                });
            }).catch(err => {
                // Fallback: Se der erro na API, usa o que tem no cache local
                setUserData({
                    nome: localUser.nome_completo,
                    saldo: localUser.saldo_moedas
                });
            });
        }
    }, [location.pathname]); // Atualiza toda vez que muda de página

    // FUNÇÕES AUXILIARES
    const handleLinkClick = (path) => {
        setIsMenuOpen(false);
        navigate(path);
    };

    const getLinkClass = (path) => {
        const isActive = location.pathname === path;
        const baseStyle = "py-2 font-medium transition text-center flex-1 w-full flex items-center justify-center";

        return isActive
            ? `${baseStyle} bg-gray-200 rounded-lg font-bold text-black`
            : `${baseStyle} text-gray-600 hover:text-black`;
    };

    return (
        <nav className="w-full bg-white h-20 shadow-sm sticky top-0 z-50">
            <div className="h-full px-4 md:px-6 flex items-center justify-between">

                {/* 1. Botão Hambúrguer */}
                <button
                    className="md:hidden p-2 text-gray-600"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                    {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
                </button>

                {/* 2. Logo */}
                <div className="flex items-center">
                    <img
                        src={logo}
                        alt="logo-descarte-vivo"
                        className="logo-image-descarte-vivo"
                    />
                </div>

                {/* 3. Menu Central */}
                <div className="hidden md:flex items-center flex-1 max-w-xl mx-4">
                    <Link to="/dashboard" className={getLinkClass('/dashboard')}>Novidades</Link>
                    <Link to="/movimentar" className={getLinkClass('/movimentar')}>Movimentar</Link>
                    <Link to="/loja" className={getLinkClass('/loja')}>Loja</Link>
                </div>

                {/* 4. Área Direita */}
                <div className="flex items-center gap-2 md:gap-4">

                    <button
                        onClick={() => navigate('/notificacoes')}
                        className="relative flex items-center gap-2 bg-black text-white p-2 md:px-4 md:py-2 rounded-full font-medium hover:bg-gray-800 transition"
                    >
                        <Bell size={20} />
                        <span className="hidden md:inline">Notificações</span>
                        {unreadCount > 0 && (
                            <div className="absolute -top-1 -right-1 md:-top-2 md:-right-2 bg-[#FBBC05] text-black font-black text-xs w-5 h-5 md:w-6 md:h-6 flex items-center justify-center rounded-full border-2 border-white shadow-sm">
                                {unreadCount}
                            </div>
                        )}
                    </button>

                    {/* --- MUDANÇA 2: Botão de Perfil Dinâmico --- */}
                    <button
                        onClick={() => navigate('/perfil')}
                        className="bg-brand-green flex items-center gap-2 px-2 py-1 rounded-full text-brand-dark hover:brightness-110 transition cursor-pointer"
                        title="Meu Perfil"
                    >
                        {/* Saldo Dinâmico */}
                        <div className="flex items-center gap-1 font-black text-lg">
                            <span className="text-xs border-2 border-black rounded-full w-4 h-4 flex items-center justify-center">B</span>
                            {/* Exibe o saldo formatado sem casas decimais (ex: 48) */}
                            {userData.saldo ? userData.saldo.toFixed(0) : '0'}
                        </div>

                        {/* Avatar Dinâmico (Usa o nome real) */}
                        <div className="bg-gray-300 rounded-full h-8 w-8 md:h-10 md:w-10 border-2 border-black flex items-center justify-center overflow-hidden">
                            <img
                                src={`https://ui-avatars.com/api/?name=${userData.nome}&background=random`}
                                alt={userData.nome}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </button>
                    {/* ------------------------------------------- */}

                </div>
            </div>

            {/* --- MENU MOBILE --- */}
            {isMenuOpen && (
                <div className="md:hidden absolute top-20 left-0 w-full bg-white shadow-xl border-t border-gray-100 flex flex-col p-4 gap-2 animate-fade-in">
                    <button onClick={() => handleLinkClick('/dashboard')} className={getLinkClass('/dashboard')}>
                        Novidades
                    </button>
                    <button onClick={() => handleLinkClick('/movimentar')} className={getLinkClass('/movimentar')}>
                        Movimentar
                    </button>
                    <button onClick={() => handleLinkClick('/loja')} className={getLinkClass('/loja')}>
                        Loja
                    </button>
                    <button onClick={() => handleLinkClick('/perfil')} className={getLinkClass('/perfil')}>
                        Meu Perfil
                    </button>
                </div>
            )}
        </nav>
    );
};

export default Navbar;