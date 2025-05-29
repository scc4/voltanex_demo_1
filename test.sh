#!/bin/bash

# Script para testar a Demo 1 do VOLTANEX
echo "Executando testes da Demo 1 do VOLTANEX..."

# Verifica se o servidor está rodando
if ! curl -s http://localhost:3000/ > /dev/null; then
    echo "Servidor não está rodando. Iniciando servidor..."
    ./start.sh &
    sleep 5
fi

# Testes do simulador
echo -e "\n=== Testando Simulador ==="
echo "Iniciando simulador residencial pequeno..."
RESIDENTIAL_RESPONSE=$(curl -s -X POST http://localhost:3000/api/simulator/start \
  -H "Content-Type: application/json" \
  -d '{"profileType": "RESIDENTIAL_SMALL"}')
RESIDENTIAL_ID=$(echo $RESIDENTIAL_RESPONSE | grep -o '"simulatorId":"[^"]*' | cut -d'"' -f4)
echo "Simulador iniciado com ID: $RESIDENTIAL_ID"

echo "Iniciando simulador comercial..."
COMMERCIAL_RESPONSE=$(curl -s -X POST http://localhost:3000/api/simulator/start \
  -H "Content-Type: application/json" \
  -d '{"profileType": "COMMERCIAL_SMALL"}')
COMMERCIAL_ID=$(echo $COMMERCIAL_RESPONSE | grep -o '"simulatorId":"[^"]*' | cut -d'"' -f4)
echo "Simulador iniciado com ID: $COMMERCIAL_ID"

echo "Listando simuladores ativos..."
curl -s http://localhost:3000/api/simulator/list | jq

# Aguarda alguns segundos para gerar leituras
echo "Aguardando geração de leituras..."
sleep 10

# Testes do ledger
echo -e "\n=== Testando Ledger ==="
echo "Verificando registros no ledger..."
curl -s http://localhost:3000/api/ledger/entries | jq

echo "Verificando integridade do ledger..."
curl -s http://localhost:3000/api/ledger/verify | jq

echo "Obtendo estatísticas do ledger..."
curl -s http://localhost:3000/api/ledger/stats | jq

# Testes do conversor
echo -e "\n=== Testando Conversor ==="
echo "Obtendo estatísticas de conversão..."
curl -s http://localhost:3000/api/converter/stats | jq

# Testes das APIs externas
echo -e "\n=== Testando APIs Externas ==="
echo "Consultando intensidade de carbono para São Paulo..."
curl -s "http://localhost:3000/api/external/electricity-map/carbon-intensity?lat=-23.5505&lng=-46.6333" | jq

echo "Consultando região WattTime para São Paulo..."
curl -s "http://localhost:3000/api/external/watttime/region?lat=-23.5505&lng=-46.6333" | jq

# Parando os simuladores
echo -e "\n=== Finalizando Testes ==="
echo "Parando simuladores..."
curl -s -X POST http://localhost:3000/api/simulator/$RESIDENTIAL_ID/stop
curl -s -X POST http://localhost:3000/api/simulator/$COMMERCIAL_ID/stop

echo -e "\nTestes concluídos com sucesso!"
