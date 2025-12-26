import { ROLE_EMOJIS, ROLE_DESCRIPTIONS } from '../constants';

describe('constants', () => {
  describe('ROLE_EMOJIS', () => {
    it('should have emoji for all roles', () => {
      expect(ROLE_EMOJIS.Producer).toBeDefined();
      expect(ROLE_EMOJIS.Factory).toBeDefined();
      expect(ROLE_EMOJIS.Retailer).toBeDefined();
      expect(ROLE_EMOJIS.Consumer).toBeDefined();
    });

    it('should return correct emojis', () => {
      expect(ROLE_EMOJIS.Producer).toBe('👨‍🌾');
      expect(ROLE_EMOJIS.Factory).toBe('🏭');
      expect(ROLE_EMOJIS.Retailer).toBe('🏪');
      expect(ROLE_EMOJIS.Consumer).toBe('🛒');
    });
  });

  describe('ROLE_DESCRIPTIONS', () => {
    it('should have description for all roles', () => {
      expect(ROLE_DESCRIPTIONS.Producer).toBeDefined();
      expect(ROLE_DESCRIPTIONS.Factory).toBeDefined();
      expect(ROLE_DESCRIPTIONS.Retailer).toBeDefined();
      expect(ROLE_DESCRIPTIONS.Consumer).toBeDefined();
    });

    it('should return non-empty descriptions', () => {
      expect(ROLE_DESCRIPTIONS.Producer.length).toBeGreaterThan(0);
      expect(ROLE_DESCRIPTIONS.Factory.length).toBeGreaterThan(0);
      expect(ROLE_DESCRIPTIONS.Retailer.length).toBeGreaterThan(0);
      expect(ROLE_DESCRIPTIONS.Consumer.length).toBeGreaterThan(0);
    });

    it('should return descriptions in English', () => {
      expect(ROLE_DESCRIPTIONS.Producer).toContain('produces tokens');
      expect(ROLE_DESCRIPTIONS.Factory).toContain('transforms products');
      expect(ROLE_DESCRIPTIONS.Retailer).toContain('sells products');
      expect(ROLE_DESCRIPTIONS.Consumer).toContain('receives products');
    });
  });
});
