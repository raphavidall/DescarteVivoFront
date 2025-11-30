import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Power } from 'lucide-react';
import Navbar from '../components/Navbar';
import PacoteCard from '../components/PacoteCard';
import Modal from '../components/Modal';
import PacoteDetalhes from '../components/PacoteDetalhes';
import api from '../services/api';

const ProfilePage = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [pacotes, setPacotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('PACOTES');
    const [selectedPacote, setSelectedPacote] = useState(null);

    useEffect(() => {
        async function fetchData() {
            try {
                const localUser = JSON.parse(localStorage.getItem('user'));
                if (!localUser) { navigate('/'); return; }

                const resUser = await api.get(`/usuarios/${localUser.id}`);
                setUser(resUser.data);

                const resPacotes = await api.get('/pacotes/meus');
                setPacotes(resPacotes.data);
            } catch (error) {
                console.error("Erro ao carregar perfil");
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/');
    };

    const firstName = user?.nome_completo?.split(' ')[0] || "Usuário";
    const userName = user?.nome_completo?.split(' ')[0].toLowerCase() || "user";
    const saldo = user?.saldo_moedas?.toFixed(0) || "0";

    const renderTabContent = () => {
        if (activeTab === 'PACOTES') {
            if (pacotes.length === 0) {
                return <div className="text-gray-500 py-10 text-center">Você ainda não movimentou nenhum pacote.</div>;
            }
            return (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {pacotes.map(pacote => (
                        <PacoteCard
                            key={pacote.id}
                            pacote={pacote}
                            onClick={() => setSelectedPacote(pacote)}
                        />
                    ))}
                </div>
            );
        }
        return (
            <div className="bg-gray-100 rounded-xl p-10 text-center text-gray-500 border-2 border-dashed border-gray-300">
                <h3 className="text-xl font-bold mb-2">Em Construção 🚧</h3>
                <p>A funcionalidade de {activeTab.toLowerCase()} estará disponível em breve.</p>
            </div>
        );
    };

    if (loading) return <div className="text-center py-20">Carregando perfil...</div>;

    return (
        <div className="min-h-screen bg-white flex flex-col">
            <Navbar />

            <div className="flex flex-col-reverse md:flex-row flex-1">

                {/* --- COLUNA ESQUERDA (Conteúdo) --- */}
                <div className="w-full md:w-2/3 flex flex-col border-r border-gray-100">

                    {/* Barra Preta */}
                    <div className="bg-black text-white py-3 md:py-5 px-2 md:px-8">
                        <div className="flex w-full items-center text-sm md:text-lg font-bold uppercase tracking-wide">
                            {['REDE', 'PACOTES', 'PRODUTOS'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`
                                flex-1 text-center transition-colors py-2 leading-tight flex items-center justify-center h-full
                                ${activeTab === tab ? 'text-brand-green' : 'text-gray-400 hover:text-white'}
                            `}
                                >
                                    {tab === 'PACOTES' ? (
                                        <>MEUS <br className="md:hidden" /> PACOTES</>
                                    ) : tab === 'PRODUTOS' ? (
                                        <>MEUS <br className="md:hidden" /> PRODUTOS</>
                                    ) : tab}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Conteúdo */}
                    <main className="p-4 md:p-10 flex-1 bg-white">
                        {renderTabContent()}
                    </main>
                </div>

                {/* --- COLUNA DIREITA (Perfil) --- */}
                <aside className="w-full md:w-1/3 bg-brand-green p-6 md:p-8 md:min-h-[calc(100vh-80px)] flex flex-col">

                    <div className="grid grid-cols-2 gap-4 items-center md:flex md:flex-col md:items-center md:text-center md:flex-1">

                        {/* 1. FOTO E NOME */}
                        <div className="flex flex-col items-center justify-center">
                            <div className="w-28 h-28 md:w-40 md:h-40 rounded-full border-4 border-white overflow-hidden shadow-lg mb-2 bg-white md:mt-8">
                                <img
                                    src={`https://ui-avatars.com/api/?name=${user?.nome_completo}&background=random&size=200`}
                                    alt="Perfil"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="bg-black text-white px-6 py-1 md:px-8 md:py-2 rounded-full font-black text-base md:text-xl shadow-md">
                                {firstName}
                            </div>
                        </div>

                        {/* 2. INFO, SALDO E BOTÃO */}
                        <div className="flex flex-col items-center justify-center md:w-full">
                            <p className="text-brand-dark font-medium mb-2 md:mb-8 text-sm md:text-base">@{userName}</p>

                            <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-12">
                                <span className="text-xl md:text-2xl border-4 border-brand-dark rounded-full w-8 h-8 md:w-12 md:h-12 flex items-center justify-center pt-0.5 font-bold text-brand-dark">B</span>
                                <span className="text-5xl md:text-6xl font-black text-brand-dark">{saldo}</span>
                            </div>

                            <button
                                onClick={() => navigate('/extrato')}
                                className="underline text-brand-dark font-bold hover:text-white transition md:mb-auto text-sm md:text-lg uppercase tracking-wide"
                            >
                                Ver Extrato
                            </button>
                        </div>

                        {/* 3. LOGOUT (Agora ocupa as 2 colunas no mobile para centralizar) */}
                        <div className="col-span-2 w-full mt-6 md:mt-auto flex justify-center">
                            <button
                                onClick={handleLogout}
                                className="text-brand-dark hover:text-red-700 transition p-2"
                                title="Sair do App"
                            >
                                <Power size={32} />
                            </button>
                        </div>

                    </div>
                </aside>
            </div>

            <Modal
                isOpen={!!selectedPacote}
                onClose={() => setSelectedPacote(null)}
            >
                {selectedPacote && (
                    <PacoteDetalhes
                        pacote={selectedPacote}
                        onClose={() => setSelectedPacote(null)}
                        onUpdate={() => window.location.reload()}
                    />
                )}
            </Modal>

        </div>
    );
};

export default ProfilePage;