/**
 * VOLTANEX - Ledger com Assinatura Digital
 * 
 * Este módulo implementa o ledger VOLTANEX para registro de créditos de carbono
 * com assinatura digital para garantir a integridade e autenticidade dos registros.
 */

require('dotenv').config({ path: '../config/.env' });
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Configurações do ledger
const LEDGER_SECRET_KEY = process.env.LEDGER_SECRET_KEY || 'voltanex_demo1_secret_key_2025';
const SIGNATURE_ALGORITHM = process.env.SIGNATURE_ALGORITHM || 'sha256';
const LEDGER_FILE_PATH = path.join(__dirname, '../data/ledger.json');

// Garante que o diretório de dados existe
if (!fs.existsSync(path.join(__dirname, '../data'))) {
  fs.mkdirSync(path.join(__dirname, '../data'), { recursive: true });
}

/**
 * Classe Ledger VOLTANEX
 */
class VoltanexLedger {
  constructor() {
    this.ledger = this.loadLedger();
    this.initializeLedger();
  }

  /**
   * Inicializa o ledger se for novo
   */
  initializeLedger() {
    if (!this.ledger.metadata) {
      this.ledger = {
        metadata: {
          name: 'VOLTANEX Carbon Credit Ledger',
          version: '1.0.0',
          created: new Date().toISOString(),
          description: 'Ledger para registro de créditos de carbono baseados em geração de energia renovável no Brasil'
        },
        entries: []
      };
      this.saveLedger();
    }
  }

  /**
   * Carrega o ledger do arquivo
   * @returns {Object} Dados do ledger
   */
  loadLedger() {
    try {
      if (fs.existsSync(LEDGER_FILE_PATH)) {
        const data = fs.readFileSync(LEDGER_FILE_PATH, 'utf8');
        return JSON.parse(data);
      }
    } catch (error) {
      console.error('Erro ao carregar ledger:', error);
    }
    return { entries: [] };
  }

  /**
   * Salva o ledger no arquivo
   */
  saveLedger() {
    try {
      fs.writeFileSync(LEDGER_FILE_PATH, JSON.stringify(this.ledger, null, 2), 'utf8');
    } catch (error) {
      console.error('Erro ao salvar ledger:', error);
    }
  }

  /**
   * Gera uma assinatura digital para os dados
   * @param {Object} data Dados a serem assinados
   * @returns {String} Assinatura digital em formato hexadecimal
   */
  generateSignature(data) {
    const dataString = typeof data === 'string' ? data : JSON.stringify(data);
    return crypto
      .createHmac(SIGNATURE_ALGORITHM, LEDGER_SECRET_KEY)
      .update(dataString)
      .digest('hex');
  }

  /**
   * Verifica a assinatura digital de um registro
   * @param {Object} entry Registro a ser verificado
   * @returns {Boolean} Verdadeiro se a assinatura for válida
   */
  verifySignature(entry) {
    if (!entry || !entry.data || !entry.signature) {
      return false;
    }

    // Cria uma cópia dos dados sem a assinatura para verificação
    const dataToVerify = { ...entry.data };
    
    // Gera uma nova assinatura para comparação
    const expectedSignature = this.generateSignature(dataToVerify);
    
    // Compara com a assinatura armazenada
    return entry.signature === expectedSignature;
  }

  /**
   * Adiciona um novo registro ao ledger
   * @param {Object} data Dados a serem registrados
   * @returns {Object} Registro adicionado com assinatura
   */
  addEntry(data) {
    // Adiciona timestamp se não existir
    if (!data.timestamp) {
      data.timestamp = new Date().toISOString();
    }
    
    // Adiciona ID único para o registro
    const entryId = `voltanex-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
    
    // Cria o registro completo
    const entry = {
      id: entryId,
      data: data,
      timestamp: new Date().toISOString(),
      signature: null
    };
    
    // Gera e adiciona a assinatura digital
    entry.signature = this.generateSignature(entry.data);
    
    // Adiciona ao ledger
    this.ledger.entries.push(entry);
    
    // Salva o ledger atualizado
    this.saveLedger();
    
    return entry;
  }

  /**
   * Obtém todos os registros do ledger
   * @returns {Array} Lista de registros
   */
  getAllEntries() {
    return this.ledger.entries;
  }

  /**
   * Obtém um registro específico pelo ID
   * @param {String} id ID do registro
   * @returns {Object} Registro encontrado ou null
   */
  getEntryById(id) {
    return this.ledger.entries.find(entry => entry.id === id) || null;
  }

  /**
   * Obtém registros por dispositivo
   * @param {String} deviceId ID do dispositivo
   * @returns {Array} Lista de registros do dispositivo
   */
  getEntriesByDevice(deviceId) {
    return this.ledger.entries.filter(entry => 
      entry.data && entry.data.deviceId === deviceId
    );
  }

  /**
   * Verifica a integridade de todo o ledger
   * @returns {Object} Resultado da verificação
   */
  verifyLedgerIntegrity() {
    const results = {
      totalEntries: this.ledger.entries.length,
      validEntries: 0,
      invalidEntries: 0,
      invalidIds: []
    };
    
    this.ledger.entries.forEach(entry => {
      if (this.verifySignature(entry)) {
        results.validEntries++;
      } else {
        results.invalidEntries++;
        results.invalidIds.push(entry.id);
      }
    });
    
    return results;
  }

  /**
   * Exporta o ledger em formato JSON
   * @returns {String} Ledger em formato JSON
   */
  exportLedger() {
    return JSON.stringify(this.ledger, null, 2);
  }

  /**
   * Obtém estatísticas do ledger
   * @returns {Object} Estatísticas do ledger
   */
  getLedgerStats() {
    const stats = {
      totalEntries: this.ledger.entries.length,
      totalDevices: new Set(this.ledger.entries.map(e => e.data.deviceId)).size,
      totalCredits: 0,
      firstEntryDate: null,
      lastEntryDate: null
    };
    
    if (stats.totalEntries > 0) {
      stats.firstEntryDate = this.ledger.entries[0].timestamp;
      stats.lastEntryDate = this.ledger.entries[this.ledger.entries.length - 1].timestamp;
      
      // Calcula o total de créditos
      stats.totalCredits = this.ledger.entries.reduce((sum, entry) => {
        return sum + (entry.data.carbonCredits || 0);
      }, 0);
    }
    
    return stats;
  }
}

module.exports = new VoltanexLedger();
