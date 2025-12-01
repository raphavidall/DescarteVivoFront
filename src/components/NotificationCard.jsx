import React from 'react';
import { PACOTE_STATUS } from '../utils/constants';

const NotificationCard = ({ notificacao, onAccept, onReject, onView }) => {
  const { tipo, titulo, mensagem, remetente, pacote, lida } = notificacao;

  const formatarNome = (nome) => {
    if (!nome) return "usuário";
    return "@" + nome.split(' ')[0].toLowerCase();
  };
  const userName = formatarNome(remetente?.nome_completo);

  const dataDisplay = new Date(notificacao.data_criacao).toLocaleDateString('pt-BR', {
    day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
  });

  // --- CORREÇÃO: Cores (Incluindo AVISO que estava bugado) ---
  let badgeColor = "bg-black text-white"; // Padrão
  if (tipo === "SOLICITACAO") badgeColor = "bg-[#FBBC05] text-black";
  if (tipo === "CONFIRMACAO") badgeColor = "bg-brand-green text-white";
  if (tipo === "AVISO") badgeColor = "bg-blue-600 text-white"; // Azul para avisos de transporte

  // --- LÓGICA DE PROGRESSO (Estado Derivado) ---

  const statusWeight = {
    [PACOTE_STATUS.DISPONIVEL]: 0,
    [PACOTE_STATUS.AGUARDANDO_APROVACAO]: 1, // Solicitação de Compra
    [PACOTE_STATUS.AGUARDANDO_COLETA]: 2,    // Aprovado
    [PACOTE_STATUS.A_COLETAR]: 3,            // Pediu Motorista (Avanço na logística)
    [PACOTE_STATUS.AGUARDANDO_RETIRADA]: 4,  // Motorista Solicitou
    [PACOTE_STATUS.EM_TRANSPORTE]: 5,        // Motorista Pegou
    [PACOTE_STATUS.DESTINADO]: 6             // Fim
  };

  const currentWeight = statusWeight[pacote?.status] || 0;
  let visualState = "INFO";

  if (tipo === "SOLICITACAO") {
    // É uma solicitação PENDENTE se o pacote estiver exatamente no status que pede ação
    // Ex: Compra pede ação no status 1. Coleta pede ação no status 4.
    const isPendingPurchase = pacote?.status === PACOTE_STATUS.AGUARDANDO_APROVACAO;
    const isPendingDriver = pacote?.status === PACOTE_STATUS.AGUARDANDO_RETIRADA;

    // REGRA 1: Se já foi lida, acabou. Mostra o resultado histórico.
    if (lida) {
      // Se o pacote avançou além do ponto da notificação, foi sucesso.
      // Se voltou para disponível, foi rejeitado.
      visualState = "FINALIZADO";
    }

    // REGRA 2: Se não foi lida, verifica se ainda é válida
    else {
      // Só mostra botões se o pacote estiver EXATAMENTE no status que exige ação
      const needsAction =
        (pacote?.status === PACOTE_STATUS.AGUARDANDO_APROVACAO && titulo.includes("Solicitação de Coleta")) ||
        (pacote?.status === PACOTE_STATUS.AGUARDANDO_RETIRADA && titulo.includes("Motorista")); // Ajuste conforme seus títulos

      if (needsAction) {
        visualState = "PENDENTE";
      } else {
        // Se não foi lida mas o pacote já mudou de status (ex: outro motorista pegou), ela "expirou"
        visualState = "FINALIZADO";
      }
    }
  }

  return (
    <div className="bg-gray-200 rounded-2xl overflow-hidden shadow-sm flex flex-col md:flex-row transition-all hover:shadow-md mb-4">

      {/* LADO ESQUERDO */}
      <div className="flex-1 p-0">
        <div className={`${badgeColor} font-black px-6 py-1 inline-block rounded-br-xl uppercase text-xs tracking-wide mb-3`}>
          {titulo}
        </div>

        <div className="px-4 pb-4 flex items-start gap-4">
          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-gray-400 shrink-0 bg-gray-300">
            <img src={`https://ui-avatars.com/api/?name=${userName.substring(1)}&background=random`} alt="Avatar" />
          </div>

          <div className="flex-1">
            <p className="text-sm text-gray-800 leading-relaxed">
              <span className="font-bold text-black">{userName}</span> {mensagem.replace(/@\w+|Um usuário/gi, '')}
            </p>
            <p className="text-xs text-gray-500 mt-2 font-medium">{dataDisplay}</p>
          </div>
        </div>
      </div>

      {/* LADO DIREITO */}
      <div className="bg-gray-300/50 md:w-56 p-4 flex flex-col justify-center gap-2 border-l border-gray-300">

        {visualState === "PENDENTE" && (
          <div className="grid grid-cols-2 md:grid-cols-1 gap-2">
            <button
              onClick={onAccept}
              className="bg-brand-green text-white font-black py-3 rounded-lg hover:brightness-110 uppercase text-xs shadow-sm w-full"
            >
              Aceitar
            </button>
            <button
              onClick={onReject}
              className="bg-brand-brown text-white font-black py-3 rounded-lg hover:brightness-110 uppercase text-xs shadow-sm w-full"
            >
              Rejeitar
            </button>
          </div>
        )}

        {visualState === "REJEITADO" && (
          <div className="text-center py-2">
            <div className="font-bold text-red-600 mb-1 text-sm">❌ Rejeitado</div>
            <div className="text-xs text-gray-500">Cancelado/Voltou</div>
          </div>
        )}

        {(visualState === "FINALIZADO" || visualState === "INFO") && (
          <div className="text-center py-2">
            {/* Se for finalizado, mostra ícone de sucesso, se for info, nada ou ícone de info */}
            {visualState === "FINALIZADO" && <div className="font-bold text-blue-600 mb-1 text-sm">🚀 Processo Andou</div>}

            <button
              onClick={onView}
              className="w-full bg-black text-white font-black py-2 rounded-lg hover:gray-800 uppercase text-xs shadow-sm mt-1"
            >
              Ver Pacote
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default NotificationCard;