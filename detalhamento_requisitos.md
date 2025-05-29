# Detalhamento dos Requisitos do Projeto VOLTANEX

## Objetivo Principal
Construir um protótipo em duas etapas que:
1. Rastreia a produção de energia solar/bateria no Brasil
2. Converte cada kWh em um offset conservador de 1 kg de CO₂
3. Armazena cada crédito em um ledger VOLTANEX público e assinado
4. Prepara o sistema para futura integração com minting on-chain

## Estágio 1 - Demo 1 (Prova de Conceito - 1 Semana)
### Limitações de Escopo:
- Sem adaptadores reais para inversores (apenas simulador)
- Fator de emissão estático único (sem lógica MEF/benchmark)
- Sem árvore de Merkle
- Sem interface de usuário
- Apenas JSON bruto via Postman/cURL

## Estágio 2 - Demo 2 (Protótipo para Investidores - 4 Semanas)
### Características:
- Construído diretamente sobre o código da Demo 1 (sem descartar código)
- Evolução do sistema inicial para um protótipo mais robusto

### Adiado para Fase 3 (Pós-financiamento):
- ERC-1155 para mint on-chain e armazenamento de hash de transação
- Portal de utilidades multi-tenant e armazém de BI
- Fortalecimento OAuth/RBAC e preparação para SOC 2

## Ações Imediatas (Sprint 0 - próximas 48h)
1. Dev Lead:
   - Solicitar chave de API comunitária do ElectricityMap
   - Solicitar chave de API sem fins lucrativos do WattTime

2. DevOps:
   - Baixar o CSV mais recente do fator CO₂ do MCTI e fazer commit no repositório
   - Provisionar aplicativo Lightsail e RDS Postgres
   - Criar repositório GitHub e esqueleto de pipeline CI

## Resumo Executivo
- Semana 1: Demonstração de um telhado solar simulado gerando créditos de 1 kg em um ledger VOLTANEX assinado, já bilíngue e com marca.
- Semana 4: O mesmo sistema ingere dispositivos reais, usa dados de rede marginal ao vivo, encadeia cada crédito com hash, escala para 10 mil dispositivos e mostra tudo em um dashboard web polido.
- Pós-financiamento: Substituir a escrita do ledger por um mint ERC-1155, adicionar recursos empresariais e buscar certificação.
