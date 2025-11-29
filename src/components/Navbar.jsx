import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom'; // <--- Importe useLocation
import { Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);
  const saldo = 48;

  // Busca notificações para contar as não lidas/pendentes
  useEffect(() => {
    // Só busca se tiver token
    if (localStorage.getItem('token')) {
        api.get('/notificacoes').then(res => {
            // Filtra: Quantas são do tipo SOLICITACAO e ainda não foram tratadas?
            // Ou simplesmente quantas tem lida=false.
            const count = res.data.filter(n => !n.lida).length;
            setUnreadCount(count);
        }).catch(err => console.log("Erro ao buscar badge"));
    }
  }, [location.pathname]);

  // Função auxiliar para definir estilo do link
  const getLinkClass = (path) => {
    const isActive = location.pathname === path;
    return isActive 
      ? "px-6 py-2 bg-gray-200 rounded-lg font-bold text-black" // Estilo Ativo
      : "px-6 py-2 text-gray-600 hover:text-black font-medium transition"; // Estilo Inativo
  };

  return (
    <nav className="w-full bg-white h-20 px-6 flex items-center justify-between shadow-sm sticky top-0 z-50">
      
      {/* 1. Logo */}
      <div className="flex items-center">
        <h1 className="font-black text-xl uppercase tracking-tighter">
            Descarte-Vivo
        </h1>
      </div>

      {/* 2. Menu Central (Agora dinâmico) */}
      <div className="hidden md:flex items-center gap-2">
        <Link to="/dashboard" className={getLinkClass('/dashboard')}>
          Novidades
        </Link>
        <Link to="/movimentar" className={getLinkClass('/movimentar')}>
          Movimentar
        </Link>
        <Link to="/loja" className={getLinkClass('/loja')}>
          Loja
        </Link>
      </div>

      {/* 3. Área Direita (igual ao anterior) */}
      <div className="flex items-center gap-4">
         {/* ... (mantém o código do sino e avatar) ... */}
         <button 
            onClick={() => navigate('/notificacoes')}
            className="relative flex items-center gap-2 bg-black text-white px-4 py-2 rounded-full font-medium hover:bg-gray-800 transition"
        >
          <Bell size={18} />
          <span className="hidden md:inline">Notificações</span>

          {/* O BADGE AMARELO */}
          {unreadCount > 0 && (
              <div className="absolute -top-2 -right-2 bg-[#FBBC05] text-black font-black text-xs w-6 h-6 flex items-center justify-center rounded-full border-2 border-white shadow-sm">
                  {unreadCount}
              </div>
          )}
        </button>

        <div className="bg-brand-green flex items-center gap-3 pl-4 pr-1 py-1 rounded-full text-brand-dark">
            <div className="flex items-center gap-1 font-black text-xl">
                <span className="text-sm border-2 border-black rounded-full w-5 h-5 flex items-center justify-center">B</span>
                {saldo}
            </div>
            <div className="bg-gray-300 rounded-full h-10 w-10 border-2 border-black flex items-center justify-center font-bold">
                U
            </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;