import React, { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import Navbar from '../components/Navbar';
import DashboardHero from '../components/DashboardHero';
import InfoCard from '../components/InfoCard';
import Onboarding from '../components/Onboarding';
import WelcomeModal from '../components/WelcomeModal';
import api from '../services/api';

const tutorialSteps = [
    {
        targetId: null,
        title: "Bem-vindo ao Descarte Vivo Fortaleza!",
        content: "Eu sou o Calu! Talvez você tenha algumas dúvidas, então vou resumir o que você pode fazer aqui: Você pode descartar e coletar pacotes, usar seu saldo na nossa loja e muito mais."
    },
    {
        targetId: 'nav-novidades',
        title: "Novidades",
        content: "Aqui você encontra conteúdos, eventos e projetos que lhe ajudarão a aprender mais sobre Descartar com intenção e Destinar com propósito."
    },
    {
        targetId: 'nav-movimentar',
        title: "Movimentar",
        content: "Aqui você encontra pacotes de materiais reaproveitáveis descartados por outras pessoas. Você pode descartar um novo pacote ou solicitar uma coleta."
    },
    {
        targetId: 'nav-loja',
        title: "Loja",
        content: "Aqui você pode conhecer trabalhos e serviços incríveis que são gerados a partir de materiais reaproveitados e estão disponíveis para compra com seu saldo."
    },
    {
        targetId: 'nav-notificacoes',
        title: "Notificações",
        content: "Aqui você visualiza todas as ações que precisam da sua atenção. Fique atento as solicitações de coleta para garantir uma boa experiência."
    },
    {
        targetId: 'nav-perfil',
        title: "Perfil",
        content: "Aqui você pode ver seu saldo, seu extrato de transações, sua rede de amigos e o histórico dos seus pacotes movimentados."
    }
];

const DashboardPage = () => {
    const [showTutorial, setShowTutorial] = useState(false);
    const [showWelcomeReward, setShowWelcomeReward] = useState(false); // <--- Novo Estado
    const [userData, setUserData] = useState(null);

    // Efeito Inicial (Busca dados do usuário no Backend)
    useEffect(() => {
        const initDashboard = async () => {
            try {
                // 1. Pega usuário do cache (rápido)
                const localUser = JSON.parse(localStorage.getItem('user'));
                
                if (!localUser || !localUser.id) return;
  
                // 2. Verifica se JÁ VIMOS o tutorial nesta sessão (Bloqueio Imediato)
                const sessionSeen = sessionStorage.getItem('tutorial_completed');
                
                if (sessionSeen === 'true') {
                    // Se já viu na sessão, só verifica se falta o prêmio
                    const res = await api.get(`/usuarios/${localUser.id}`);
                    if (!res.data.premio_recebido) {
                        setShowWelcomeReward(true);
                    }
                    return; // Para por aqui, não abre tutorial
                }
  
                // 3. Se não viu na sessão, consulta o banco
                const res = await api.get(`/usuarios/${localUser.id}`);
                setUserData(res.data);
  
                console.log("Status Tutorial Banco:", res.data.tutorial_visto);
  
                if (!res.data.tutorial_visto) {
                    setShowTutorial(true);
                } else if (!res.data.premio_recebido) {
                    setShowWelcomeReward(true);
                }
  
            } catch (err) {
                console.error("Erro ao iniciar dashboard:", err);
            }
        };
  
        initDashboard();
    }, []);
  
    // Função robusta para salvar no banco
    const saveProgress = async () => {
        // 1. Marca na SESSÃO (Para não aparecer de novo se o usuário der F5 ou voltar)
        sessionStorage.setItem('tutorial_completed', 'true');
  
        // 2. Marca no BANCO
        try {
            const localUser = JSON.parse(localStorage.getItem('user'));
            if (localUser?.id) {
                await api.put(`/usuarios/${localUser.id}/tutorial-visto`);
                console.log("Tutorial marcado como visto no banco com sucesso.");
            }
        } catch (err) {
            console.error("Falha ao salvar progresso no banco:", err);
        }
    };
  
    const finishTutorial = () => {
        setShowTutorial(false);
        saveProgress(); // Salva que viu
        
        // Se ainda não tinha recebido o prêmio (conforme carga inicial), mostra agora
        if (userData && !userData.premio_recebido) {
            setShowWelcomeReward(true);
        }
    };
  
    const finishReward = () => {
        setShowWelcomeReward(false);
        saveProgress(); // Garante que salva tudo
        // Opcional: Recarregar a página para atualizar o saldo na Navbar
        // window.location.reload(); 
    };
  
    // Botão "Conheça a Descarte Vivo" (Rever)
    const handleReplayTutorial = () => {
        setShowTutorial(true);
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <Navbar />
            <DashboardHero
                customButton={
                    <button
                        onClick={handleReplayTutorial}
                        className="bg-brand-green text-white font-black uppercase text-lg px-8 py-3 rounded-lg shadow-lg hover:brightness-110 transition animate-pulsar"
                    >
                        Conheça a Descarte Vivo
                    </button>
                }
            />

            {/* 1. ONBOARDING (Prioridade 1) */}
            {showTutorial && (
                <Onboarding
                    steps={tutorialSteps}
                    onFinish={finishTutorial}
                    onSkip={finishTutorial}
                />
            )}

            {/* 2. RECOMPENSA (Prioridade 2 - Só aparece se tutorial não estiver na tela) */}
            {!showTutorial && showWelcomeReward && (
                <WelcomeModal onClose={finishReward} />
            )}

            <main className="container mx-auto px-4 md:px-6">

                {/* Barra de Busca */}
                <div className="flex items-center gap-4 my-8">
                    <h2 className="text-3xl font-black uppercase">Procurar</h2>
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            placeholder="Um amigo, um pacote, uma empresa, ou uma categoria..."
                            className="w-full bg-white border border-gray-200 py-4 pl-8 pr-12 rounded-full shadow-sm outline-none focus:ring-2 focus:ring-black"
                        />
                        <button className="absolute right-2 top-2 bg-black text-white p-2 rounded-full hover:bg-gray-800">
                            <Search size={20} />
                        </button>
                    </div>
                </div>

                {/* Grid de Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <InfoCard
                        category="Jogo"
                        title="Ganhe Moedas Aprendendo Mais Sobre Descarte Correto com o Re-Ciclo!"
                        imageColor="bg-yellow-300"
                    />
                    <InfoCard
                        category="Interação"
                        title="Ganhe Moedas Descartando, Coletando ou Destinando Pacotes."
                        imageColor="bg-orange-400"
                    />
                    <InfoCard
                        category="Leitura"
                        title="Aprenda Mais Sobre Descarte Correto com o Re-Ciclo!"
                        imageColor="bg-green-600"
                    />
                    <InfoCard
                        category="Notícias"
                        title="Aprenda Mais Sobre Descarte Correto com o Re-Ciclo!"
                        imageColor="bg-yellow-500"
                    />
                </div>

            </main>
        </div>
    );
};

export default DashboardPage;