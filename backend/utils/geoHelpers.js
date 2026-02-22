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

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

module.exports = {
  calculateDistance,
};
