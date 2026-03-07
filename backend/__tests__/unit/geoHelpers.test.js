const { calculateDistance } = require('../../utils/geoHelpers');

describe('GeoHelpers - calculateDistance', () => {
  it('should calculate distance between two coordinates (Haversine formula)', () => {
    // Casablanca coordinates
    const lat1 = 33.5731;
    const lon1 = -7.5898;

    // Rabat coordinates (approximately 90km north)
    const lat2 = 34.0209;
    const lon2 = -6.8416;

    const distance = calculateDistance(lat1, lon1, lat2, lon2);

    // Distance should be approximately 88-92 km
    expect(distance).toBeGreaterThan(85);
    expect(distance).toBeLessThan(95);
  });

  it('should return 0 for same coordinates', () => {
    const distance = calculateDistance(33.5731, -7.5898, 33.5731, -7.5898);
    expect(distance).toBe(0);
  });

  it('should return positive distance', () => {
    const distance = calculateDistance(0, 0, 10, 10);
    expect(distance).toBeGreaterThan(0);
  });

  it('should handle equator crossing', () => {
    const distance = calculateDistance(-10, 0, 10, 0);
    expect(distance).toBeGreaterThan(0);
  });

  it('should be symmetric', () => {
    const distance1 = calculateDistance(10, 20, 30, 40);
    const distance2 = calculateDistance(30, 40, 10, 20);
    expect(distance1).toBeCloseTo(distance2, 5);
  });
});
