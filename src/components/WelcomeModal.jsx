import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { useNavigate } from 'react-router-dom';
import calu from '../assets/calu-hero.svg';

const WelcomeModal = ({ onClose }) => {
  const navigate = useNavigate();

  // Efeito de Confete ao montar o componente
  useEffect(() => {
    // Dispara uma explosão de confetes
    const duration = 3000;
    const end = Date.now() + duration;

    (function frame() {
      // --- CORREÇÃO Z-INDEX: Definir aqui ---
      const commonOptions = {
        zIndex: 10001,
        particleCount: 5,
        spread: 55,
        colors: ['#4CAF50', '#FFD700', '#FFFFFF']
      };

      confetti({
        ...commonOptions,
        angle: 60,
        origin: { x: 0 },
      });

      confetti({
        ...commonOptions,
        angle: 120,
        origin: { x: 1 },
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    }());
  }, []);

  const handleAction = () => {
    onClose();
    navigate('/movimentar');
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-fade-in">

      <div className="bg-brand-dark rounded-3xl p-8 max-w-md w-full text-center relative overflow-hidden shadow-2xl transform transition-all scale-100 border-2 border-brand-green/30">

        {/* Fundo decorativo */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50 pointer-events-none"></div>
        <div className="absolute top-0 left-0 w-full h-2 bg-brand-green"></div>

        {/* Imagem do Calu */}
        <div className="flex justify-center mb-6 relative z-10">
          <img src={calu} alt="Calu" className="w-48 h-48 object-contain drop-shadow-[0_0_15px_rgba(76,175,80,0.5)]" />
        </div>

        <h2 className="text-4xl font-black uppercase text-white mb-4 relative z-10">
          Bem-vindo!
        </h2>

        <p className="text-gray-300 text-xl mb-8 leading-relaxed relative z-10">
          Você ganhou <span className="text-brand-green font-black text-2xl drop-shadow-sm">10 moedas verdes</span> pelo seu primeiro acesso.
        </p>

        <div className="bg-white/10 p-5 rounded-xl mb-8 border border-white/20 backdrop-blur-sm relative z-10">
          <p className="text-sm text-gray-200 font-medium">
            Aproveite para começar a movimentar Fortaleza fazendo o seu primeiro descarte ou comprando pacotes disponíveis.
          </p>
        </div>

        <button
          onClick={handleAction}
          className="w-full bg-brand-green text-brand-dark font-black uppercase text-xl py-4 rounded-xl shadow-[0_0_20px_rgba(76,175,80,0.4)] hover:brightness-110 transition-transform active:scale-95 animate-pulsar relative z-10"
        >
          Movimentar Agora
        </button>

      </div>
    </div>
  );
};

export default WelcomeModal;