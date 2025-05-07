FROM node:20-slim

# Instala dependências necessárias para o Chromium (usado pelo Puppeteer)
RUN apt-get update && apt-get install -y \
  wget \
  ca-certificates \
  fonts-liberation \
  libappindicator3-1 \
  libasound2 \
  libatk-bridge2.0-0 \
  libatk1.0-0 \
  libcups2 \
  libdbus-1-3 \
  libdrm2 \
  libgbm1 \
  libgtk-3-0 \
  libnspr4 \
  libnss3 \
  libx11-xcb1 \
  libxcomposite1 \
  libxdamage1 \
  libxrandr2 \
  xdg-utils \
  --no-install-recommends && \
  apt-get clean && rm -rf /var/lib/apt/lists/*

# Cria diretório do app
WORKDIR /app

COPY .env .env

# Copia package.json e instala dependências Node.js
COPY package*.json ./
RUN npm install

# Copia o código da aplicação
COPY app ./app

# Expõe porta
EXPOSE 8080

# Comando padrão
CMD ["node", "app/app.js"]
