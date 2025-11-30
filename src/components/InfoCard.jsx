import React from 'react';

const InfoCard = ({ category, title, color, imageColor }) => {
  return (
    <div className="flex flex-col gap-3 group cursor-pointer">
      {/* Área da Imagem / Cor */}
      <div className={`relative w-full h-48 rounded-xl overflow-hidden shadow-sm transition-transform group-hover:scale-[1.02] ${imageColor}`}>
        {/* Tag da Categoria (Floating) */}
        <div className="absolute top-0 right-4 bg-black text-white font-bold px-6 py-2 rounded-b-lg text-sm uppercase tracking-wide">
          {category}
        </div>
        {/* Aqui você colocaria uma <img> depois */}
      </div>

      {/* Texto */}
      <h3 className="font-black text-xl leading-tight text-brand-dark uppercase">
        {title}
      </h3>
    </div>
  );
};

export default InfoCard;