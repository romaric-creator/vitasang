FROM node:20-alpine

# Répertoire de travail
WORKDIR /app

# Installation de PM2
RUN npm install -g pm2

# Copie des dépendances depuis le dossier backend
COPY backend/package*.json ./

# Installation des dépendances
RUN npm ci

# Copie du code source du backend
COPY backend/ .

# Exposition du port
EXPOSE 8000

# Démarrage
CMD ["pm2-runtime", "start", "ecosystem.config.js"]
