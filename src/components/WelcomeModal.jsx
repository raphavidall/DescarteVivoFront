import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { useNavigate } from 'react-router-dom';

const WelcomeModal = ({ onClose }) => {
  const navigate = useNavigate();

  // Efeito de Confete ao montar o componente
  useEffect(() => {
    // Dispara uma explosão de confetes
    const duration = 3000;
    const end = Date.now() + duration;

    (function frame() {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#4CAF50', '#FFD700', '#000000'] // Verde, Dourado e Preto
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#4CAF50', '#FFD700', '#000000']
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
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
        
        <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center relative overflow-hidden shadow-2xl transform transition-all scale-100">
            
            {/* Fundo decorativo */}
            <div className="absolute top-0 left-0 w-full h-2 bg-brand-green"></div>

            {/* Imagem do Calu */}
            <div className="flex justify-center mb-6">
                 {/* Se tiver a imagem calu-hero.svg na pasta public/img, use esta: */}
                 <img src="/assets/calu-hero.svg" alt="Calu" className="w-40 h-40 object-contain drop-shadow-xl" />
                 
                 {/* Fallback caso não tenha a imagem ainda */}
                 {/* <div className="w-32 h-32 bg-brand-green/20 rounded-full flex items-center justify-center text-6xl shadow-inner">
                    🦎
                 </div> */}
            </div>

            <h2 className="text-3xl font-black uppercase text-brand-dark mb-2">
                Bem-vindo!
            </h2>

            <p className="text-gray-600 text-lg mb-6 leading-relaxed">
                Você ganhou <span className="text-brand-green font-black text-xl">10 moedas verdes</span> pelo seu primeiro acesso.
            </p>

            <div className="bg-gray-50 p-4 rounded-xl mb-8 border border-gray-100">
                <p className="text-sm text-gray-500 font-medium">
                    Aproveite para começar a movimentar Fortaleza fazendo o seu primeiro descarte ou comprando pacotes disponíveis.
                </p>
            </div>

            <button 
                onClick={handleAction}
                className="w-full bg-black text-white font-black uppercase text-xl py-4 rounded-xl shadow-lg hover:bg-gray-800 transition-transform active:scale-95 animate-pulsar"
            >
                Movimentar Agora
            </button>

        </div>
    </div>
  );
};

export default WelcomeModal;