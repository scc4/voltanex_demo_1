# Documentação da Demo 1 do VOLTENEX

## Visão Geral
A Demo 1 do VOLTENEX é uma prova de conceito que implementa um sistema de ledger energia-para-carbono focado no Brasil. O sistema rastreia a produção de energia solar simulada, converte cada kWh em um offset conservador de 1 kg de CO₂, e armazena cada crédito em um ledger VOLTANEX público e assinado.

## Componentes Principais
1. **Simulador de Geração Solar**: Simula a geração de energia solar para diferentes perfis de instalação.
2. **Ledger com Assinatura Digital**: Armazena registros de créditos de carbono com assinatura digital para garantir integridade.
3. **Conversor kWh para Créditos de Carbono**: Converte energia gerada em créditos de carbono.
4. **Integração com APIs Externas**: Conecta-se às APIs ElectricityMap e WattTime para obter dados reais.
5. **API REST**: Expõe endpoints para interação via Postman/cURL.

## Requisitos
- Node.js (v14 ou superior)
- NPM (v6 ou superior)
- Conexão com internet para acesso às APIs externas

## Instalação e Execução
1. Extraia os arquivos do projeto em um diretório de sua escolha
2. Navegue até o diretório do projeto
3. Execute o script de inicialização:
   ```
   ./start.sh
   ```
4. O servidor será iniciado na porta 3000

## Endpoints da API

### Status do Sistema
- `GET /`: Retorna o status do sistema

### Simulador
- `POST /api/simulator/start`: Inicia um novo simulador
  - Parâmetros (JSON):
    - `profileType`: Tipo de perfil (RESIDENTIAL_SMALL, RESIDENTIAL_MEDIUM, COMMERCIAL_SMALL, COMMERCIAL_LARGE)
    - `deviceId`: ID do dispositivo (opcional)
    - `interval`: Intervalo de simulação em ms (opcional)
- `GET /api/simulator/list`: Lista todos os simuladores ativos
- `GET /api/simulator/:id`: Obtém detalhes de um simulador específico
- `POST /api/simulator/:id/stop`: Para um simulador específico

### Ledger
- `GET /api/ledger/entries`: Lista todos os registros do ledger
- `GET /api/ledger/entry/:id`: Obtém um registro específico do ledger
- `GET /api/ledger/device/:deviceId`: Lista registros de um dispositivo específico
- `GET /api/ledger/verify`: Verifica a integridade do ledger
- `GET /api/ledger/stats`: Obtém estatísticas do ledger
- `GET /api/ledger/export`: Exporta o ledger completo em formato JSON

### Conversor
- `GET /api/converter/stats`: Obtém estatísticas de conversão
- `GET /api/converter/device/:deviceId`: Obtém total de créditos para um dispositivo

### APIs Externas
- `GET /api/external/electricity-map/carbon-intensity`: Consulta intensidade de carbono
  - Parâmetros (query):
    - `lat`: Latitude
    - `lng`: Longitude
- `GET /api/external/watttime/region`: Consulta região do WattTime
  - Parâmetros (query):
    - `lat`: Latitude
    - `lng`: Longitude

## Exemplos de Uso

### Iniciar um Simulador
```bash
curl -X POST http://localhost:3000/api/simulator/start \
  -H "Content-Type: application/json" \
  -d '{"profileType": "RESIDENTIAL_SMALL"}'
```

### Listar Simuladores Ativos
```bash
curl http://localhost:3000/api/simulator/list
```

### Verificar Registros no Ledger
```bash
curl http://localhost:3000/api/ledger/entries
```

### Verificar Estatísticas de Conversão
```bash
curl http://localhost:3000/api/converter/stats
```

## Limitações Conhecidas
1. **ElectricityMap**: A API retorna dados de intensidade de carbono, mas o endpoint de fator marginal retorna erro 401, possivelmente devido a limitações da chave de API comunitária.
2. **WattTime**: A API retorna HTML em vez de JSON para alguns endpoints, possivelmente devido a mudanças na API ou limitações de acesso.
3. **Demo 1**: Conforme especificado no escopo, esta versão utiliza:
   - Apenas simulador (sem adaptadores reais para inversores)
   - Fator de emissão estático único (1 kWh = 1 kg CO₂)
   - Sem árvore de Merkle
   - Sem interface de usuário (apenas JSON via Postman/cURL)


