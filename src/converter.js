/**
 * VOLTANEX - Conversor de kWh para Créditos de Carbono
 * 
 * Este módulo implementa a lógica de conversão de energia gerada (kWh)
 * para créditos de carbono (kg CO₂) e integra com o ledger VOLTANEX.
 */

require('dotenv').config({ path: '../config/.env' });
const ledger = require('./ledger');

// Fator de emissão padrão (1 kWh = 1 kg CO₂)
const DEFAULT_EMISSION_FACTOR = parseFloat(process.env.DEFAULT_EMISSION_FACTOR) || 1.0;

/**
 * Classe Conversor de Créditos de Carbono
 */
class CarbonCreditConverter {
  constructor(options = {}) {
    this.emissionFactor = options.emissionFactor || DEFAULT_EMISSION_FACTOR;
    this.ledger = ledger;
  }

  /**
   * Converte kWh para créditos de carbono (kg CO₂)
   * @param {Number} kWh Energia gerada em kWh
   * @returns {Number} Créditos de carbono em kg CO₂
   */
  convertToCredits(kWh) {
    if (typeof kWh !== 'number' || isNaN(kWh) || kWh < 0) {
      throw new Error('Valor de kWh inválido');
    }
    
    // Aplicação do fator de emissão
    const carbonCredits = kWh * this.emissionFactor;
    
    // Arredonda para 3 casas decimais
    return parseFloat(carbonCredits.toFixed(3));
  }

  /**
   * Processa uma leitura de geração e registra no ledger
   * @param {Object} reading Leitura de geração solar
   * @returns {Object} Registro criado no ledger
   */
  processReading(reading) {
   if (!reading || typeof reading.kWh !== 'number' || !reading.deviceId) {
  throw new Error('Leitura inválida');
}
    
    // Converte kWh para créditos de carbono
    const carbonCredits = this.convertToCredits(reading.kWh);
    
    // Cria o registro para o ledger
    const creditRecord = {
      deviceId: reading.deviceId,
      profileType: reading.profileType,
      timestamp: reading.timestamp,
      location: reading.location,
      coordinates: reading.coordinates,
      kWh: reading.kWh,
      carbonCredits: carbonCredits,
      emissionFactor: this.emissionFactor,
      metadata: {
        conversionTimestamp: new Date().toISOString(),
        conversionMethod: 'static_factor',
        conversionVersion: '1.0.0'
      }
    };
    
    // Registra no ledger
    const ledgerEntry = this.ledger.addEntry(creditRecord);
    
    return ledgerEntry;
  }

  /**
   * Obtém o total de créditos gerados para um dispositivo
   * @param {String} deviceId ID do dispositivo
   * @returns {Number} Total de créditos em kg CO₂
   */
  getTotalCreditsByDevice(deviceId) {
    const entries = this.ledger.getEntriesByDevice(deviceId);
    
    return entries.reduce((total, entry) => {
      return total + (entry.data.carbonCredits || 0);
    }, 0);
  }

  /**
   * Obtém o total de créditos gerados em todo o sistema
   * @returns {Number} Total de créditos em kg CO₂
   */
  getTotalCredits() {
    const entries = this.ledger.getAllEntries();
    
    return entries.reduce((total, entry) => {
      return total + (entry.data.carbonCredits || 0);
    }, 0);
  }

  /**
   * Obtém estatísticas de conversão
   * @returns {Object} Estatísticas de conversão
   */
  getConversionStats() {
    const entries = this.ledger.getAllEntries();
    const stats = {
      totalEntries: entries.length,
      totalDevices: new Set(entries.map(e => e.data.deviceId)).size,
      totalKWh: 0,
      totalCarbonCredits: 0,
      averageEmissionFactor: this.emissionFactor
    };
    
    if (stats.totalEntries > 0) {
      stats.totalKWh = entries.reduce((sum, entry) => sum + (entry.data.kWh || 0), 0);
      stats.totalCarbonCredits = entries.reduce((sum, entry) => sum + (entry.data.carbonCredits || 0), 0);
      
      // Calcula o fator de emissão médio (pode variar se houver mudanças no fator)
      const factors = entries.map(e => e.data.emissionFactor);
      const uniqueFactors = [...new Set(factors)];
      if (uniqueFactors.length > 1) {
        stats.averageEmissionFactor = stats.totalCarbonCredits / stats.totalKWh;
      }
    }
    
    return stats;
  }

  /**
   * Altera o fator de emissão
   * @param {Number} newFactor Novo fator de emissão
   */
  setEmissionFactor(newFactor) {
    if (typeof newFactor !== 'number' || isNaN(newFactor) || newFactor <= 0) {
      throw new Error('Fator de emissão inválido');
    }
    
    this.emissionFactor = newFactor;
    console.log(`Fator de emissão atualizado para: ${newFactor}`);
  }
}

module.exports = new CarbonCreditConverter();
