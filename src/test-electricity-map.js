/**
 * VOLTANEX - Teste de Integração com ElectricityMap
 * 
 * Este script testa a integração com a API do ElectricityMap
 * para verificar se a conexão e autenticação estão funcionando corretamente.
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../config/.env') });
const electricityMapClient = require('./electricity-map-client');

async function testElectricityMapIntegration() {
  console.log('Iniciando teste de integração com ElectricityMap...');
  console.log('API Key configurada:', process.env.ELECTRICITY_MAP_API_KEY ? 'Sim' : 'Não');
  
  try {
    // Teste de conexão básica
    console.log('Testando conexão com a API...');
    const connectionSuccess = await electricityMapClient.testConnection();
    console.log('Conexão bem-sucedida:', connectionSuccess);
    
    if (!connectionSuccess) {
      console.log('Falha na conexão. Verifique a API Key e a conectividade.');
      return false;
    }
    
    // Teste de obtenção de intensidade de carbono para diferentes localizações no Brasil
    const locations = [
      { name: 'São Paulo', coordinates: { lat: -23.5505, lng: -46.6333 } },
      { name: 'Rio de Janeiro', coordinates: { lat: -22.9068, lng: -43.1729 } },
      { name: 'Brasília', coordinates: { lat: -15.7801, lng: -47.9292 } }
    ];
    
    console.log('\nTestando obtenção de intensidade de carbono para diferentes localizações:');
    
    for (const location of locations) {
      console.log(`\nLocalização: ${location.name}`);
      
      // Obtém intensidade de carbono
      const carbonIntensity = await electricityMapClient.getCarbonIntensity(location.coordinates);
      console.log('Resposta da API:', JSON.stringify(carbonIntensity, null, 2));
      
      if (carbonIntensity.fallback) {
        console.log('Aviso: Usando valor de fallback devido a erro na API');
      } else {
        console.log('Intensidade de carbono obtida com sucesso');
      }
      
      // Obtém fator de emissão marginal
      const marginalFactor = await electricityMapClient.getMarginalEmissionFactor(location.coordinates);
      console.log('Fator de emissão marginal:', JSON.stringify(marginalFactor, null, 2));
      
      if (marginalFactor.fallback) {
        console.log('Aviso: Usando valor de fallback devido a erro na API');
      } else {
        console.log('Fator de emissão marginal obtido com sucesso');
      }
    }
    
    console.log('\nTeste de integração com ElectricityMap concluído com sucesso!');
    return true;
  } catch (error) {
    console.error('Erro durante o teste de integração:', error);
    return false;
  }
}

// Executa o teste
testElectricityMapIntegration()
  .then(success => {
    console.log(`\nResultado final do teste: ${success ? 'SUCESSO' : 'FALHA'}`);
  })
  .catch(error => {
    console.error('Erro fatal durante o teste:', error);
  });
