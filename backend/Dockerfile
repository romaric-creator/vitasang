FROM node:20-alpine

# Définition du répertoire de travail dans le conteneur
WORKDIR /app

# Installation de PM2 globalement pour faire tourner le cluster
RUN npm install -g pm2

# Copie des fichiers de dépendances
COPY package*.json ./

# Installation des dépendances (uniquement celles de production)
RUN npm ci

# Copie du reste du code de l'API
COPY . .

# Exposition du port (Koyeb utilise souvent le port spécifié ou un port dynamique fourni via la variable d'environnement PORT, notre app utilise process.env.PORT)
EXPOSE 8000

# Commande de démarrage avec PM2 pour garder le processus actif et utiliser tous les cœurs
CMD ["pm2-runtime", "start", "ecosystem.config.js"]
