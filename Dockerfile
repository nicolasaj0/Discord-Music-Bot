FROM node:20-slim

# Instalar dependências do sistema necessárias (ffmpeg para áudio e python3 para yt-dlp)
RUN apt-get update && apt-get install -y \
    ffmpeg \
    python3 \
    python3-pip \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Definir o diretório de trabalho
WORKDIR /app

# Alterar a propriedade do diretório para o usuário 'node' (UID 1000) exigido pelo Hugging Face
RUN chown -R node:node /app

# Mudar para o usuário node
USER node

# Copiar arquivos de dependências com a propriedade correta
COPY --chown=node:node package*.json ./

# Instalar as dependências de produção do Node.js
RUN npm ci --only=production

# Copiar o restante do código do bot
COPY --chown=node:node . .

# Porta padrão exposta pelo Hugging Face Spaces
ENV PORT=7860

# Iniciar o bot do Discord
CMD ["node", "src/index.js"]
