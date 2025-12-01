import axios from 'axios';

const NOMINATIM_API = "https://nominatim.openstreetmap.org";

export const geocodingService = {
  // REVERSA: Coordenadas -> Endereço (Botão GPS)
  reverse: async (lat, lng) => {
    try {
      const response = await axios.get(`${NOMINATIM_API}/reverse`, {
        params: {
          format: 'json',
          lat,
          lon: lng,
          addressdetails: 1,
          'accept-language': 'pt-BR' // Força resultados em português
        }
      });
      
      return formatarEnderecoOSM(response.data);
    } catch (error) {
      console.error("Erro no reverse geocoding:", error);
      throw error;
    }
  },

  // FORWARD: Texto -> Endereço (Campo de Busca)
  search: async (query) => {
    try {
      const response = await axios.get(`${NOMINATIM_API}/search`, {
        params: {
          format: 'json',
          q: query + ", Fortaleza, Brasil",
          addressdetails: 1,
          limit: 1, // Pega só o melhor resultado
          'accept-language': 'pt-BR'
        }
      });

      if (response.data && response.data.length > 0) {
          return formatarEnderecoOSM(response.data[0]);
      }
      return null;
    } catch (error) {
        console.error("Erro na busca de endereço:", error);
        throw error;
    }
  }
};

// Função auxiliar para limpar a bagunça que vem do OpenStreetMap
function formatarEnderecoOSM(data) {
    const addr = data.address;
    
    // Tenta achar o bairro em vários campos possíveis
    const bairro = addr.suburb || addr.neighbourhood || addr.quarter || addr.city_district || "Bairro não identificado";
    const rua = addr.road || addr.pedestrian || addr.street || "";
    const numero = addr.house_number || "";
    const cidade = addr.city || addr.town || addr.municipality || "Fortaleza";

    // Monta um endereço legível
    const enderecoCompleto = `${rua}, ${numero} - ${bairro}, ${cidade}`;

    return {
        lat: parseFloat(data.lat),
        lng: parseFloat(data.lon),
        bairro: bairro,
        enderecoCompleto: enderecoCompleto,
        // Salvando dados brutos caso precise depois
        rua, numero, cidade, uf: addr.state
    };
}