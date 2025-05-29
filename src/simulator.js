/**
 * VOLTANEX - Simulador de Geração Solar
 * 
 * Este módulo simula a geração de energia solar para diferentes perfis
 * de instalação, considerando variações diárias e sazonais.
 */

require('dotenv').config({ path: '../config/.env' });
const cron = require('node-cron');

// Configurações padrão do simulador
const DEFAULT_INTERVAL = process.env.DEFAULT_SIMULATION_INTERVAL || 300000; // 5 minutos em ms

// Perfis de instalação solar
const INSTALLATION_PROFILES = {
  RESIDENTIAL_SMALL: {
    name: 'Residencial Pequeno',
    capacity: 3.5, // kWp
    efficiency: 0.78,
    area: 20, // m²
    location: 'São Paulo',
    coordinates: { lat: -23.5505, lng: -46.6333 }
  },
  RESIDENTIAL_MEDIUM: {
    name: 'Residencial Médio',
    capacity: 7.2, // kWp
    efficiency: 0.80,
    area: 40, // m²
    location: 'Rio de Janeiro',
    coordinates: { lat: -22.9068, lng: -43.1729 }
  },
  COMMERCIAL_SMALL: {
    name: 'Comercial Pequeno',
    capacity: 15.0, // kWp
    efficiency: 0.82,
    area: 85, // m²
    location: 'Belo Horizonte',
    coordinates: { lat: -19.9167, lng: -43.9345 }
  },
  COMMERCIAL_LARGE: {
    name: 'Comercial Grande',
    capacity: 75.0, // kWp
    efficiency: 0.85,
    area: 420, // m²
    location: 'Salvador',
    coordinates: { lat: -12.9714, lng: -38.5014 }
  }
};

/**
 * Classe Simulador de Geração Solar
 */
class SolarSimulator {
  constructor(profileType = 'RESIDENTIAL_SMALL', options = {}) {
    this.profile = INSTALLATION_PROFILES[profileType] || INSTALLATION_PROFILES.RESIDENTIAL_SMALL;
    this.deviceId = options.deviceId || `solar-${profileType}-${Date.now().toString(36)}`;
    this.interval = options.interval || DEFAULT_INTERVAL;
    this.listeners = [];
    this.isRunning = false;
    this.cronJob = null;
    this.lastReading = null;
  }

  /**
   * Simula a geração de energia solar com base no perfil, hora do dia e condições climáticas
   * @returns {Object} Dados de geração simulados
   */
  generateReading() {
    const now = new Date();
    const hour = now.getHours();
    const month = now.getMonth();
    
    // Fator de hora do dia (0-1)
    // Maior geração entre 10h e 15h, zero à noite
    let hourFactor = 0;
    if (hour >= 6 && hour <= 18) {
      // Curva em forma de sino centrada ao meio-dia
      hourFactor = Math.sin(Math.PI * (hour - 6) / 12);
    }
    
    // Fator sazonal (0.7-1.0)
    // Maior geração no verão, menor no inverno (hemisfério sul)
    const seasonFactor = 0.7 + 0.3 * Math.sin(Math.PI * (month - 3) / 6);
    
    // Fator de variabilidade climática (0.5-1.0)
    // Simula dias nublados, chuva, etc.
    const weatherFactor = 0.5 + (Math.random() * 0.5);
    
    // Cálculo da geração em kWh para o intervalo
    const intervalHours = this.interval / 3600000; // Converte ms para horas
    const maxPossibleGeneration = this.profile.capacity * intervalHours;
    
    // Geração final considerando todos os fatores
    const generation = maxPossibleGeneration * hourFactor * seasonFactor * weatherFactor * this.profile.efficiency;
    
    // Arredonda para 3 casas decimais para evitar números muito pequenos
    const roundedGeneration = Math.max(0, parseFloat(generation.toFixed(3)));
    
    // Cria o objeto de leitura
    const reading = {
      deviceId: this.deviceId,
      profileType: Object.keys(INSTALLATION_PROFILES).find(key => INSTALLATION_PROFILES[key] === this.profile),
      timestamp: now.toISOString(),
      location: this.profile.location,
      coordinates: this.profile.coordinates,
      kWh: roundedGeneration,
      factors: {
        hour: hourFactor.toFixed(2),
        season: seasonFactor.toFixed(2),
        weather: weatherFactor.toFixed(2),
        efficiency: this.profile.efficiency
      }
    };
    
    this.lastReading = reading;
    return reading;
  }

  /**
   * Inicia a simulação com intervalo regular
   */
  start() {
    if (this.isRunning) return;
    
    // Converte o intervalo em ms para expressão cron
    // Por padrão, a cada 5 minutos
    const minutes = Math.floor(this.interval / 60000);
    const cronExpression = minutes > 0 ? `*/${minutes} * * * *` : '* * * * *';
    
    this.cronJob = cron.schedule(cronExpression, () => {
      const reading = this.generateReading();
      this.notifyListeners(reading);
    });
    
    this.isRunning = true;
    console.log(`Simulador iniciado para ${this.profile.name} (${this.deviceId})`);
    
    // Gera uma leitura inicial imediatamente
    const initialReading = this.generateReading();
    this.notifyListeners(initialReading);
    
    return initialReading;
  }

  /**
   * Para a simulação
   */
  stop() {
    if (!this.isRunning) return;
    
    if (this.cronJob) {
      this.cronJob.stop();
      this.cronJob = null;
    }
    
    this.isRunning = false;
    console.log(`Simulador parado para ${this.profile.name} (${this.deviceId})`);
  }

  /**
   * Adiciona um listener para receber dados de geração
   * @param {Function} callback Função a ser chamada com os dados gerados
   */
  addListener(callback) {
    if (typeof callback === 'function') {
      this.listeners.push(callback);
    }
  }

  /**
   * Remove um listener
   * @param {Function} callback Função a ser removida
   */
  removeListener(callback) {
    this.listeners = this.listeners.filter(listener => listener !== callback);
  }

  /**
   * Notifica todos os listeners com os dados gerados
   * @param {Object} data Dados de geração
   */
  notifyListeners(data) {
    this.listeners.forEach(listener => {
      try {
        listener(data);
      } catch (error) {
        console.error('Erro ao notificar listener:', error);
      }
    });
  }

  /**
   * Obtém a última leitura gerada
   * @returns {Object} Última leitura ou null
   */
  getLastReading() {
    return this.lastReading;
  }

  /**
   * Obtém informações sobre o perfil atual
   * @returns {Object} Informações do perfil
   */
  getProfileInfo() {
    return {
      ...this.profile,
      deviceId: this.deviceId,
      interval: this.interval,
      isRunning: this.isRunning
    };
  }
}

module.exports = {
  SolarSimulator,
  INSTALLATION_PROFILES
};
