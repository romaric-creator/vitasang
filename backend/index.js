require('dotenv').config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan")
const db = require('./models/index');

const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(morgan('dev'));

const userRoute = require("./routes/users.routes");
const alertRoute = require("./routes/alerts.routes");

app.use("/api/users", userRoute);
app.use("/api/alerts", alertRoute);

// Middleware de gestion d'erreurs global
app.use((err, req, res, next) => {
    console.error(err.stack); // Log l'erreur pour le débogage
    res.status(err.statusCode || 500).json({
        message: err.message || "Une erreur interne du serveur est survenue.",
        details: process.env.NODE_ENV === 'development' ? err.stack : {} // N'expose pas le stack en production
    });
});

db.sequelize.sync({ force: false })
    .then(() => {
        console.log("MariaDB : Connexion réussie et tables synchronisées !");
        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => {
            console.log(`Serveur VITASANG démarré sur : http://localhost:${PORT}`);
        });
    })
    .catch(err => {
        console.error("Erreur de synchronisation MariaDB :", err);
    });