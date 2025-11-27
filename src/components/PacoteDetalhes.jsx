import React, { useState, useEffect } from 'react';
import { MapPin, X, Send, User } from 'lucide-react';
import api from '../services/api';
import { PACOTE_STATUS } from '../utils/constants'; // Vamos criar esse arquivo no Front tbm?

// URL base para carregar as imagens (ajuste se sua porta for diferente)
const API_URL = "http://localhost:3000";

const PacoteDetalhes = ({ pacote, onClose, onUpdate }) => {
  const [mensagens, setMensagens] = useState([]);
  const [novaMensagem, setNovaMensagem] = useState("");
  const [loadingAction, setLoadingAction] = useState(false);
  
  const user = JSON.parse(localStorage.getItem('user'));
  const userId = user?.id;

  // Lógica de Papéis (Quem sou eu nesse pacote?)
  const isOwner = userId === pacote.id_ponto_descarte;
  const isDestino = userId === pacote.id_ponto_destino;
  const isColetor = userId === pacote.id_ponto_coleta;
  const isVisitor = !isOwner && !isDestino && !isColetor;

  // Carregar Mensagens
  useEffect(() => {
    async function fetchMensagens() {
      try {
        const response = await api.get(`/pacotes/${pacote.id}/mensagens`);
        setMensagens(response.data);
      } catch (error) {
        console.error("Erro ao carregar mensagens");
      }
    }
    fetchMensagens();
  }, [pacote.id]);

  // Enviar Mensagem
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!novaMensagem.trim()) return;

    try {
      await api.post(`/pacotes/${pacote.id}/mensagens`, { mensagem: novaMensagem });
      setNovaMensagem("");
      // Recarrega mensagens
      const res = await api.get(`/pacotes/${pacote.id}/mensagens`);
      setMensagens(res.data);
    } catch (error) {
      alert("Erro ao enviar mensagem.");
    }
  };

  // AÇÃO PRINCIPAL (Mudança de Status)
  const handleStatusChange = async (novoStatus, extraData = {}) => {
    try {
      setLoadingAction(true);
      
      // Monta o payload
      const payload = { status: novoStatus, ...extraData };
      
      // Regras específicas de ID
      if (novoStatus === 'AGUARDANDO_APROVACAO') payload.id_ponto_destino = userId;
      if (novoStatus === 'AGUARDANDO_RETIRADA') payload.id_ponto_coleta = userId;

      await api.put(`/pacotes/${pacote.id}`, payload);
      
      alert("Ação realizada com sucesso!");
      onUpdate(); // Avisa a página pai para recarregar
      onClose();  // Fecha o modal

    } catch (error) {
      const msg = error.response?.data?.message || "Erro na ação.";
      alert(msg);
    } finally {
      setLoadingAction(false);
    }
  };

  // --- O CÉREBRO: RENDERIZAÇÃO DOS BOTÕES ---
  const renderActionButtons = () => {
    const status = pacote.status;
    
    // 1. Visitante querendo comprar (Passo 2)
    if (isVisitor && status === 'DISPONIVEL') {
        return (
            <button 
                onClick={() => handleStatusChange('AGUARDANDO_APROVACAO')}
                disabled={loadingAction}
                className="w-full bg-black text-white font-black text-xl py-4 rounded-xl hover:bg-gray-800"
            >
                Solicitar Destinação (Comprar)
            </button>
        );
    }

    // 2. Dono aprovando venda (Passo 3)
    if (isOwner && status === 'AGUARDANDO_APROVACAO') {
        return (
            <div className="flex gap-2">
                <button 
                    onClick={() => handleStatusChange('AGUARDANDO_COLETA')}
                    className="flex-1 bg-brand-green text-white font-black text-lg py-3 rounded-xl hover:brightness-110"
                >
                    Aprovar
                </button>
                <button 
                    onClick={() => handleStatusChange('DISPONIVEL')} // Recusa
                    className="flex-1 bg-red-500 text-white font-black text-lg py-3 rounded-xl hover:brightness-110"
                >
                    Recusar
                </button>
            </div>
        );
    }

    // 3. Comprador decidindo como levar (Passo 4 ou 5)
    if (isDestino && status === 'AGUARDANDO_COLETA') {
        return (
            <div className="flex flex-col gap-2">
                <button 
                    onClick={() => handleStatusChange('DESTINADO')} // Coleta Pessoal
                    className="w-full bg-black text-white font-black text-lg py-3 rounded-xl"
                >
                    Já coletei (Finalizar)
                </button>
                <button 
                    onClick={() => handleStatusChange('A_COLETAR')} // Terceirizar
                    className="w-full bg-brand-orange text-white font-black text-lg py-3 rounded-xl"
                >
                    Solicitar Motorista
                </button>
            </div>
        );
    }

    // 4. Visitante/Motorista aceitando frete (Passo 6)
    // Nota: O dono não pode ser o motorista do próprio pacote
    if (!isOwner && !isDestino && status === 'A_COLETAR') {
        return (
            <button 
                onClick={() => handleStatusChange('AGUARDANDO_RETIRADA')}
                className="w-full bg-brand-orange text-white font-black text-xl py-4 rounded-xl"
            >
                Aceitar Corrida (Ser Coletor)
            </button>
        );
    }

    // 5. Coletor indicando que pegou (Passo 7)
    if (isColetor && status === 'AGUARDANDO_RETIRADA') {
        return (
             <button 
                onClick={() => handleStatusChange('EM_TRANSPORTE')}
                className="w-full bg-brand-orange text-white font-black text-xl py-4 rounded-xl"
            >
                Confirmar Retirada
            </button>
        );
    }

    // 6. Destino confirmando recebimento (Passo 8)
    if (isDestino && status === 'EM_TRANSPORTE') {
         return (
             <button 
                onClick={() => handleStatusChange('DESTINADO')}
                className="w-full bg-brand-green text-white font-black text-xl py-4 rounded-xl"
            >
                Confirmar Recebimento
            </button>
        );
    }

    // Status informativos (sem ação)
    if (status === 'DESTINADO') {
        return <div className="bg-gray-200 text-gray-500 font-bold text-center py-3 rounded-xl">Pacote Finalizado</div>
    }

    return <div className="text-gray-400 text-sm text-center">Aguardando ação de outro usuário...</div>;
  };

  // --- RENDERIZACAO VISUAL ---
  return (
    <div className="flex flex-col lg:flex-row gap-8">
        
        {/* LADO ESQUERDO: Imagem */}
        <div className="w-full lg:w-5/12">
            <div className="relative w-full h-80 bg-gray-200 rounded-2xl overflow-hidden shadow-sm">
                 {/* Tag Material */}
                 <div className="absolute top-0 right-4 bg-black text-white font-bold px-6 py-2 rounded-b-lg text-sm uppercase z-10">
                    {pacote.material?.nome}
                </div>

                {pacote.imagemUrl ? (
                    <img 
                        src={`${API_URL}/uploads/${pacote.imagemUrl}`} 
                        alt={pacote.titulo} 
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-brand-green">
                        {/* Placeholder verde igual ao seu design */}
                        <span className="text-white opacity-20 text-6xl">📦</span>
                    </div>
                )}
            </div>
        </div>

        {/* LADO DIREITO: Detalhes */}
        <div className="w-full lg:w-7/12 flex flex-col gap-4">
            
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <span className="text-gray-400 text-xs uppercase tracking-wider block mb-1">ID #{pacote.id.toString().padStart(6, '0')}</span>
                    <h2 className="text-3xl font-black uppercase leading-tight mb-1">{pacote.titulo}</h2>
                    <p className="text-gray-600 font-medium">@{pacote.pontoDescarte?.nome_completo}</p>
                    <div className="flex items-center gap-1 text-gray-500 mt-1">
                        <MapPin size={16} />
                        <span>{pacote.localizacao?.bairro || "Fortaleza"}</span>
                    </div>
                </div>

                {/* Preço */}
                <div className={`w-20 h-20 rounded-full flex items-center justify-center font-black text-xl text-white shadow-lg ${pacote.valor_pacote_moedas === 0 ? 'bg-brand-green' : 'bg-black'}`}>
                    {pacote.valor_pacote_moedas === 0 ? 'Free' : `$${pacote.valor_pacote_moedas}`}
                </div>
            </div>

            {/* Ações (Botões Dinâmicos) */}
            <div className="py-4">
                {renderActionButtons()}
            </div>

            {/* Descrição */}
            <div>
                <h3 className="font-black text-lg mb-1">Descrição</h3>
                <p className="text-gray-600 leading-relaxed text-sm bg-gray-100 p-4 rounded-xl">
                    {pacote.descricao || "Sem descrição informada."}
                </p>
            </div>

            {/* Área de Comentários */}
            <div className="mt-4 border-t pt-4">
                <h3 className="font-black text-lg mb-3">Comentários</h3>
                
                {/* Lista */}
                <div className="max-h-40 overflow-y-auto space-y-3 mb-4 pr-2">
                    {mensagens.length === 0 && <p className="text-gray-400 text-sm">Seja o primeiro a comentar.</p>}
                    {mensagens.map(msg => (
                        <div key={msg.id} className="bg-gray-50 p-3 rounded-lg text-sm">
                            <span className="font-bold text-black mr-2">Usuário {msg.id_remetente}:</span>
                            <span className="text-gray-700">{msg.mensagem}</span>
                        </div>
                    ))}
                </div>

                {/* Input */}
                <form onSubmit={handleSendMessage} className="relative">
                    <input 
                        type="text"
                        placeholder="Digite seu comentário ou dúvida..."
                        className="w-full bg-white border border-gray-300 p-4 pr-12 rounded-xl outline-none focus:ring-2 focus:ring-black"
                        value={novaMensagem}
                        onChange={e => setNovaMensagem(e.target.value)}
                    />
                    <button type="submit" className="absolute right-2 top-2 bottom-2 bg-black text-white px-4 rounded-lg hover:bg-gray-800 transition">
                        <Send size={18} />
                    </button>
                </form>
            </div>

        </div>
    </div>
  );
};

export default PacoteDetalhes;