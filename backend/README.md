# Ajout d'un système de journalisation (Logging)

Ce guide explique comment mettre en place un système de journalisation robuste pour cette application Node.js en utilisant `winston` et `morgan`.

- `morgan`: Un middleware pour journaliser les requêtes HTTP.
- `winston`: Une bibliothèque de journalisation polyvalente pour enregistrer des événements applicatifs, des erreurs, etc.

## 1. Installation

Installez les dépendances nécessaires :

```bash
npm install morgan winston
```

## 2. Configuration

### Morgan (Journalisation des requêtes HTTP)

Intégrez `morgan` comme middleware dans votre fichier principal (`index.js` ou `app.js`).

```javascript
const express = require('express');
const morgan = require('morgan');
const app = express();

// Utiliser morgan en mode 'dev' pour des logs colorés et concis pendant le développement
app.use(morgan('dev'));

// ... reste de votre configuration d'application
```

### Winston (Journalisation applicative)

Créez un fichier de configuration pour Winston, par exemple `config/logger.js`.

```javascript
// config/logger.js
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info', // Niveau de log minimum à enregistrer
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: { service: 'vitasang-api' },
  transports: [
    //
    // - Écrire tous les logs de niveau `info` et inférieur dans `combined.log`
    // - Écrire tous les logs de niveau `error` et inférieur dans `error.log`
    //
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

// Si nous ne sommes pas en production, alors journaliser aussi dans la console
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}

module.exports = logger;
```

## 3. Utilisation

Importez et utilisez le logger configuré dans vos contrôleurs, modèles ou autres modules pour enregistrer des informations pertinentes.

**Exemple dans un contrôleur (`controllers/users.controller.js`)**

```javascript
const logger = require('../config/logger'); // Assurez-vous que le chemin est correct

// ...

exports.createUser = (req, res) => {
  try {
    // Votre logique de création d'utilisateur
    logger.info(`Utilisateur créé avec succès: ${req.body.email}`);
    res.status(201).send({ message: 'Utilisateur créé !' });
  } catch (error) {
    logger.error(`Erreur lors de la création de l'utilisateur: ${error.message}`, {
      stack: error.stack,
      requestBody: req.body
    });
    res.status(500).send({ message: 'Erreur interne du serveur.' });
  }
};
```

## Bonnes pratiques

- **Niveaux de log** : Utilisez les niveaux de log de manière appropriée (`error`, `warn`, `info`, `http`, `verbose`, `debug`, `silly`).
- **Logs structurés** : Le format JSON est idéal pour une analyse et une interrogation faciles des logs, en particulier avec des systèmes de gestion de logs centralisés.
- **Ne pas logger d'informations sensibles** : Faites attention à ne pas enregistrer de mots de passe, de clés API ou d'autres données personnelles.
