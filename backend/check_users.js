const db = require("./models");

async function check() {
  try {
    const users = await db.Utilisateur.findAll({
      where: { role: 'donneur' },
      include: [{ model: db.ProfilDonneur, as: 'profilDonneur' }]
    });

    console.log("ID | Nom | Groupe | Token (prefix) | Location");
    console.log("-------------------------------------------");
    users.forEach(u => {
      console.log(`${u.id_utilisateur} | ${u.nom} | ${u.profitDonneur?.groupe_sanguin || u.profilDonneur?.groupe_sanguin} | ${u.push_token ? u.push_token.substring(0, 15) : 'NULL'} | ${u.profilDonneur?.lat_actuelle},${u.profilDonneur?.long_actuelle}`);
    });

  } catch (error) {
    console.error("Error:", error);
  } finally {
    process.exit(0);
  }
}

check();
