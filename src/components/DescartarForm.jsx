import React, { useState, useRef, useEffect } from 'react';
import { Upload, MapPin, Search, X } from 'lucide-react';
import api from '../services/api';
import { geocodingService } from '../services/geocoding';

const DescartarForm = ({ onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [loadingGeo, setLoadingGeo] = useState(false);
  const fileInputRef = useRef(null);

  const [materiaisOptions, setMateriaisOptions] = useState([]);

  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  const [addressQuery, setAddressQuery] = useState("");
  
  // Estado do Formulário
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    peso_kg: '',
    id_material: '',
    localizacao: null
  });

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
        const user = JSON.parse(userStr);
        // Se o usuário tiver um endereço salvo no perfil
        if (user.endereco && user.endereco.lat && user.endereco.lng) {
            setFormData(prev => ({ ...prev, localizacao: user.endereco }));
            if (user.endereco.enderecoCompleto) {
                setAddressQuery(user.endereco.enderecoCompleto);
            }
        }
    }

    // Busca Materiais da API
    async function fetchMateriais() {
      try {
          const response = await api.get('/materiais');
          setMateriaisOptions(response.data);
      } catch (error) {
          console.error("Erro ao buscar materiais:", error);
          alert("Não foi possível carregar a lista de materiais.");
      }
    }
    fetchMateriais();
  }, []);


  // --- FUNÇÕES DE IMAGEM ---
  const handleImageTrigger = () => fileInputRef.current.click();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      // Cria uma URL temporária para mostrar o preview
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = (e) => {
      e.stopPropagation(); // Evita abrir o seletor de novo
      setImageFile(null);
      setImagePreview(null);
      fileInputRef.current.value = ""; // Limpa o input
  }

  // --- FUNÇÕES DE LOCALIZAÇÃO ---

  // 1. GPS (Reverse Geocoding)
  const handleGetGPSLocation = () => {
    if ("geolocation" in navigator) {
      setLoadingGeo(true);
      navigator.geolocation.getCurrentPosition(async (position) => {
        try {
            const { latitude, longitude } = position.coords;
            const result = await geocodingService.reverse(latitude, longitude);
            
            setFormData(prev => ({ ...prev, localizacao: result }));
            setAddressQuery(result.enderecoCompleto); // Atualiza o input visual
        } catch (error) {
            alert("Erro ao buscar endereço pelo GPS.");
        } finally {
            setLoadingGeo(false);
        }
      }, (error) => {
        setLoadingGeo(false);
        alert("Erro ao obter localização GPS. Verifique as permissões.");
      });
    } else {
      alert("Geolocalização não suportada.");
    }
  };

  // 2. Busca por Texto (Forward Geocoding)
  const handleSearchAddress = async () => {
      if (!addressQuery || addressQuery.length < 5) {
          alert("Digite pelo menos o nome da rua para buscar.");
          return;
      }
      setLoadingGeo(true);
      try {
          const result = await geocodingService.search(addressQuery);
          if (result) {
              setFormData(prev => ({ ...prev, localizacao: result }));
              setAddressQuery(result.enderecoCompleto); // Atualiza com o endereço formatado bonito
          } else {
              alert("Endereço não encontrado. Tente ser mais específico.");
              setFormData(prev => ({ ...prev, localizacao: null }));
          }
      } catch (error) {
          alert("Erro na busca de endereço.");
      } finally {
          setLoadingGeo(false);
      }
  };


  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- ENVIO DO FORMULÁRIO (Com FormData) ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validações básicas
    if (!formData.id_material || !formData.peso_kg || !formData.titulo) {
      alert("Preencha os campos obrigatórios: Título, Material e Peso.");
      return;
    }
    if (!formData.localizacao) {
        alert("Por favor, defina a localização do pacote.");
        return;
    }

    try {
      setLoading(true);
      // CRIA O FORMDATA (Necessário para enviar arquivos)
      const dataToSend = new FormData();
      dataToSend.append("titulo", formData.titulo);
      dataToSend.append("descricao", formData.descricao);
      dataToSend.append("peso_kg", formData.peso_kg);
      dataToSend.append("id_material", formData.id_material);
      
      // Localização vai como string JSON
      dataToSend.append("localizacao", JSON.stringify(formData.localizacao));
      
      if (imageFile) {
          dataToSend.append("imagem", imageFile, imageFile.name);
      }

      await api.post('/pacotes', dataToSend);
      
      alert("Pacote descartado com sucesso!");
      onSuccess();

    } catch (error) {
      console.error(error);
      alert("Erro ao descartar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  // Estilos comuns
  const labelStyle = "block font-black text-lg mb-2 mt-4";
  const inputStyle = "w-full bg-brand-gray/50 p-4 rounded-xl outline-none focus:ring-2 focus:ring-black resize-none";
  const tagStyle = "bg-black text-white font-bold px-4 py-2 rounded-lg text-sm uppercase inline-block mr-2 mb-2 cursor-pointer";

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* --- COLUNA ESQUERDA (Imagem placeholder) --- */}
        {/* --- ÁREA DA IMAGEM (Clicável) --- */}
        <div 
            onClick={handleImageTrigger}
            className={`w-full lg:w-5/12 bg-[#F5F5F5] rounded-2xl h-64 lg:h-auto flex flex-col items-center justify-center text-gray-400 border-2 border-dashed ${imagePreview ? 'border-black' : 'border-gray-300'} hover:bg-gray-200 transition cursor-pointer relative overflow-hidden`}
        >
            {/* Input invisível */}
            <input 
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                accept="image/*"
                className="hidden"
            />

            {imagePreview ? (
                <>
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    {/* Botão para remover imagem */}
                    <button type="button" onClick={handleRemoveImage} className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full hover:bg-black">
                        <X size={20} />
                    </button>
                </>
            ) : (
                <>
                    <Upload size={48} className="mb-4" />
                    <span className="text-center px-4 font-medium">
                        Clique para inserir <br/>uma imagem do material
                    </span>
                </>
            )}
        </div>

        {/* --- COLUNA DIREITA (Campos) --- */}
        <div className="w-full lg:w-7/12 space-y-4">
            
            {/* Campo TÍTULO (Tag preta no seu design) */}
            <div>
                <div className="bg-black text-white font-black px-6 py-2 rounded-t-lg inline-block uppercase tracking-wide">
                    Nome do Pacote
                </div>
                <input 
                    name="titulo"
                    type="text"
                    value={formData.titulo}
                    placeholder="Digite o nome do pacote (Ex: Garrafas PET limpas)"
                    className="w-full bg-white p-4 rounded-b-xl rounded-tr-xl font-medium outline-none focus:ring-2 focus:ring-black shadow-sm"
                    onChange={handleChange}
                    required
                />
            </div>

            {/* Campo LOCALIZAÇÃO */}
            <div>
                 <label className={labelStyle}>Localização</label>
                 
                 {/* Barra de Busca + Botão GPS */}
                 <div className="flex gap-2 relative">
                     <input 
                        type="text"
                        placeholder="Digite rua e número ou use o GPS..."
                        className={inputStyle + " pl-12"} // Espaço para o ícone
                        value={addressQuery}
                        onChange={(e) => setAddressQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && e.preventDefault() & handleSearchAddress()} // Busca ao dar Enter
                     />
                     {/* Ícone de Lupa/Pin dentro do input */}
                     <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                         {formData.localizacao ? <MapPin className="text-brand-green" /> : <Search />}
                     </div>
                    
                     {/* Botão de Buscar Texto */}
                     <button type="button" onClick={handleSearchAddress} className="bg-gray-200 p-4 rounded-xl hover:bg-gray-300 transition">
                        {loadingGeo ? "..." : <Search size={24} />}
                     </button>

                     {/* Botão de GPS */}
                     <button type="button" onClick={handleGetGPSLocation} className="bg-brand-green text-white p-4 rounded-xl hover:brightness-110 transition flex items-center gap-2 font-bold whitespace-nowrap" title="Usar localização atual">
                         <MapPin size={24} />
                         <span className="hidden sm:inline">Usar GPS</span>
                     </button>
                 </div>
                 
                 {/* Mostra o Bairro confirmado se houver */}
                 {formData.localizacao && (
                     <p className="text-sm text-gray-600 mt-2 flex items-center gap-1">
                        <MapPin size={14} className="text-brand-green" />
                        Local definido: <strong>{formData.localizacao.bairro}</strong>
                     </p>
                 )}
            </div>

            {/* Flex para Material e Peso */}
            <div className="flex gap-4">
                {/* Campo MATERIAL (Select) */}
                <div className="flex-1">
                    <label className={labelStyle}>Tipo de Material</label>
                    <select name="id_material" className={inputStyle} onChange={handleChange} required>
                        <option value="">Selecione...</option>
                        {materiaisOptions.map(m => (
                            <option key={m.id} value={m.id}>{m.nome}</option>
                        ))}
                    </select>
                </div>
                
                 {/* Campo PESO (Number) */}
                <div className="w-1/3">
                    <label className={labelStyle}>Peso (Kg)</label>
                    <input name="peso_kg" type="number" step="0.1" min="0.1" placeholder="0.0" className={inputStyle} onChange={handleChange} required />
                </div>
            </div>

        </div>
      </div>

      {/* --- DESCRIÇÃO (Abaixo das colunas) --- */}
      <div className="mt-8">
        <label className="font-black text-2xl uppercase block mb-4">Descrição</label>
        <textarea 
            name="descricao"
            rows={4}
            placeholder="Descreva os detalhes do material, estado de conservação, etc."
            className={inputStyle + " h-32"}
            onChange={handleChange}
        ></textarea>
      </div>

      {/* --- BOTÃO DESCARTAR --- */}
      <div className="mt-8 text-right">
        <button 
            type="submit" 
            disabled={loading}
            className="bg-black text-white font-black uppercase text-xl px-12 py-4 rounded-xl shadow-lg hover:bg-gray-800 transition-transform active:scale-95 disabled:opacity-50"
        >
            {loading ? "Processando..." : "Descartar"}
        </button>
      </div>
    </form>
  );
};

export default DescartarForm;