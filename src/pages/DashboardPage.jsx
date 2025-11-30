import React from 'react';
import { Search } from 'lucide-react';
import Navbar from '../components/Navbar';
import DashboardHero from '../components/DashboardHero';
import InfoCard from '../components/InfoCard';

const DashboardPage = () => {
    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <Navbar />
            <DashboardHero />

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