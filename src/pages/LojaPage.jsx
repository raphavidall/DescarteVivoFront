import React from 'react';
import Navbar from '../components/Navbar';
import { ShoppingBag } from 'lucide-react';

const LojaPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Navbar />

      <main className="container mx-auto px-4 md:px-6 py-10">
        
        {/* Cabeçalho da Página */}
        <div className="flex items-center gap-4 mb-8">
            <h2 className="text-3xl font-black uppercase">Loja de Trocas</h2>
            <div className="bg-black text-white px-3 py-1 rounded-full text-xs font-bold uppercase">Em Breve</div>
        </div>

        {/* Conteúdo Placeholder */}
        <div className="bg-white rounded-3xl p-10 md:p-20 text-center border-2 border-dashed border-gray-300 flex flex-col items-center justify-center">
            
            <div className="bg-gray-100 p-6 rounded-full mb-6">
                <ShoppingBag size={48} className="text-gray-400" />
            </div>

            <h3 className="text-2xl font-bold text-gray-800 mb-2">
                A Loja está sendo preparada! 🚧
            </h3>
            
            <p className="text-gray-500 max-w-md mx-auto mb-8">
                Em breve você poderá trocar suas moedas verdes por produtos sustentáveis, descontos em parceiros e muito mais.
            </p>

            <button className="bg-black text-white font-bold px-8 py-3 rounded-xl hover:bg-gray-800 transition cursor-not-allowed opacity-50">
                Aguarde Novidades
            </button>

        </div>

      </main>
    </div>
  );
};

export default LojaPage;