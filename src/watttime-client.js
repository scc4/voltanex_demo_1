/**
 * VOLTANEX - Cliente da API WattTime
 * 
 * Este módulo implementa a integração com a API do WattTime
 * para obter dados de emissões marginais da rede elétrica.
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../config/.env') });
const axios = require('axios');

// Configurações da API
const USERNAME = process.env.WATTTIME_USERNAME;
const PASSWORD = process.env.WATTTIME_PASSWORD;
const BASE_URL = 'https://api2.watttime.org/v2';

/**
 * Classe Cliente WattTime
 */
class WattTimeClient {
  constructor() {
    this.username = USERNAME;
    this.password = PASSWORD;
    this.baseUrl = BASE_URL;
    this.token = null;
    this.tokenExpiry = null;
    this.lastResponse = null;
    
    // Verifica se as credenciais estão configuradas
    if (!this.username || !this.password) {
      console.warn('Credenciais WattTime não configuradas. Algumas funcionalidades podem não estar disponíveis.');
    }
  }

  /**
   * Obtém um token de autenticação
   * @returns {Promise<String>} Token de autenticação
   */
  async getAuthToken() {
    try {
      // Verifica se já tem um token válido
      if (this.token && this.tokenExpiry && new Date() < this.tokenExpiry) {
        return this.token;
      }
      
      // Faz a requisição de login
      const response = await axios.get(`${this.baseUrl}/login`, {
        auth: {
          username: this.username,
          password: this.password
        }
      });
      
      // Armazena o token e define a expiração (30 minutos)
      this.token = response.data.token;
      const expiryDate = new Date();
      expiryDate.setMinutes(expiryDate.getMinutes() + 25); // 25 minutos para margem de segurança
      this.tokenExpiry = expiryDate;
      
      console.log('Token WattTime obtido com sucesso. Válido até:', expiryDate.toISOString());
      return this.token;
    } catch (error) {
      console.error('Erro ao obter token WattTime:', error.message);
      throw new Error(`Falha na autenticação WattTime: ${error.message}`);
    }
  }

  /**
   * Configura o cliente HTTP com headers de autenticação
   * @returns {Promise<Object>} Cliente HTTP configurado
   */
  async getHttpClient() {
    const token = await this.getAuthToken();
    
    return axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
  }

  /**
   * Obtém a região da balancing authority para uma localização
   * @param {Object} coordinates Coordenadas {lat, lng}
   * @returns {Promise<Object>} Dados da região
   */
  async getRegion(coordinates) {
    try {
      if (!coordinates || !coordinates.lat || !coordinates.lng) {
        throw new Error('Coordenadas inválidas');
      }
      
      const client = await this.getHttpClient();
      const response = await client.get('/ba-from-loc', {
        params: {
          latitude: coordinates.lat,
          longitude: coordinates.lng
        }
      });
      
      this.lastResponse = response.data;
      return response.data;
    } catch (error) {
      console.error('Erro ao obter região WattTime:', error.message);
      
      // Retorna um valor padrão para o Brasil em caso de erro
      return {
        status: 'error',
        error: error.message,
        fallback: true,
        ba: 'BR-CS', // Valor aproximado para o sistema interligado central/sul do Brasil
        name: 'Brazil Central-South Grid',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Obtém o índice de emissão marginal para uma região
   * @param {String} balancingAuthority Código da balancing authority (ex: 'BR-CS')
   * @returns {Promise<Object>} Dados do índice de emissão marginal
   */
  async getMarginalEmissionsIndex(balancingAuthority) {
    try {
      if (!balancingAuthority) {
        throw new Error('Balancing Authority não especificada');
      }
      
      const client = await this.getHttpClient();
      const response = await client.get('/index', {
        params: {
          ba: balancingAuthority
        }
      });
      
      this.lastResponse = response.data;
      return response.data;
    } catch (error) {
      console.error('Erro ao obter índice de emissões marginais:', error.message);
      
      // Retorna um valor padrão em caso de erro
      return {
        status: 'error',
        error: error.message,
        fallback: true,
        percent: 50, // Valor médio aproximado
        ba: balancingAuthority,
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
      // Primeiro obtém a região
      const region = await this.getRegion(coordinates);
      
      if (region.fallback) {
        throw new Error('Não foi possível determinar a região');
      }
      
      // Depois obtém o índice de emissão marginal
      const emissionsIndex = await this.getMarginalEmissionsIndex(region.ba);
      
      // Combina os resultados
      return {
        ...emissionsIndex,
        region: region,
        coordinates: coordinates
      };
    } catch (error) {
      console.error('Erro ao obter fator de emissão marginal:', error.message);
      
      // Retorna um valor padrão em caso de erro
      return {
        status: 'error',
        error: error.message,
        fallback: true,
        percent: 50,
        ba: 'BR-CS',
        coordinates: coordinates,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Converte o índice percentual para um fator de emissão
   * @param {Number} percent Índice percentual (0-100)
   * @returns {Number} Fator de emissão estimado em kgCO2eq/kWh
   */
  convertPercentToEmissionFactor(percent) {
    // Mapeia o percentual (0-100) para um fator de emissão (0.2-1.5 kgCO2eq/kWh)
    // Esta é uma aproximação simplificada para a Demo 1
    const minFactor = 0.2;
    const maxFactor = 1.5;
    return minFactor + (percent / 100) * (maxFactor - minFactor);
  }

  /**
   * Testa a conexão com a API
   * @returns {Promise<Boolean>} Verdadeiro se a conexão for bem-sucedida
   */
  async testConnection() {
    try {
      // Tenta obter um token de autenticação
      await this.getAuthToken();
      
      // Coordenadas de São Paulo como teste
      const testCoordinates = { lat: -23.5505, lng: -46.6333 };
      const region = await this.getRegion(testCoordinates);
      
      return !region.fallback && !region.error;
    } catch (error) {
      console.error('Erro ao testar conexão com WattTime:', error);
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

module.exports = new WattTimeClient();
