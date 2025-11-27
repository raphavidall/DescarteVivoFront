import React from 'react';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    // Overlay Escuro (Fundo)
    <div className="fixed inset-0 bg-black bg-opacity-70 z-[999] flex items-center justify-center p-4 backdrop-blur-sm">
      
      {/* Caixa do Modal (Branca/Cinza) */}
      <div className="bg-[#E5E5E5] rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto relative animate-fade-in">
        
        {/* Botão Fechar (X) */}
        <button 
            onClick={onClose}
            className="absolute top-4 right-4 bg-black text-white p-2 rounded-full hover:bg-gray-800 transition z-10"
        >
            <X size={24} />
        </button>

        {/* Conteúdo Principal */}
        <div className="p-8 md:p-12">
            {title && <h2 className="text-3xl font-black uppercase mb-8">{title}</h2>}
            {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;