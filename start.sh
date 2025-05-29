#!/bin/bash

# Script para iniciar a Demo 1 do VOLTANEX
echo "Iniciando VOLTANEX Demo 1..."

# Verifica se o Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "Node.js não encontrado. Por favor, instale o Node.js para executar a Demo 1."
    exit 1
fi

# Navega para o diretório do projeto
cd "$(dirname "$0")"

# Verifica se as dependências estão instaladas
if [ ! -d "node_modules" ]; then
    echo "Instalando dependências..."
    npm install
fi

# Inicia a aplicação
echo "Iniciando servidor VOLTANEX na porta 3000..."
node src/app.js
