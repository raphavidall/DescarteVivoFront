import React, { useEffect, useState } from 'react';
import { Search, Filter, X } from 'lucide-react'; // Adicione Filter e X
import Navbar from '../components/Navbar';
import DashboardHero from '../components/DashboardHero';
import PacoteCard from '../components/PacoteCard';
import api from '../services/api';
import Modal from '../components/Modal';
import DescartarForm from '../components/DescartarForm';
import PacoteDetalhes from '../components/PacoteDetalhes';
import { PACOTE_STATUS } from '../utils/constants';

const MovimentarPage = () => {
  const [pacotes, setPacotes] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Estados de Busca e Filtro
  const [busca, setBusca] = useState("");
  const [showFilters, setShowFilters] = useState(false); // Abre/Fecha menu
  const [materiaisOptions, setMateriaisOptions] = useState([]); // Para o dropdown

  // Filtros Selecionados
  const [filtroColeta, setFiltroColeta] = useState(false); // Apenas Oportunidades
  const [filtroCompra, setFiltroCompra] = useState(false); // Apenas Disponíveis
  const [filtroMaterialId, setFiltroMaterialId] = useState(""); // ID específico

  // Estados dos Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPacote, setSelectedPacote] = useState(null);

  // 1. Carregar Dados Iniciais
  async function fetchData() {
    try {
      setLoading(true);
      const [resPacotes, resMateriais] = await Promise.all([
          api.get('/pacotes'),
          api.get('/materiais')
      ]);
      setPacotes(resPacotes.data);
      setMateriaisOptions(resMateriais.data);
    } catch (error) {
      console.error("Erro ao buscar dados", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  const handleFormSuccess = () => {
    setIsModalOpen(false);
    fetchData();
  };

  // --- LÓGICA DE FILTRAGEM AVANÇADA ---

  // Função auxiliar: Remove acentos e deixa minúsculo
  // Ex: "Atenção" -> "atencao"
  const normalizeText = (text) => {
      if (!text) return "";
      return text
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
  };

  const pacotesFiltrados = pacotes.filter(p => {
    // 1. Filtro de Texto (Flexível)
    const termo = normalizeText(busca);
    const textoMatch = 
        normalizeText(p.titulo).includes(termo) ||
        normalizeText(p.descricao).includes(termo) ||
        normalizeText(p.material?.nome).includes(termo) ||
        normalizeText(p.localizacao?.bairro).includes(termo) ||
        normalizeText(p.localizacao?.cidade).includes(termo);

    if (!textoMatch) return false;

    // 2. Filtro de Status (Cumulativo)
    // Se nenhum checkbox estiver marcado, mostra tudo.
    // Se algum estiver marcado, o pacote tem que bater com um deles.
    if (filtroColeta || filtroCompra) {
        const isColeta = p.status === PACOTE_STATUS.A_COLETAR;
        const isCompra = p.status === PACOTE_STATUS.DISPONIVEL;
        
        const matchColeta = filtroColeta && isColeta;
        const matchCompra = filtroCompra && isCompra;

        if (!matchColeta && !matchCompra) return false;
    }

    // 3. Filtro de Material Específico
    if (filtroMaterialId && p.id_material !== Number(filtroMaterialId)) {
        return false;
    }

    return true;
  });

  // Função para limpar filtros
  const clearFilters = () => {
      setFiltroColeta(false);
      setFiltroCompra(false);
      setFiltroMaterialId("");
      setBusca("");
      setShowFilters(false);
  };

  const activeFiltersCount = (filtroColeta ? 1 : 0) + (filtroCompra ? 1 : 0) + (filtroMaterialId ? 1 : 0);

  return (
    <div className="min-h-screen bg-gray-50 pb-20 relative" onClick={() => setShowFilters(false)}>
      <Navbar />
      
      <DashboardHero 
        customButton={
            <button 
                onClick={() => setIsModalOpen(true)}
                className="bg-black text-white font-black uppercase text-lg px-8 py-3 rounded-lg shadow-lg hover:bg-gray-800 transition z-10 relative"
            >
                Descartar um Pacote
            </button>
        }
      />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Novo Descarte">
        <DescartarForm onSuccess={handleFormSuccess} />
      </Modal>

      <Modal isOpen={!!selectedPacote} onClose={() => setSelectedPacote(null)}>
        {selectedPacote && (
            <PacoteDetalhes 
                pacote={selectedPacote} 
                onClose={() => setSelectedPacote(null)}
                onUpdate={fetchData} 
            />
        )}
      </Modal>

      <main className="container mx-auto px-4 md:px-6">
        
        {/* --- BARRA DE BUSCA E FILTROS --- */}
        <div className="flex flex-col md:flex-row items-center gap-4 my-8 relative z-30">
            
            <h2 className="hidden md:block text-3xl font-black uppercase whitespace-nowrap">Procurar</h2>
            
            <div className="flex-1 w-full relative flex gap-2">
                {/* Input de Busca */}
                <div className="relative flex-1">
                    <input 
                        type="text" 
                        placeholder="Busque por título, material, bairro..."
                        className="w-full bg-white border border-gray-200 py-4 pl-12 pr-4 rounded-xl shadow-sm outline-none focus:ring-2 focus:ring-black transition-all"
                        value={busca}
                        onChange={(e) => setBusca(e.target.value)}
                    />
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                </div>

                {/* Botão de Filtro */}
                <div className="relative" onClick={e => e.stopPropagation()}>
                    <button 
                        onClick={() => setShowFilters(!showFilters)}
                        className={`h-full px-4 rounded-xl shadow-sm border border-gray-200 flex items-center gap-2 transition-all ${showFilters || activeFiltersCount > 0 ? 'bg-black text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
                    >
                        <Filter size={20} />
                        <span className="hidden md:inline font-bold">Filtros</span>
                        {activeFiltersCount > 0 && (
                            <span className="bg-brand-green text-black text-xs font-black w-5 h-5 rounded-full flex items-center justify-center">
                                {activeFiltersCount}
                            </span>
                        )}
                    </button>

                    {/* --- DROPDOWN DE FILTROS --- */}
                    {showFilters && (
                        <div className="absolute top-full right-0 mt-2 w-72 bg-white rounded-xl shadow-2xl border border-gray-100 p-5 animate-fade-in z-50">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-black uppercase text-lg">Filtrar Por</h3>
                                <button onClick={clearFilters} className="text-xs text-gray-500 underline hover:text-red-500">
                                    Limpar tudo
                                </button>
                            </div>

                            {/* Checkboxes de Status */}
                            <div className="space-y-3 mb-6">
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${filtroColeta ? 'bg-brand-green border-brand-green' : 'border-gray-300'}`}>
                                        {filtroColeta && <span className="text-white font-bold text-xs">✓</span>}
                                    </div>
                                    <input type="checkbox" className="hidden" checked={filtroColeta} onChange={() => setFiltroColeta(!filtroColeta)} />
                                    <span className="text-sm font-medium group-hover:text-brand-green transition">Oportunidades de Coleta</span>
                                </label>

                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${filtroCompra ? 'bg-black border-black' : 'border-gray-300'}`}>
                                        {filtroCompra && <span className="text-white font-bold text-xs">✓</span>}
                                    </div>
                                    <input type="checkbox" className="hidden" checked={filtroCompra} onChange={() => setFiltroCompra(!filtroCompra)} />
                                    <span className="text-sm font-medium group-hover:text-black transition">Disponíveis para Compra</span>
                                </label>
                            </div>

                            {/* Select de Material */}
                            <div className="mb-2">
                                <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Tipo de Material</label>
                                <select 
                                    value={filtroMaterialId}
                                    onChange={(e) => setFiltroMaterialId(e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-200 p-3 rounded-lg text-sm outline-none focus:border-black"
                                >
                                    <option value="">Todos os materiais</option>
                                    {materiaisOptions.map(m => (
                                        <option key={m.id} value={m.id}>{m.nome}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>

        {/* Lista de Pacotes */}
        {loading ? (
            <div className="text-center py-20 text-gray-500">Carregando...</div>
        ) : (
            <>
                {pacotesFiltrados.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
                        <p className="text-gray-500 text-lg font-medium">Nenhum pacote encontrado com esses filtros.</p>
                        <button onClick={clearFilters} className="text-black font-bold underline mt-2">Limpar busca</button>
                    </div>
                ) : (
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