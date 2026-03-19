const schemas = require('../../validation/schemas');

describe('Joi Validation Schemas', () => {
  describe('Login Schema', () => {
    it('should validate correct login data', () => {
      const data = {
        telephone: '+2376123456789',
        mot_de_passe: 'Password123',
      };
      const { error } = schemas.login.validate(data);
      expect(error).toBeUndefined();
    });

    it('should reject invalid telephone format', () => {
      const data = {
        telephone: 'invalid',
        mot_de_passe: 'Password123',
      };
      const { error } = schemas.login.validate(data);
      expect(error).toBeDefined();
      expect(error.details[0].message).toContain('Format');
    });

    it('should reject short password', () => {
      const data = {
        telephone: '+2376123456789',
        mot_de_passe: 'short',
      };
      const { error } = schemas.login.validate(data);
      expect(error).toBeDefined();
    });

    it('should require both fields', () => {
      const data = { telephone: '+2376123456789' };
      const { error } = schemas.login.validate(data);
      expect(error).toBeDefined();
    });
  });

  describe('Register Schema', () => {
    const validData = {
      nom: 'Dupont',
      prenom: 'Jean',
      telephone: '+2376123456789',
      mot_de_passe: 'Password123',
      groupe_sanguin: 'O+',
    };

    it('should validate correct registration data', () => {
      const { error } = schemas.register.validate(validData);
      expect(error).toBeUndefined();
    });

    it('should reject invalid blood group', () => {
      const data = { ...validData, groupe_sanguin: 'INVALID' };
      const { error } = schemas.register.validate(data);
      expect(error).toBeDefined();
    });

    it('should reject short name', () => {
      const data = { ...validData, nom: 'A' };
      const { error } = schemas.register.validate(data);
      expect(error).toBeDefined();
    });

    it('should reject missing required fields', () => {
      const data = { ...validData };
      delete data.nom;
      const { error } = schemas.register.validate(data);
      expect(error).toBeDefined();
    });
  });

  describe('Create Alert Schema', () => {
    const validData = {
      latitude: 33.5731,
      longitude: -7.5898,
      groupe_sanguin: 'O+',
      urgence: 'URGENT',
      lieu: 'Hôpital Ibn Sina',
      quantite_requise: 5,
    };

    it('should validate correct alert data', () => {
      const { error } = schemas.createAlert.validate(validData);
      expect(error).toBeUndefined();
    });

    it('should accept default radius', () => {
      const { error, value } = schemas.createAlert.validate(validData);
      expect(error).toBeUndefined();
      expect(value.radius).toBe(10);
    });

    it('should reject invalid urgence level', () => {
      const data = { ...validData, urgence: 'SUPER_URGENT' };
      const { error } = schemas.createAlert.validate(data);
      expect(error).toBeDefined();
    });

    it('should reject invalid latitude', () => {
      const data = { ...validData, latitude: 100 };
      const { error } = schemas.createAlert.validate(data);
      expect(error).toBeDefined();
    });

    it('should reject radius > 100', () => {
      const data = { ...validData, radius: 150 };
      const { error } = schemas.createAlert.validate(data);
      expect(error).toBeDefined();
    });

    it('should reject quantite < 1', () => {
      const data = { ...validData, quantite_requise: 0 };
      const { error } = schemas.createAlert.validate(data);
      expect(error).toBeDefined();
    });
  });

  describe('Search Users Schema', () => {
    const validData = {
      latitude: 33.5731,
      longitude: -7.5898,
      groupe_sanguin: 'O+',
      radius: 10,
    };

    it('should validate correct search data', () => {
      const { error } = schemas.searchUsers.validate(validData);
      expect(error).toBeUndefined();
    });

    it('should require all parameters', () => {
      delete validData.groupe_sanguin;
      const { error } = schemas.searchUsers.validate(validData);
      expect(error).toBeDefined();
    });
  });
});
