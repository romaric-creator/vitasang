# Guide de Déploiement VitaSang

## 1. Préparation de la Base de Données (Production)

### 1.1 Création de la Base de Données
```bash
# Via SSH sur serveur production
mysql -u root -p

CREATE DATABASE vitasang_prod CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'vitasang_prod'@'localhost' IDENTIFIED BY 'SECURE_PASSWORD_HERE';
GRANT ALL PRIVILEGES ON vitasang_prod.* TO 'vitasang_prod'@'localhost';
FLUSH PRIVILEGES;
```

### 1.2 Migration Sequelize
```bash
# Backend directory
cd backend

# Installer dépendances
npm install

# Run migrations
DATABASE_URL=mysql://vitasang_prod:PASSWORD@localhost/vitasang_prod \
NODE_ENV=production \
npx sequelize-cli db:migrate

# Seed initial data (centres, blood types)
NODE_ENV=production npm run seed
```

## 2. Configuration Serveur (Backend)

### 2.1 Créer fichier `.env.production`
```env
# Database
DB_HOST=your-db-host
DB_USER=vitasang_prod
DB_PASSWORD=VERY_SECURE_PASSWORD
DB_NAME=vitasang_prod
DB_PORT=3306

# JWT & Security
JWT_SECRET=LONG_RANDOM_STRING_MIN_32_CHARS
JWT_EXPIRE=24h
NODE_ENV=production

# Logging
LOG_LEVEL=info
LOG_PATH=./logs

# CORS
CORS_ORIGIN=https://vitasang.com,https://app.vitasang.com

# Rate Limiting
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX_REQUESTS=100

# Expo Push Notifications
EXPO_ACCESS_TOKEN=YOUR_EXPO_TOKEN_HERE

# API Port
PORT=3000
```

### 2.2 Démarrer avec PM2
```bash
# Installer PM2
npm install -g pm2

# Créer fichier ecosystem.config.js
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'vitasang-api',
    script: './index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production'
    },
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true
  }]
};
EOF

# Démarrer l'app
pm2 start ecosystem.config.js

# Sauvegarder configuration
pm2 save
pm2 startup
```

### 2.3 Configuration Nginx (Reverse Proxy)
```nginx
# /etc/nginx/sites-available/vitasang-api
server {
    listen 443 ssl http2;
    server_name api.vitasang.com;

    ssl_certificate /etc/letsencrypt/live/api.vitasang.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.vitasang.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Cache static assets
    location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name api.vitasang.com;
    return 301 https://$server_name$request_uri;
}
```

### 2.4 Activer Nginx
```bash
sudo ln -s /etc/nginx/sites-available/vitasang-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 3. Configuration Frontend (React Native)

### 3.1 Créer `.env.production`
```env
EXPO_PUBLIC_API_BASE_URL=https://api.vitasang.com
EXPO_PUBLIC_TIMEOUT=10000
EXPO_PUBLIC_LOG_LEVEL=info
EXPO_PUBLIC_DEBUG_MODE=false
EXPO_PUBLIC_ENABLE_CRASH_REPORTING=true
```

### 3.2 Build APK pour Android
```bash
cd frontend

# Installer EAS CLI
npm install -g eas-cli

# Configurer build
eas build --platform android --non-interactive

# Ou builder localement
eas build --platform android --local

# Récupérer APK
# Disponible via dashboard.expo.dev
```

### 3.3 Build IPA pour iOS
```bash
# Nécessite Apple Developer Account
eas build --platform ios

# Ou utiliser TestFlight pour beta
eas submit --platform ios --latest
```

## 4. Sécurité

### 4.1 SSL/TLS
```bash
# Installer Certbot
sudo apt-get install certbot python3-certbot-nginx

