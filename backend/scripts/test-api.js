const axios = require('axios');

const API_URL = 'http://localhost:3000/api';

async function testApi() {
    console.log('--- DÉBUT DES TESTS API ---');

    try {
        // 1. Test Inscription
        console.log('\n1. Test Inscription (Donneur)...');
        const registerData = {
            nom: 'Test',
            prenom: 'User',
            telephone: '670000000',
            mot_de_passe: 'password123',
            role: 'donneur',
            groupe_sanguin: 'O+'
        };

        try {
            const regRes = await axios.post(`${API_URL}/users/register`, registerData);
            console.log('✅ Inscription réussie:', regRes.data.message);
        } catch (err) {
            if (err.response && err.response.status === 409) {
                console.log('ℹ️ Utilisateur déjà existant (continuons le test)');
            } else {
                throw err;
            }
        }

        // 2. Test Connexion
        console.log('\n2. Test Connexion...');
        const loginRes = await axios.post(`${API_URL}/users/login`, {
            telephone: '670000000',
            mot_de_passe: 'password123'
        });

        if (loginRes.data.token && loginRes.data.user) {
            console.log('✅ Connexion réussie ! Token reçu.');
            console.log('Données utilisateur reçues:', JSON.stringify(loginRes.data.user, null, 2));
        } else {
            console.error('❌ Erreur: Réponse de connexion incomplète');
        }

    } catch (error) {
        console.error('❌ ÉCHEC DU TEST:', error.response ? error.response.data : error.message);
    }

    console.log('\n--- FIN DES TESTS ---');
}

testApi();
