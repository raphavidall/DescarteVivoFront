import React from 'react';
import { MapPin } from 'lucide-react';

const PacoteCard = ({ pacote, onClick }) => {
  // Tratamento para garantir que não quebre se vier dados faltando da API
  const materialNome = pacote.material?.nome || "Material";
  const usuarioNome = pacote.pontoDescarte?.nome_completo || "Usuário";
  // Gera um @username simples baseado no nome (ex: Raphaela Vidal -> @raphaela_vidal)
  const username = "@" + usuarioNome.split(' ').join('_').toLowerCase();
  
  // Tratamento do Preço
  const isFree = pacote.valor_pacote_moedas === 0;
  const precoDisplay = isFree ? "Free" : `$ ${pacote.valor_pacote_moedas}`;
  const precoColor = isFree ? "bg-brand-green" : "bg-black"; // Verde se for grátis, Preto se tiver preço

  // Título do Card (Ex: "Plástico (1,5 Kg)")
  const titulo = `${materialNome} (${pacote.peso_kg} Kg)`;

  return (
    <div onClick={onClick} className="flex flex-col gap-3 group cursor-pointer">
      
      {/* --- ÁREA DA IMAGEM --- */}
      <div className="relative w-full h-64 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden transition-transform group-hover:scale-[1.02]">
        
        {/* Tag do Material (Topo Esquerdo) */}
        {/* No seu design a cor varia (Tecido=Preto, Plástico=Preto), vou deixar padrão preto por enquanto */}
        <div className="absolute top-0 left-4 bg-black text-white font-bold px-6 py-2 rounded-b-lg text-sm uppercase tracking-wide z-10">
            {materialNome}
        </div>

        {/* Placeholder da Imagem (Cinza claro ou Imagem real se tiver) */}
        <div className="w-full h-full bg-gray-50 flex items-center justify-center text-gray-300">
             {/* Aqui iria a <img> se o backend suportasse upload de foto */}
             <span className="text-4xl opacity-20">📦</span>
        </div>

        {/* Bolinha de Preço (Canto Inferior Direito) */}
        <div className={`absolute bottom-4 right-4 ${precoColor} text-white w-16 h-16 rounded-full flex items-center justify-center font-black text-xl shadow-lg border-4 border-white z-10`}>
            {precoDisplay}
        </div>
      </div>

      {/* --- ÁREA DE INFORMAÇÕES --- */}
      <div className="px-1">
        {/* Título */}
        <h3 className="font-black text-xl leading-tight text-brand-dark mb-2">
            {titulo}
        </h3>

        {/* Rodapé do Card: Usuário e Local */}
        <div className="flex justify-between items-center text-gray-600 text-sm">
            
            {/* Usuário */}
            <span className="font-medium hover:text-black cursor-pointer">
                {username}
            </span>

            {/* Localização */}
            <div className="flex items-center gap-1">
                <MapPin size={16} className="text-black" />
                {/* Aqui idealmente viria o Bairro do JSON de endereço. 
                    Como no backend atual salvamos coordenadas ou endereço completo, 
                    vou colocar um placeholder ou tentar pegar a cidade */}
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