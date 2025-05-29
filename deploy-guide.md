# Guia de Deploy do VOLTANEX no Render.com

Este guia fornece instruções passo a passo para fazer o deploy da Demo 1 do VOLTANEX na plataforma Render.com.

## Pré-requisitos

1. Uma conta no [Render.com](https://render.com)
2. O código-fonte do VOLTANEX (já fornecido)
3. As credenciais das APIs (ElectricityMap e WattTime)

## Preparação do Projeto

O projeto já foi preparado para deploy no Render.com com as seguintes modificações:

1. Adição de scripts `start` e `dev` no `package.json`
2. Criação do arquivo `render.yaml` para configuração automatizada
3. Configuração das variáveis de ambiente necessárias

## Passos para Deploy

### 1. Criar uma conta no Render.com

Se você ainda não tem uma conta, acesse [render.com](https://render.com) e crie uma conta gratuita.

### 2. Conectar ao GitHub (Opcional)

Para deploy automático a partir de um repositório:

1. Faça login no Render.com
2. Vá para "Dashboard"
3. Clique em "New" e selecione "Blueprint"
4. Conecte sua conta GitHub e selecione o repositório do VOLTANEX
5. O Render detectará automaticamente o arquivo `render.yaml` e configurará o serviço

### 3. Deploy Manual

Se preferir fazer o deploy manualmente:

1. Faça login no Render.com
2. Vá para "Dashboard"
3. Clique em "New" e selecione "Web Service"
4. Escolha a opção de upload direto ou conecte a um repositório Git
5. Configure o serviço:
   - **Nome**: voltanex-demo1
   - **Ambiente**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plano**: Free (ou outro de sua escolha)

### 4. Configurar Variáveis de Ambiente

As variáveis de ambiente sensíveis precisam ser configuradas manualmente:

1. Após criar o serviço, vá para a seção "Environment"
2. Adicione as seguintes variáveis:
   - `ELECTRICITY_MAP_API_KEY`: Sua chave da API ElectricityMap
   - `WATTTIME_USERNAME`: Seu nome de usuário do WattTime
   - `WATTTIME_PASSWORD`: Sua senha do WattTime
   - `LEDGER_SECRET_KEY`: Uma chave secreta para assinatura do ledger (gere uma chave aleatória)
   - `NODE_ENV`: production
   - `PORT`: 10000 (o Render redirecionará automaticamente)
   - `SIGNATURE_ALGORITHM`: sha256
   - `DEFAULT_SIMULATION_INTERVAL`: 300000
   - `DEFAULT_EMISSION_FACTOR`: 1

### 5. Iniciar o Deploy

1. Clique em "Create Web Service" ou "Save Changes" (dependendo do método escolhido)
2. O Render iniciará automaticamente o processo de build e deploy
3. Aguarde a conclusão do processo (pode levar alguns minutos)

## Validação do Deploy

Após o deploy ser concluído:

1. O Render fornecerá uma URL para seu serviço (algo como `https://voltanex-demo1.onrender.com`)
2. Acesse essa URL para verificar se o serviço está online
3. Você deverá ver a resposta do endpoint raiz com informações sobre o VOLTANEX

## Testando a API

Para testar a API após o deploy:

1. Use a URL fornecida pelo Render como base para todas as requisições
2. Teste o endpoint de status: `https://voltanex-demo1.onrender.com/`
3. Inicie um simulador:
   ```
   curl -X POST https://voltanex-demo1.onrender.com/api/simulator/start \
     -H "Content-Type: application/json" \
     -d '{"profileType": "RESIDENTIAL_SMALL"}'
   ```
4. Verifique os registros no ledger:
   ```
   curl https://voltanex-demo1.onrender.com/api/ledger/entries
   ```

## Documentação da API

A documentação Swagger pode ser acessada colocando os arquivos `swagger.yaml` e `api-docs.html` em um servidor web, ou você pode usar o Swagger UI do Render:

1. Faça o deploy de um serviço estático no Render com esses arquivos
2. Acesse a URL fornecida para visualizar a documentação interativa

## Solução de Problemas

Se encontrar problemas durante o deploy:

1. Verifique os logs do serviço no painel do Render
2. Certifique-se de que todas as variáveis de ambiente estão configuradas corretamente
3. Verifique se o serviço está usando o plano gratuito do Render, que pode ter limitações

## Próximos Passos

Após o deploy bem-sucedido:

1. Configure um domínio personalizado (opcional)
2. Configure monitoramento e alertas
3. Considere migrar para um plano pago para melhor desempenho e disponibilidade

Para qualquer dúvida adicional, consulte a [documentação oficial do Render](https://render.com/docs).
