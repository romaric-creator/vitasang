/**
 * Convertit des degrés en radians.
 * @param {number} deg
 * @returns {number}
 */
function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

/**
 * Calcule la distance entre deux points GPS en utilisant la formule de Haversine.
 * @param {number} lat1 Latitude du point 1
 * @param {number} lon1 Longitude du point 1
 * @param {number} lat2 Latitude du point 2
 * @param {number} lon2 Longitude du point 2
 * @returns {number} La distance en kilomètres.
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Rayon de la Terre en kilomètres
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance en km
  return distance;
}

/**
 * Calcule un rectangle (Bounding Box) autour d'un point GPS pour un pré-filtrage rapide en SQL.
 * C'est beaucoup plus rapide qu'un calcul trigonométrique sur chaque ligne.
 * @param {number} lat Latitude du centre
 * @param {number} lon Longitude du centre
 * @param {number} radiusKm Rayon de recherche en kilomètres
 */
function getBoundingBox(lat, lon, radiusKm) {
  const R = 6371; // Rayon de la Terre
  const dLat = (radiusKm / R) * (180 / Math.PI);
  const dLon = (radiusKm / (R * Math.cos((Math.PI * lat) / 180))) * (180 / Math.PI);

  return {
    minLat: lat - dLat,
    maxLat: lat + dLat,
    minLon: lon - dLon,
    maxLon: lon + dLon,
  };
}

/**
 * Retourne la clause SQL Haversine pour calculer la distance dans une requête.
 * @param {number} lat Latitude cible
 * @param {number} lng Longitude cible
 * @param {string} tableAlias Alias de la table contenant les colonnes lat/long
 * @param {string} latCol Nom de la colonne latitude (défaut: 'latitude')
 * @param {string} lngCol Nom de la colonne longitude (défaut: 'longitude')
 */
function haversineSQL(lat, lng, tableAlias = "", latCol = "latitude", lngCol = "longitude") {
  const prefix = tableAlias ? `\`${tableAlias}\`.` : "";
  // SQLite ne supporte pas LEAST/GREATEST par défaut. On utilise une version plus simple
  // qui fonctionne sur MySQL/MariaDB et SQLite (les erreurs de précision sont minimes pour de courtes distances)
  return `(
    6371 * acos(
      cos(radians(${lat})) * cos(radians(${prefix}\`${latCol}\`)) *
      cos(radians(${prefix}\`${lngCol}\`) - radians(${lng})) +
      sin(radians(${lat})) * sin(radians(${prefix}\`${latCol}\`))
    )
  )`;
}

module.exports = {
  calculateDistance,
  haversineSQL,
  getBoundingBox
};
