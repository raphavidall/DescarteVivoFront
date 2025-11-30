import React, { useState } from 'react';
import bannerBg from '../assets/banner-bg.png';

const DashboardHero = ({ customButton }) => {
  const [expanded, setExpanded] = useState(true);

  // Define qual botão usar (o padrão ou o customizado)
  const ActionButton = customButton ? customButton : (
    <button className="bg-brand-green text-white font-black uppercase text-lg px-8 py-3 rounded-lg shadow-lg hover:brightness-110 transition">
      Conheça a Descarte Vivo
    </button>
  );

  return (
    <div
      className={`relative w-full transition-all duration-500 ease-in-out overflow-hidden ${expanded ? 'h-[400px]' : 'h-[100px]'}`}
      style={{ backgroundColor: '#0F2C40' }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-brand-dark to-blue-900 opacity-90"></div>

      <div className="relative z-10 container mx-auto h-full px-4">

        {/* CONTEÚDO EXPANDIDO (Mascote + Texto) */}
        <div className={`h-full flex items-center justify-center transition-opacity duration-300 ${expanded ? 'opacity-100' : 'opacity-0 pointer-events-none absolute inset-0'}`}>
          <div className="flex items-center w-full max-w-4xl justify-between">
            {/* Mascote */}
            <div className="w-1/3 flex justify-center">
              <div className="w-40 h-40 bg-white/10 rounded-full flex items-center justify-center text-4xl">🦎</div>
            </div>

            {/* Texto e Botão */}
            <div className="w-2/3 text-right text-white space-y-4">
              <p className="text-xl md:text-2xl leading-relaxed">
                Fala aí! Eu sou o Calu.<br />
                Estou aqui para te ajudar a se integrar na<br />
                maior comunidade de descarte de Fortaleza.
              </p>
              {ActionButton}
            </div>
          </div>
        </div>

        {/* CONTEÚDO ENCOLHIDO (Apenas o Botão) */}
        <div className={`h-full flex items-center justify-center transition-opacity duration-500 ${expanded ? 'opacity-0 pointer-events-none absolute inset-0' : 'opacity-100'}`}>
          {/* Renderiza apenas o botão aqui quando encolhido */}
          <div className="scale-75 origin-center">
            {ActionButton}
          </div>
        </div>

      </div>

      {/* Botão de Controle (Toggle) */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="absolute bottom-4 left-6 text-white text-sm flex items-center gap-2 hover:underline z-20"
      >
        [{expanded ? '-' : '+'}] {expanded ? 'Encolher Banner' : 'Expandir Banner'}
      </button>
    </div>
  );
};

export default DashboardHero;