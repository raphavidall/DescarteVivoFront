import React, { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import Navbar from '../components/Navbar';
import DashboardHero from '../components/DashboardHero';
import PacoteCard from '../components/PacoteCard';
import api from '../services/api';
import Modal from '../components/Modal';
import DescartarForm from '../components/DescartarForm';
import PacoteDetalhes from '../components/PacoteDetalhes';

const MovimentarPage = () => {
  const [pacotes, setPacotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPacote, setSelectedPacote] = useState(null);

  // Buscar dados da API ao carregar a página
  async function fetchPacotes() {
    try {
      setLoading(true);
      const response = await api.get('/pacotes');
      setPacotes(response.data);
    } catch (error) {
      console.error("Erro ao buscar pacotes", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPacotes();
  }, []);

  const handleFormSuccess = () => {
    setIsModalOpen(false); // Fecha o modal
    fetchPacotes(); // Recarrega a lista para mostrar o novo pacote
  };

  // Filtragem local (Busca)
  const pacotesFiltrados = pacotes.filter(p => {
    const termo = busca.toLowerCase();
    const material = p.material?.nome?.toLowerCase() || "";
    // Se quiser buscar por bairro também, adicione aqui
    return material.includes(termo);
  });

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Navbar />
      
      {/* Banner com botão customizado "Descartar" */}
      <DashboardHero 
        customButton={
            <button 
                onClick={() => setIsModalOpen(true)} // <--- AÇÃO AQUI
                className="bg-black text-white font-black uppercase text-lg px-8 py-3 rounded-lg shadow-lg hover:bg-gray-800 transition"
            >
                Descartar um Pacote
            </button>
        }
      />

      {/* --- MODAL DE DESCARTE --- */}
      <Modal 
        isOpen={!!selectedPacote} // Abre se tiver um pacote selecionado
        onClose={() => setSelectedPacote(null)}
      >
        {selectedPacote && (
            <PacoteDetalhes 
                pacote={selectedPacote} 
                onClose={() => setSelectedPacote(null)}
                onUpdate={fetchPacotes} // Se o status mudar, recarrega a lista de fundo
            />
        )}
      </Modal>

      <main className="container mx-auto px-4 md:px-6">
        
        {/* Barra de Busca */}
        <div className="flex items-center gap-4 my-8">
            <h2 className="hidden md:block text-3xl font-black uppercase">Procurar</h2>
            <div className="flex-1 relative">
                <input 
                    type="text" 
                    placeholder="Busque por material (ex: plástico, metal)..."
                    className="w-full bg-white border border-gray-200 py-4 pl-8 pr-12 rounded-full shadow-sm outline-none focus:ring-2 focus:ring-black transition-all"
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                />
                <button className="absolute right-2 top-2 bg-black text-white p-2 rounded-full hover:bg-gray-800">
                    <Search size={20} />
                </button>
            </div>
        </div>

        {/* Conteúdo: Loading ou Grid */}
        {loading ? (
            <div className="text-center py-20 text-gray-500">
                Carregando pacotes disponíveis...
            </div>
        ) : (
            <>
                {pacotesFiltrados.length === 0 ? (
                    <div className="text-center py-20 text-gray-500">
                        Nenhum pacote encontrado. Que tal descartar o primeiro?
                    </div>
                ) : (
                    // Grid Responsivo (1 col mobile, 2 tablet, 4 desktop)
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
                        {pacotesFiltrados.map((pacote) => (
                          <PacoteCard 
                          key={pacote.id} 
                          pacote={pacote} 
                          onClick={() => setSelectedPacote(pacote)}
                          />
                        ))}
                    </div>
                )}
            </>
        )}

      </main>
    </div>
  );
};

export default MovimentarPage;