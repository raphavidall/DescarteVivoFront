import React from 'react';
import { MapPin } from 'lucide-react';

const PacoteCard = ({ pacote, onClick }) => {
  const materialNome = pacote.material?.nome || "Material";
  const usuarioNome = pacote.pontoDescarte?.nome_completo || "Usuário";
  const username = "@" + usuarioNome.split(' ').join('_').toLowerCase();

  const user = JSON.parse(localStorage.getItem('user'));
  const myId = user?.id;

  const isOwner = myId === pacote.id_ponto_descarte;
  const isDestino = myId === pacote.id_ponto_destino;

  const isColetaOportunidade = pacote.status === 'A_COLETAR' && !isOwner && !isDestino;

  const isFree = pacote.valor_pacote_moedas === 0;

  // --- CORREÇÃO 3: Formatação de Preço (2 casas decimais) ---
  const valorMoedas = Number(pacote.valor_pacote_moedas);
  const valorColeta = Number(pacote.valor_coleta_moedas);

  let valorDisplay;
  if (isColetaOportunidade) {
    const val = valorColeta > 0 ? valorColeta : (valorMoedas * 0.25);
    valorDisplay = `+${val.toFixed(0)}`;
  } else {
    valorDisplay = isFree ? "Free" : `$ ${valorMoedas.toFixed(0)}`;
  }

  // Cores dinâmicas
  let cardBorder = "border-gray-100";
  let badgeColor = "bg-black";
  let priceColor = isFree ? "bg-brand-green" : "bg-black";

  if (isColetaOportunidade) {
    cardBorder = "border-brand-green border-2"; // Borda verde para destacar
    badgeColor = "bg-brand-green"; // Tag do material verde
    priceColor = "bg-brand-green"; // Bolinha de preço verde
  }

  // Título do Card (Ex: "Plástico (1,5 Kg)")
  const titulo = `${pacote.titulo} (${pacote.peso_kg} Kg)`;

  return (
    <div onClick={onClick} className="flex flex-col gap-3 group cursor-pointer">

      {/* Container da Imagem com Borda Dinâmica */}
      <div className={`relative w-full h-64 bg-white rounded-xl shadow-sm overflow-hidden transition-transform group-hover:scale-[1.02] ${cardBorder}`}>

        {/* Tag do Material */}
        <div className={`absolute top-0 left-4 ${badgeColor} text-white font-bold px-6 py-2 rounded-b-lg text-sm uppercase tracking-wide z-10 shadow-md`}>
          {isColetaOportunidade ? "Oferta de Coleta" : materialNome}
        </div>

        {/* Imagem */}
        <div className="w-full h-full bg-gray-50 flex items-center justify-center text-gray-300">
          {pacote.imagemUrl ? (
            <img
              src={pacote.imagemUrl}
              alt={pacote.titulo}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-4xl opacity-20">📦</span>
          )}
        </div>

        {/* Bolinha de Preço / Ganho */}
        <div className={`absolute bottom-4 right-4 ${priceColor} text-white w-16 h-16 rounded-full flex items-center justify-center font-black text-xl shadow-lg border-4 border-white z-10`}>
          {valorDisplay}
        </div>
      </div>

      {/* Infos */}
      <div className="px-1">
        <h3 className="font-black text-xl leading-tight text-brand-dark mb-2">
          {titulo}
        </h3>

        <div className="flex justify-between items-center text-gray-600 text-sm">
          <span className="font-medium hover:text-black">
            {username}
          </span>
          <div className="flex items-center gap-1">
            <MapPin size={16} className="text-black" />
            <span>
              {pacote.localizacao?.bairro || "Fortaleza"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PacoteCard;