# Obtenir certificat Let's Encrypt
sudo certbot certonly --nginx -d api.vitasang.com -d app.vitasang.com
```

### 4.2 Firewall
```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 3306/tcp from 127.0.0.1
sudo ufw enable
```

### 4.3 Sécurisation Base de Données
```bash
# Sauvegarder régulièrement
0 2 * * * mysqldump -u vitasang_prod -p$DB_PASSWORD vitasang_prod | gzip > /backups/vitasang_$(date +\%Y\%m\%d).sql.gz

# Chiffrer sauvegardes
gpg --symmetric /backups/vitasang_*.sql.gz
```

## 5. Monitoring & Logs

### 5.1 Configurer Logrotate
```bash
# /etc/logrotate.d/vitasang
/home/vitasang/backend/logs/*.log {
    daily
    rotate 30
    compress
    delaycompress
    notifempty
    create 0640 vitasang vitasang
    sharedscripts
    postrotate
        pm2 reload vitasang-api > /dev/null 2>&1 || true
    endscript
}
```

### 5.2 Monitoring avec PM2+
```bash
# Installer PM2+
pm2 install pm2-auto-pull

# Connecter à PM2+
pm2 link SECRET_KEY PUBLIC_KEY

# Monitoring en temps réel
pm2 monit
```

### 5.3 Alertes Email
```bash
# Configurer alertes PM2+
pm2 trigger vitasang-api "Memory Limit" 300 --alert-on
```

## 6. Health Checks

### 6.1 Endpoint Health
```bash
# Vérifier API est opérationnel
curl https://api.vitasang.com/api/health
# Réponse attendue:
# {"status":"ok","timestamp":"2024-01-01T12:00:00Z"}
```

### 6.2 Database Health
```bash
# Via application
curl -H "Authorization: Bearer TOKEN" \
  https://api.vitasang.com/api/health/db
```

## 7. Mise à Jour en Production

### 7.1 Procédure Zero-Downtime
```bash
# 1. Pull code depuis Git
git pull origin main

# 2. Installer dépendances
npm install

# 3. Run migrations (si nécessaire)
NODE_ENV=production npm run migrate

# 4. Reload avec PM2 (sans downtime)
pm2 reload vitasang-api

# 5. Vérifier santé
curl https://api.vitasang.com/api/health
```

### 7.2 Rollback
```bash
# Si quelque chose va mal
git revert HEAD
pm2 reload vitasang-api
NODE_ENV=production npm run migrate --down
```

## 8. Performance

### 8.1 Optimisation Node.js
```bash
# Utiliser une version LTS
nvm install 18
nvm use 18

# Démarrer avec ressources optimales
NODE_OPTIONS="--max-old-space-size=2048" pm2 start ecosystem.config.js
```

### 8.2 Caching
```javascript
// Dans routes: header Cache-Control pour endpoints stables
router.get('/api/centres', (req, res) => {
  res.set('Cache-Control', 'public, max-age=3600'); // 1 hour cache
  // ...
});
```

### 8.3 Compression
```javascript
// Dans index.js ajouter:
const compression = require('compression');
app.use(compression());
```

## 9. Checklist Déploiement

- [ ] Base de données créée et migrée
- [ ] .env.production configuré avec secrets sécurisés
- [ ] Certificats SSL/TLS en place
- [ ] Nginx configuré et testé
- [ ] PM2 démarré et sauvegardé
- [ ] Firewall configuré
- [ ] Backups automatiques en place
- [ ] Health check passe
- [ ] Frontend .env.production configuré
- [ ] App stockée sur Google Play et Apple App Store
- [ ] Monitoring PM2+ configuré
- [ ] Logs rotatés automatiquement
- [ ] Tests smoke sur endpoints clés

## 10. Support & Escalade

### Contacts Critiques
- **DevOps Lead**: devops@vitasang.com
- **Database Admin**: dba@vitasang.com
- **Security Officer**: security@vitasang.com

### Emergency Procedures
- Crash API: `pm2 restart vitasang-api`
- Memory leak: `pm2 kill vitasang-api && pm2 start ecosystem.config.js`
- DB Connection: Vérifier credentials dans .env.production
