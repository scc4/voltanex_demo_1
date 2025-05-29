/**
 * VOLTANEX - Teste de Integração com WattTime
 * 
 * Este script testa a integração com a API do WattTime
 * para verificar se a autenticação e consultas estão funcionando corretamente.
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../config/.env') });
const wattTimeClient = require('./watttime-client');

async function testWattTimeIntegration() {
  console.log('Iniciando teste de integração com WattTime...');
  console.log('Credenciais configuradas:', process.env.WATTTIME_USERNAME ? 'Sim' : 'Não');
  
  try {
    // Teste de autenticação
    console.log('Testando autenticação com a API...');
    await wattTimeClient.getAuthToken();
    console.log('Token obtido com sucesso!');
    
    // Teste de conexão básica
    console.log('\nTestando conexão geral com a API...');
    const connectionSuccess = await wattTimeClient.testConnection();
    console.log('Conexão bem-sucedida:', connectionSuccess);
    
    if (!connectionSuccess) {
      console.log('Falha na conexão. Verifique as credenciais e a conectividade.');
      return false;
    }
    
    // Teste de obtenção de região e índice de emissão para diferentes localizações no Brasil
    const locations = [
      { name: 'São Paulo', coordinates: { lat: -23.5505, lng: -46.6333 } },
      { name: 'Rio de Janeiro', coordinates: { lat: -22.9068, lng: -43.1729 } },
      { name: 'Brasília', coordinates: { lat: -15.7801, lng: -47.9292 } }
    ];
    
    console.log('\nTestando obtenção de região e índice de emissão para diferentes localizações:');
    
    for (const location of locations) {
      console.log(`\nLocalização: ${location.name}`);
      
      // Obtém região
      const region = await wattTimeClient.getRegion(location.coordinates);
      console.log('Resposta da API (região):', JSON.stringify(region, null, 2));
      
      if (region.fallback) {
        console.log('Aviso: Usando valor de fallback devido a erro na API');
      } else {
        console.log('Região obtida com sucesso');
        
        // Obtém índice de emissão marginal
        const emissionsIndex = await wattTimeClient.getMarginalEmissionsIndex(region.ba);
        console.log('Índice de emissão marginal:', JSON.stringify(emissionsIndex, null, 2));
        
        if (emissionsIndex.fallback) {
          console.log('Aviso: Usando valor de fallback devido a erro na API');
        } else {
          console.log('Índice de emissão marginal obtido com sucesso');
          
          // Converte para fator de emissão
          const emissionFactor = wattTimeClient.convertPercentToEmissionFactor(emissionsIndex.percent);
          console.log(`Fator de emissão estimado: ${emissionFactor.toFixed(3)} kgCO2eq/kWh`);
        }
      }
      
      // Obtém fator de emissão marginal diretamente
      const marginalFactor = await wattTimeClient.getMarginalEmissionFactor(location.coordinates);
      console.log('Fator de emissão marginal (método combinado):', JSON.stringify(marginalFactor, null, 2));
    }
    
    console.log('\nTeste de integração com WattTime concluído com sucesso!');
    return true;
  } catch (error) {
    console.error('Erro durante o teste de integração:', error);
    return false;
  }
}

// Executa o teste
testWattTimeIntegration()
  .then(success => {
    console.log(`\nResultado final do teste: ${success ? 'SUCESSO' : 'FALHA'}`);
  })
  .catch(error => {
    console.error('Erro fatal durante o teste:', error);
  });
