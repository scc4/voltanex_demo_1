# Guia para Publicar o Projeto VOLTANEX no GitHub usando Windows

Este guia fornece instruções passo a passo para publicar o projeto VOLTANEX em um repositório GitHub usando o sistema operacional Windows.

## Pré-requisitos

1. **Git para Windows**: Ferramenta para controle de versão
2. **Conta no GitHub**: Necessária para criar repositórios
3. **Projeto VOLTANEX**: Os arquivos do projeto que você deseja publicar

## Passo 1: Instalar o Git para Windows

Se você ainda não tem o Git instalado:

1. Acesse [https://git-scm.com/download/win](https://git-scm.com/download/win)
2. Baixe o instalador para Windows
3. Execute o instalador e siga as instruções:
   - Aceite as configurações padrão na maioria das telas
   - Na tela "Choosing the default editor", selecione o editor de sua preferência
   - Na tela "Adjusting the name of the initial branch", recomenda-se escolher "main"
   - Nas demais telas, mantenha as opções padrão e clique em "Next"
   - Finalize a instalação clicando em "Install"

## Passo 2: Configurar o Git

Abra o Git Bash, Prompt de Comando ou PowerShell e configure suas informações:

```bash
git config --global user.name "Seu Nome"
git config --global user.email "seu.email@exemplo.com"
```

> **Nota**: Use o mesmo email associado à sua conta do GitHub.

## Passo 3: Criar um Novo Repositório no GitHub

1. Acesse [GitHub.com](https://github.com/) e faça login
2. Clique no botão "+" no canto superior direito e selecione "New repository"
3. Preencha as informações:
   - **Repository name**: voltanex (ou outro nome de sua escolha)
   - **Description**: VOLTANEX Demo 1 - Energy-to-carbon ledger project for Brazil
   - **Visibility**: Public (ou Private, se preferir)
   - **Initialize this repository with**: Deixe todas as opções desmarcadas
4. Clique em "Create repository"

## Passo 4: Preparar o Projeto para Upload

1. Navegue até a pasta do projeto VOLTANEX no seu computador
2. Verifique se o arquivo `.gitignore` existe e está configurado corretamente

Se não existir um arquivo `.gitignore`, crie um com o seguinte conteúdo:

```
# Dependências
node_modules/
npm-debug.log
yarn-debug.log
yarn-error.log

# Ambiente
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Sistema
.DS_Store
Thumbs.db

# Logs
logs
*.log

# Arquivos de build
/build
/dist

# Arquivos temporários
/tmp
/temp
```

## Passo 5: Inicializar o Repositório Git Local

Abra o Prompt de Comando, PowerShell ou Git Bash na pasta do projeto:

### Usando Prompt de Comando ou PowerShell:

1. Abra o Explorador de Arquivos e navegue até a pasta do projeto
2. Clique com o botão direito enquanto segura a tecla Shift
3. Selecione "Abrir janela do PowerShell aqui" ou "Abrir janela de comando aqui"

### Usando Git Bash:

1. Abra o Git Bash
2. Navegue até a pasta do projeto usando comandos como:
   ```bash
   cd C:/Caminho/Para/Seu/Projeto/voltanex
   ```

## Passo 6: Inicializar o Repositório e Fazer o Primeiro Commit

Execute os seguintes comandos:

```bash
# Inicializar repositório Git (pule este passo se o projeto já tiver um repositório Git)
git init

# Adicionar todos os arquivos ao staging
git add .

# Fazer o primeiro commit
git commit -m "Commit inicial do projeto VOLTANEX Demo 1"
```

## Passo 7: Conectar e Enviar para o Repositório GitHub

```bash
# Adicionar o repositório remoto (substitua 'SEU-USUARIO' pelo seu nome de usuário do GitHub)
git remote add origin https://github.com/SEU-USUARIO/voltanex.git

# Enviar o código para o GitHub (branch principal)
git push -u origin main
```

> **Nota**: Se o seu branch principal for chamado "master" em vez de "main", substitua "main" por "master" no comando acima.

Se for solicitado, faça login com suas credenciais do GitHub.

### Autenticação no GitHub

O GitHub não aceita mais autenticação por senha para operações Git. Você tem duas opções:

#### Opção 1: Usar o GitHub CLI para autenticação

1. Instale o GitHub CLI em [https://cli.github.com/](https://cli.github.com/)
2. Execute `gh auth login` e siga as instruções

#### Opção 2: Criar um token de acesso pessoal

1. No GitHub, vá para Settings > Developer settings > Personal access tokens
2. Clique em "Generate new token"
3. Dê um nome ao token, selecione os escopos "repo" e "workflow"
4. Clique em "Generate token" e copie o token gerado
5. Use este token como senha quando solicitado pelo Git

## Passo 8: Verificar o Upload

1. Acesse seu repositório no GitHub: `https://github.com/SEU-USUARIO/voltanex`
2. Verifique se todos os arquivos foram enviados corretamente
3. Confirme se arquivos sensíveis (como `.env`) não foram incluídos

## Comandos Git Úteis para Atualizações Futuras

```bash
# Verificar status do repositório
git status

# Adicionar alterações
git add .

# Fazer um novo commit
git commit -m "Descrição das alterações"

# Enviar atualizações para o GitHub
git push

# Obter atualizações do GitHub
git pull
```

## Solução de Problemas Comuns

### Erro de autenticação
Se receber erros de autenticação, verifique se está usando um token de acesso pessoal ou o GitHub CLI para autenticação.

### Branch principal com nome diferente
Se o comando push falhar mencionando que o branch não existe, verifique o nome do seu branch local:
```bash
git branch
```
E então use esse nome no comando push:
```bash
git push -u origin NOME-DO-BRANCH
```

### Arquivos grandes demais
Se receber erros sobre arquivos grandes demais, considere usar o Git LFS ou remover esses arquivos do repositório.

## Próximos Passos

Após publicar seu projeto no GitHub, você pode:

1. Adicionar um arquivo README.md detalhado
2. Configurar GitHub Actions para CI/CD
3. Conectar o repositório ao Render.com para deploy automático

Para qualquer dúvida adicional, consulte a [documentação oficial do Git](https://git-scm.com/doc) ou a [documentação do GitHub](https://docs.github.com/pt).
