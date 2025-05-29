/**
 * VOLTANEX - Cliente da API ElectricityMap
 * 
 * Este módulo implementa a integração com a API do ElectricityMap
 * para obter dados de intensidade de carbono da rede elétrica.
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../config/.env') });
const axios = require('axios');

// Configurações da API
const API_KEY = process.env.ELECTRICITY_MAP_API_KEY;
const BASE_URL = 'https://api.electricitymap.org/v3';

/**
 * Classe Cliente ElectricityMap
 */
class ElectricityMapClient {
  constructor() {
    this.apiKey = API_KEY;
    this.baseUrl = BASE_URL;
    this.lastResponse = null;
    
    // Verifica se a chave API está configurada
    if (!this.apiKey) {
      console.warn('ElectricityMap API Key não configurada. Algumas funcionalidades podem não estar disponíveis.');
    }
  }

  /**
   * Configura o cliente HTTP com headers de autenticação
   * @returns {Object} Cliente HTTP configurado
   */
  getHttpClient() {
    return axios.create({
      baseURL: this.baseUrl,
      headers: {
        'auth-token': this.apiKey,
        'Content-Type': 'application/json'
      }
    });
  }

  /**
   * Obtém a intensidade de carbono para uma localização específica
   * @param {Object} coordinates Coordenadas {lat, lng}
   * @returns {Promise<Object>} Dados de intensidade de carbono
   */
  async getCarbonIntensity(coordinates) {
    try {
      if (!this.apiKey) {
        throw new Error('API Key não configurada');
      }
      
      if (!coordinates || !coordinates.lat || !coordinates.lng) {
        throw new Error('Coordenadas inválidas');
      }
      
      const client = this.getHttpClient();
      const response = await client.get('/carbon-intensity/latest', {
        params: {
          lat: coordinates.lat,
          lon: coordinates.lng
        }
      });
      
      this.lastResponse = response.data;
      return response.data;
    } catch (error) {
      console.error('Erro ao obter intensidade de carbono:', error.message);
      
      // Retorna um valor padrão em caso de erro
      return {
        status: 'error',
        error: error.message,
        fallback: true,
        carbonIntensity: 300, // Valor médio aproximado para o Brasil em gCO2eq/kWh
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Obtém o fator de emissão marginal para uma localização
   * @param {Object} coordinates Coordenadas {lat, lng}
   * @returns {Promise<Object>} Dados de fator de emissão marginal
   */
  async getMarginalEmissionFactor(coordinates) {
    try {
      if (!this.apiKey) {
        throw new Error('API Key não configurada');
      }
      
      if (!coordinates || !coordinates.lat || !coordinates.lng) {
        throw new Error('Coordenadas inválidas');
      }
      
      const client = this.getHttpClient();
      const response = await client.get('/marginal-carbon-intensity/latest', {
        params: {
          lat: coordinates.lat,
          lon: coordinates.lng
        }
      });
      
      this.lastResponse = response.data;
      return response.data;
    } catch (error) {
      console.error('Erro ao obter fator de emissão marginal:', error.message);
      
      // Retorna um valor padrão em caso de erro
      return {
        status: 'error',
        error: error.message,
        fallback: true,
        marginalCarbonIntensity: 500, // Valor aproximado para o Brasil em gCO2eq/kWh
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Converte intensidade de carbono para fator de emissão
   * @param {Number} carbonIntensity Intensidade de carbono em gCO2eq/kWh
   * @returns {Number} Fator de emissão em kgCO2eq/kWh
   */
  convertToEmissionFactor(carbonIntensity) {
    // Converte de gCO2eq/kWh para kgCO2eq/kWh
    return carbonIntensity / 1000;
  }

  /**
   * Testa a conexão com a API
   * @returns {Promise<Boolean>} Verdadeiro se a conexão for bem-sucedida
   */
  async testConnection() {
    try {
      // Coordenadas de São Paulo como teste
      const testCoordinates = { lat: -23.5505, lng: -46.6333 };
      const response = await this.getCarbonIntensity(testCoordinates);
      
      return !response.fallback && !response.error;
    } catch (error) {
      console.error('Erro ao testar conexão com ElectricityMap:', error);
      return false;
    }
  }

  /**
   * Obtém o último resultado da API
   * @returns {Object} Último resultado ou null
   */
  getLastResponse() {
    return this.lastResponse;
  }
}

module.exports = new ElectricityMapClient();
