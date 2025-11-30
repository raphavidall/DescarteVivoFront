import React, { useState, useEffect } from 'react';
import { MapPin, X, Send, User, Lock } from 'lucide-react'; // <--- ADICIONEI O LOCK
import api from '../services/api';
import { PACOTE_STATUS } from '../utils/constants';
import { BASE_URL } from '../services/api';

// const API_URL = "http://localhost:3000";

const PacoteDetalhes = ({ pacote, onClose, onUpdate }) => {
  const [mensagens, setMensagens] = useState([]);
  const [novaMensagem, setNovaMensagem] = useState("");
  const [loadingAction, setLoadingAction] = useState(false);
  const [pacoteAtual, setPacoteAtual] = useState(pacote);
  
  const user = JSON.parse(localStorage.getItem('user'));
  const userId = user?.id;

  const isOwner = userId === pacote.id_ponto_descarte;
  const isDestino = userId === pacote.id_ponto_destino; 
  const isColetor = userId === pacote.id_ponto_coleta;

  const isVisitor = !isOwner && !isDestino && !isColetor;

  // Função para recarregar dados deste pacote específico
  const refreshDetails = async () => {
    try {
        const res = await api.get(`/pacotes/${pacote.id}`);
        setPacoteAtual(res.data); // Atualiza o visual
    } catch (err) { console.error("Erro ao atualizar"); }
};

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

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!novaMensagem.trim()) return;
    try {
      await api.post(`/pacotes/${pacote.id}/mensagens`, { mensagem: novaMensagem });
      setNovaMensagem("");
      const res = await api.get(`/pacotes/${pacote.id}/mensagens`);
      setMensagens(res.data);
    } catch (error) {
      alert("Erro ao enviar mensagem.");
    }
  };

  const handleStatusChange = async (novoStatus, extraData = {}) => {
    try {
      setLoadingAction(true);
      const payload = { status: novoStatus, ...extraData };
      
      if (novoStatus === PACOTE_STATUS.AGUARDANDO_APROVACAO) payload.id_ponto_destino = userId;
      if (novoStatus === PACOTE_STATUS.AGUARDANDO_RETIRADA) payload.id_ponto_coleta = userId;

      await api.put(`/pacotes/${pacote.id}`, payload);
    //   alert("Status atualizado com sucesso! ✅");
      onUpdate();
      await refreshDetails();
    //   onClose();
      setNovaMensagem("Status atualizado com sucesso! ✅"); 
      setTimeout(() => setNovaMensagem(""), 3000);
    } catch (error) {
        console.error(error);
        const msg = error.response?.data?.message || "Erro na ação.";
        alert(msg);
    } finally {
      setLoadingAction(false);
    }
  };

  // --- COMPONENTE VISUAL: BOTÃO BLOQUEADO (STATUS) ---
  const LockedStatus = ({ text }) => (
    <div className="w-full bg-gray-600 text-white font-bold text-xl py-4 rounded-xl flex items-center justify-center gap-3 shadow-inner opacity-90 cursor-not-allowed select-none">
        <span>{text}</span>
        <Lock size={20} className="text-gray-300" />
    </div>
  );

  // --- O CÉREBRO: DECIDINDO O QUE MOSTRAR ---
  const renderActionButtons = () => {
    const status = pacoteAtual.status;
    
    // ======================================================
    // ESTADO 1: DISPONÍVEL (Ninguém pegou ainda)
    // ======================================================
    if (status === PACOTE_STATUS.DISPONIVEL) {
        if (isOwner) return <LockedStatus text="Aguardando Interessados" />;
        
        // Qualquer outro usuário pode solicitar
        return (
            <button 
                onClick={() => handleStatusChange(PACOTE_STATUS.AGUARDANDO_APROVACAO)}
                disabled={loadingAction}
                className="w-full bg-black text-white font-black text-xl py-4 rounded-xl hover:bg-gray-800 transition shadow-lg"
            >
                Solicitar Destinação (Comprar)
            </button>
        );
    }

    // ======================================================
    // ESTADO 2: AGUARDANDO APROVAÇÃO (Dono tem que aceitar)
    // ======================================================
    if (status === PACOTE_STATUS.AGUARDANDO_APROVACAO) {
        if (isOwner) {
            return (
                <div className="flex gap-3">
                    <button 
                        onClick={() => handleStatusChange(PACOTE_STATUS.AGUARDANDO_COLETA)}
                        className="flex-1 bg-brand-green text-white font-black text-lg py-3 rounded-xl hover:brightness-110 shadow-md"
                    >
                        Aprovar
                    </button>
                    <button 
                        // Ao recusar, volta para DISPONIVEL (limpa o destino no backend)
                        onClick={() => handleStatusChange(PACOTE_STATUS.DISPONIVEL)} 
                        className="flex-1 bg-red-600 text-white font-black text-lg py-3 rounded-xl hover:brightness-110 shadow-md"
                    >
                        Recusar
                    </button>
                </div>
            );
        }
        if (isDestino) return <LockedStatus text="Aguardando Aprovação do Dono" />;
        return <LockedStatus text="Em Negociação com outro usuário" />;
    }

    // ======================================================
    // ESTADO 3: AGUARDANDO COLETA (Dono aceitou, Destino decide frete)
    // ======================================================
    if (status === PACOTE_STATUS.AGUARDANDO_COLETA) {
        if (isDestino) {
            return (
                <div className="flex flex-col gap-2">
                    <button 
                        onClick={() => handleStatusChange(PACOTE_STATUS.DESTINADO)}
                        className="w-full bg-black text-white font-black text-lg py-3 rounded-xl hover:bg-gray-800"
                    >
                        Já coletei pessoalmente
                    </button>
                    <button 
                        onClick={() => handleStatusChange(PACOTE_STATUS.A_COLETAR)}
                        className="w-full bg-brand-orange text-white font-black text-lg py-3 rounded-xl hover:brightness-110"
                    >
                        Solicitar Motorista
                    </button>
                </div>
            );
        }
        if (isOwner) return <LockedStatus text="Aguardando Retirada pelo Destino" />;
        return <LockedStatus text="Vendido - Aguardando Retirada" />;
    }

    // ======================================================
    // ESTADO 4: A COLETAR (Aberto para Motoristas)
    // ======================================================
    if (status === PACOTE_STATUS.A_COLETAR) {
        // Regra: Dono e Destino não podem ser o motorista terceirizado
        if (!isOwner && !isDestino) {
            return (
                <button 
                    onClick={() => handleStatusChange(PACOTE_STATUS.AGUARDANDO_RETIRADA)}
                    className="w-full bg-brand-orange text-white font-black text-xl py-4 rounded-xl hover:brightness-110 shadow-lg"
                >
                    Aceitar Corrida (Ser Coletor)
                </button>
            );
        }
        if (isDestino) return <LockedStatus text="Procurando Motorista..." />;
        if (isOwner) return <LockedStatus text="Aguardando Coleta Terceirizada" />;
    }

    // ======================================================
    // ESTADO 5: AGUARDANDO RETIRADA (Motorista aceitou e está indo)
    // ======================================================
    if (status === PACOTE_STATUS.AGUARDANDO_RETIRADA) {
        if (isColetor) {
            return (
                 <button 
                    onClick={() => handleStatusChange(PACOTE_STATUS.EM_TRANSPORTE)}
                    className="w-full bg-brand-orange text-white font-black text-xl py-4 rounded-xl hover:brightness-110 shadow-lg"
                >
                    Confirmar Retirada (Pacote em mãos)
                </button>
            );
        }
        if (isDestino) return <LockedStatus text="Motorista à caminho da coleta" />;
        if (isOwner) return <LockedStatus text="Aguardando Motorista retirar" />;
        return <LockedStatus text="Coleta em andamento" />;
    }

    // ======================================================
    // ESTADO 6: EM TRANSPORTE (Pacote à caminho)
    // ======================================================
    if (status === PACOTE_STATUS.EM_TRANSPORTE) {
        if (isDestino) {
             return (
                 <button 
                    onClick={() => handleStatusChange(PACOTE_STATUS.DESTINADO)}
                    className="w-full bg-brand-green text-white font-black text-xl py-4 rounded-xl hover:brightness-110 shadow-lg"
                >
                    Confirmar Recebimento (Pacote chegou)
                </button>
            );
        }
        if (isColetor) return <LockedStatus text="Em trânsito para o destino" />;
        if (isOwner) return <LockedStatus text="Pacote à caminho do destino" />;
    }

    // ======================================================
    // ESTADO FINAL: DESTINADO
    // ======================================================
    if (status === PACOTE_STATUS.DESTINADO) {
        return (
            <div className="w-full bg-green-600 text-white font-black text-xl py-4 rounded-xl flex items-center justify-center gap-2">
                <span>Pacote Finalizado</span>
                <span className="text-2xl">✅</span>
            </div>
        );
    }

    return <LockedStatus text="Status Desconhecido" />;
  };

  // --- RENDER ---
  return (
    <div className="flex flex-col lg:flex-row gap-8">
        
        {/* LADO ESQUERDO: Imagem */}
        <div className="w-full lg:w-5/12">
            <div className="relative w-full h-80 bg-gray-200 rounded-2xl overflow-hidden shadow-sm group">
                 <div className="absolute top-0 right-4 bg-black text-white font-bold px-6 py-2 rounded-b-lg text-sm uppercase z-10 shadow-md">
                    {pacoteAtual.material?.nome}
                </div>
                {pacoteAtual.imagemUrl ? (
                    <img 
                        src={pacoteAtual.imagemUrl}
                        alt={pacoteAtual.titulo} 
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-brand-green">
                        <span className="text-white opacity-20 text-6xl">📦</span>
                    </div>
                )}
            </div>
        </div>

        {/* LADO DIREITO: Detalhes */}
        <div className="w-full lg:w-7/12 flex flex-col gap-4">
            
            <div className="flex justify-between items-start">
                <div>
                    <span className="text-gray-400 text-xs uppercase tracking-wider block mb-1">ID #{pacoteAtual.id.toString().padStart(6, '0')}</span>
                    <h2 className="text-3xl font-black uppercase leading-tight mb-1">{pacoteAtual.titulo}</h2>
                    <p className="text-gray-600 font-medium">@{pacoteAtual.pontoDescarte?.nome_completo}</p>
                    <div className="flex items-center gap-1 text-gray-500 mt-1">
                        <MapPin size={16} />
                        <span>{pacoteAtual.localizacao?.bairro || "Fortaleza"}</span>
                    </div>
                </div>

                <div className={`w-20 h-20 rounded-full flex items-center justify-center font-black text-xl text-white shadow-lg border-4 border-white ${pacoteAtual.valor_pacote_moedas === 0 ? 'bg-brand-green' : 'bg-black'}`}>
                    {pacoteAtual.valor_pacote_moedas === 0 ? 'Free' : `$${pacoteAtual.valor_pacote_moedas.toFixed(0)}`}
                </div>
            </div>

            {/* --- ÁREA DE AÇÃO --- */}
            <div className="py-2">
                {renderActionButtons()}
            </div>
            {/* -------------------- */}

            <div>
                <h3 className="font-black text-lg mb-1">Descrição</h3>
                <p className="text-gray-600 leading-relaxed text-sm bg-gray-100 p-4 rounded-xl min-h-[80px]">
                    {pacoteAtual.descricao || "Sem descrição informada."}
                </p>
            </div>

            <div className="mt-2 border-t pt-4">
                <h3 className="font-black text-lg mb-3">Comentários</h3>
                <div className="max-h-32 overflow-y-auto space-y-3 mb-4 pr-2 custom-scrollbar">
                    {mensagens.length === 0 && <p className="text-gray-400 text-sm italic">Seja o primeiro a comentar.</p>}
                    {mensagens.map(msg => (
                        <div key={msg.id} className="bg-gray-50 p-3 rounded-lg text-sm border border-gray-100">
                            <span className="font-bold text-black mr-2">
                                {msg.id_remetente === userId ? "Você" : `Usuário ${msg.id_remetente}`}:
                            </span>
                            <span className="text-gray-700">{msg.mensagem}</span>
                        </div>
                    ))}
                </div>

                <form onSubmit={handleSendMessage} className="relative">
                    <input 
                        type="text"
                        placeholder="Digite seu comentário..."
                        className="w-full bg-white border border-gray-300 p-3 pr-12 rounded-xl outline-none focus:ring-2 focus:ring-black text-sm transition-shadow"
                        value={novaMensagem}
                        onChange={e => setNovaMensagem(e.target.value)}
                    />
                    <button type="submit" className="absolute right-2 top-1.5 bottom-1.5 bg-black text-white px-3 rounded-lg hover:bg-gray-800 transition flex items-center justify-center">
                        <Send size={16} />
                    </button>
                </form>
            </div>

        </div>
    </div>
  );
};

export default PacoteDetalhes;