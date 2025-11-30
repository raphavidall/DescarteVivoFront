import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import NotificationCard from '../components/NotificationCard';
import Modal from '../components/Modal';
import PacoteDetalhes from '../components/PacoteDetalhes';
import api from '../services/api';
import { X } from 'lucide-react'; // <--- Importe o ícone

const NotificacoesPage = () => {
    const [notificacoes, setNotificacoes] = useState([]);
    const [loading, setLoading] = useState(true);

    // Estados para o Modal de Confirmação
    const [confirmModalOpen, setConfirmModalOpen] = useState(false);
    const [selectedNotif, setSelectedNotif] = useState(null);

    // Estados para o Modal de Visualização do Pacote ---
    const [viewingPacote, setViewingPacote] = useState(null);

    const navigate = useNavigate();

    // Carregar lista
    const fetchNotificacoes = async () => {
        try {
            const res = await api.get('/notificacoes');

            const sorted = res.data.sort((a, b) => {
                return new Date(b.data_criacao) - new Date(a.data_criacao);
            });
            setNotificacoes(sorted);
            markAllAsReadLocally(res.data);
        } catch (error) {
            console.error("Erro");
        } finally {
            setLoading(false);
        }
    };

    const markAllAsReadLocally = async (lista) => {
        // Filtra as não lidas que são apenas AVISO ou CONFIRMACAO (que não exigem clique em botão)
        // As de SOLICITACAO a gente só marca como lida quando o usuário clica em Aceitar/Rejeitar
        // const toRead = lista.filter(n => !n.lida && n.tipo !== 'SOLICITACAO');

        // Dispara promises em paralelo para limpar o badge
        Promise.all(lista.map(n => api.put(`/notificacoes/${n.id}/lida`)));
    };

    useEffect(() => {
        fetchNotificacoes();
    }, []);

    // Abre Modal
    const handleRequestAccept = (notificacao) => {
        setSelectedNotif(notificacao);
        setConfirmModalOpen(true);
    };

    // Lógica Confirmar no Modal (Executa a ação real)
    const confirmAction = async () => {
        if (!selectedNotif) return;
        try {
            // Exemplo: Aceitar solicitação = Mover para AGUARDANDO_COLETA
            await api.put(`/pacotes/${selectedNotif.id_pacote}`, {
                status: 'AGUARDANDO_COLETA'
            });

            alert("Permissão concedida!");
            setConfirmModalOpen(false);
            setNotificacoes(prev => prev.map(n =>
                n.id === selectedNotif.id
                    ? { ...n, resolvido: true, data_resolucao: new Date() } // Marca localmente
                    : n
            ));
            fetchNotificacoes(); // Atualiza a lista
        } catch (error) {
            alert("Erro ao processar ação.");
        }
    };

    // Rejeitar (Lógica simples, fecha a notificação ou muda status)
    const handleRequestReject = async (notificacao) => {
        if (!confirm("Tem certeza que deseja rejeitar?")) return;
        try {
            // Volta o pacote para DISPONIVEL
            await api.put(`/pacotes/${notificacao.id_pacote}`, { status: 'DISPONIVEL' });
            alert("Solicitação rejeitada.");
            setNotificacoes(prev => prev.map(n =>
                n.id === notificacao.id
                    ? { ...n, resolvido: true, rejeitado: true }
                    : n
            ));
            // setConfirmModalOpen(false);
            fetchNotificacoes();
        } catch (err) { alert("Erro"); }
    };

    const handleViewPackage = async (idPacote) => {
        try {
            const response = await api.get(`/pacotes/${idPacote}`);
            setViewingPacote(response.data);
        } catch (error) {
            alert("Não foi possível carregar os detalhes do pacote. Ele pode ter sido excluído.");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <Navbar />

            <main className="container mx-auto px-4 md:px-6 py-8 max-w-4xl">
                <h2 className="text-3xl font-black uppercase mb-8">Notificações</h2>

                {loading ? <div className="text-center py-10">Carregando...</div> : (
                    <div className="space-y-4">
                        {notificacoes.map(notif => (
                            <NotificationCard
                                key={notif.id}
                                notificacao={notif}
                                onAccept={() => handleRequestAccept(notif)}
                                onReject={() => handleRequestReject(notif)}
                                // Agora chamamos a função real
                                onView={() => handleViewPackage(notif.id_pacote)}
                            />
                        ))}
                    </div>
                )}
            </main>

            {/* --- MODAL DE DETALHES DO PACOTE --- */}
            {/* Reutilizamos o mesmo componente da página Movimentar */}
            <Modal
                isOpen={!!viewingPacote}
                onClose={() => setViewingPacote(null)}
            >
                {viewingPacote && (
                    <PacoteDetalhes
                        pacote={viewingPacote}
                        onClose={() => setViewingPacote(null)}
                        // Ao atualizar o pacote (ex: confirmar recebimento), recarregamos as notificações
                        // para atualizar os status dos cards de notificação
                        onUpdate={fetchNotificacoes}
                    />
                )}
            </Modal>
            {/* ----------------------------------- */}

            {/* MODAL DE CONFIRMAÇÃO DE SOLICITAÇÃO (Mantenha o seu código atual aqui) */}
            {confirmModalOpen && (
                // ... seu modal de aceitar/rejeitar ...
                <div
                    className="fixed inset-0 bg-black/90 z-[60] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in"
                    onClick={() => setConfirmModalOpen(false)}
                >
                    <div className="text-center max-w-xl w-full relative" onClick={e => e.stopPropagation()}>
                        <button
                            onClick={() => setConfirmModalOpen(false)}
                            className="absolute -top-12 right-0 md:-top-4 md:-right-4 text-gray-400 hover:text-white transition p-2"
                        >
                            <X size={32} />
                        </button>

                        <h3 className="text-white text-2xl md:text-3xl font-bold mb-6 leading-snug">
                            Você deseja conceder permissão para o usuário <br />
                            <span className="text-brand-green">
                                @{selectedNotif?.remetente?.nome_completo ? selectedNotif.remetente.nome_completo.split(' ')[0].toLowerCase() : 'usuario'}
                            </span> coletar o pacote?
                        </h3>

                        <p className="text-gray-400 mb-8 text-sm md:text-base leading-relaxed max-w-md mx-auto">
                            Tem certeza? O pacote ficará reservado para este usuário e ele receberá as instruções de coleta.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <button
                                onClick={() => setConfirmModalOpen(false)}
                                className="bg-brand-brown text-white font-black py-3 rounded-xl hover:opacity-90 uppercase text-sm tracking-wide w-full"
                            >
                                Rejeitar Solicitação
                            </button>
                            <button
                                onClick={confirmAction}
                                className="bg-brand-green text-white font-black py-3 rounded-xl hover:opacity-90 uppercase text-sm tracking-wide w-full"
                            >
                                Confirmar Permissão
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default NotificacoesPage;