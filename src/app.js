/**
 * VOLTANEX - Aplicação principal da Demo 1
 * 
 * Este arquivo integra todos os componentes da Demo 1 do VOLTANEX:
 * - Simulador de geração solar
 * - Conversor de kWh para créditos de carbono
 * - Ledger com assinatura digital
 * - Integração com APIs externas (ElectricityMap e WattTime)
 * 
 * A aplicação expõe endpoints REST para interação via Postman/cURL.
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../config/.env') });
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

// Importação dos módulos
const { SolarSimulator, INSTALLATION_PROFILES } = require('./simulator');
const ledger = require('./ledger');
const converter = require('./converter');
const electricityMapClient = require('./electricity-map-client');
const wattTimeClient = require('./watttime-client');

// Configuração do Express
const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Armazenamento de simuladores ativos
const activeSimulators = new Map();

// Rota de status/saúde
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    name: 'VOLTANEX Demo 1',
    version: '1.0.0',
    description: 'Prova de conceito do sistema VOLTANEX de ledger energia-para-carbono'
  });
});

// Rotas para simulador
app.post('/api/simulator/start', (req, res) => {
  try {
    const { profileType = 'RESIDENTIAL_SMALL', deviceId, interval } = req.body;
    
    // Verifica se o perfil é válido
    if (!INSTALLATION_PROFILES[profileType]) {
      return res.status(400).json({ error: `Perfil inválido. Opções: ${Object.keys(INSTALLATION_PROFILES).join(', ')}` });
    }
    
    // Cria um ID único se não fornecido
    const simId = deviceId || `sim-${profileType.toLowerCase()}-${Date.now().toString(36)}`;
    
    // Verifica se já existe um simulador com este ID
    if (activeSimulators.has(simId)) {
      return res.status(400).json({ error: 'Já existe um simulador com este ID' });
    }
    
    // Cria e inicia o simulador
    const simulator = new SolarSimulator(profileType, { deviceId: simId, interval });
    
    // Adiciona listener para processar leituras automaticamente
    simulator.addListener(async (reading) => {
      try {
        // Processa a leitura e registra no ledger
        const entry = converter.processReading(reading);
        console.log(`Leitura processada: ${reading.kWh} kWh = ${entry.data.carbonCredits} kg CO₂`);
      } catch (error) {
        console.error('Erro ao processar leitura:', error);
      }
    });
    
    // Inicia o simulador
    const initialReading = simulator.start();
    
    // Armazena o simulador ativo
    activeSimulators.set(simId, simulator);
    
    res.status(201).json({
      message: 'Simulador iniciado com sucesso',
      simulatorId: simId,
      profile: simulator.getProfileInfo(),
      initialReading
    });
  } catch (error) {
    console.error('Erro ao iniciar simulador:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/simulator/list', (req, res) => {
  const simulators = [];
  
  activeSimulators.forEach((simulator, id) => {
    simulators.push({
      id,
      profile: simulator.getProfileInfo(),
      lastReading: simulator.getLastReading()
    });
  });
  
  res.json({
    count: simulators.length,
    simulators
  });
});

app.get('/api/simulator/:id', (req, res) => {
  const { id } = req.params;
  
  if (!activeSimulators.has(id)) {
    return res.status(404).json({ error: 'Simulador não encontrado' });
  }
  
  const simulator = activeSimulators.get(id);
  
  res.json({
    id,
    profile: simulator.getProfileInfo(),
    lastReading: simulator.getLastReading()
  });
});

app.post('/api/simulator/:id/stop', (req, res) => {
  const { id } = req.params;
  
  if (!activeSimulators.has(id)) {
    return res.status(404).json({ error: 'Simulador não encontrado' });
  }
  
  const simulator = activeSimulators.get(id);
  simulator.stop();
  activeSimulators.delete(id);
  
  res.json({
    message: 'Simulador parado com sucesso',
    id
  });
});

// Rotas para ledger
app.get('/api/ledger/entries', (req, res) => {
  const entries = ledger.getAllEntries();
  
  res.json({
    count: entries.length,
    entries
  });
});

app.get('/api/ledger/entry/:id', (req, res) => {
  const { id } = req.params;
  const entry = ledger.getEntryById(id);
  
  if (!entry) {
    return res.status(404).json({ error: 'Registro não encontrado' });
  }
  
  res.json(entry);
});

app.get('/api/ledger/device/:deviceId', (req, res) => {
  const { deviceId } = req.params;
  const entries = ledger.getEntriesByDevice(deviceId);
  
  res.json({
    deviceId,
    count: entries.length,
    entries
  });
});

app.get('/api/ledger/verify', (req, res) => {
  const integrity = ledger.verifyLedgerIntegrity();
  
  res.json(integrity);
});

app.get('/api/ledger/stats', (req, res) => {
  const stats = ledger.getLedgerStats();
  
  res.json(stats);
});

app.get('/api/ledger/export', (req, res) => {
  const ledgerData = ledger.exportLedger();
  
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', 'attachment; filename=voltanex-ledger.json');
  res.send(ledgerData);
});

// Rotas para conversor
app.get('/api/converter/stats', (req, res) => {
  const stats = converter.getConversionStats();
  
  res.json(stats);
});

app.get('/api/converter/device/:deviceId', (req, res) => {
  const { deviceId } = req.params;
  const total = converter.getTotalCreditsByDevice(deviceId);
  
  res.json({
    deviceId,
    totalCredits: total
  });
});

// Rotas para APIs externas
app.get('/api/external/electricity-map/carbon-intensity', async (req, res) => {
  try {
    const { lat, lng } = req.query;
    
    if (!lat || !lng) {
      return res.status(400).json({ error: 'Parâmetros lat e lng são obrigatórios' });
    }
    
    const coordinates = { lat: parseFloat(lat), lng: parseFloat(lng) };
    const data = await electricityMapClient.getCarbonIntensity(coordinates);
    
    res.json(data);
  } catch (error) {
    console.error('Erro ao consultar ElectricityMap:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/external/watttime/region', async (req, res) => {
  try {
    const { lat, lng } = req.query;
    
    if (!lat || !lng) {
      return res.status(400).json({ error: 'Parâmetros lat e lng são obrigatórios' });
    }
    
    const coordinates = { lat: parseFloat(lat), lng: parseFloat(lng) };
    const data = await wattTimeClient.getRegion(coordinates);
    
    res.json(data);
  } catch (error) {
    console.error('Erro ao consultar WattTime:', error);
    res.status(500).json({ error: error.message });
  }
});

// Inicia o servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor VOLTANEX Demo 1 rodando em http://0.0.0.0:${PORT}`);
  console.log('Pronto para receber requisições via Postman/cURL');
});
