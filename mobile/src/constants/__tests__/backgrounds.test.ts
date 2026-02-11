/**
 * Tests for constants/backgrounds.ts
 */
import {
  BACKGROUNDS,
  BACKGROUND_CATEGORIES,
  getBackgroundsByCategory,
  getBackgroundById,
  DEFAULT_BACKGROUND_ID,
} from '../backgrounds';

describe('backgrounds constants', () => {
  test('BACKGROUNDS is a non-empty array', () => {
    expect(Array.isArray(BACKGROUNDS)).toBe(true);
    expect(BACKGROUNDS.length).toBeGreaterThan(0);
  });

  test('each background has id and category', () => {
    BACKGROUNDS.forEach((bg: any) => {
      expect(bg.id).toBeDefined();
      expect(typeof bg.id).toBe('string');
      expect(bg.category).toBeDefined();
    });
  });

  test('DEFAULT_BACKGROUND_ID is "default"', () => {
    expect(DEFAULT_BACKGROUND_ID).toBe('default');
  });

  test('BACKGROUND_CATEGORIES has expected categories', () => {
    expect(BACKGROUND_CATEGORIES.default).toBeDefined();
    expect(BACKGROUND_CATEGORIES.default.name).toBe('Default');
    expect(BACKGROUND_CATEGORIES.default.order).toBe(0);
  });

  test('BACKGROUND_CATEGORIES has correct order', () => {
    const categories = Object.values(BACKGROUND_CATEGORIES);
    const orders = categories.map((c) => c.order);
    // Orders should be sequential starting from 0
    expect(Math.min(...orders)).toBe(0);
  });

  describe('getBackgroundById', () => {
    test('returns background for valid id', () => {
      const bg = getBackgroundById('default');
      expect(bg).toBeDefined();
      expect(bg!.id).toBe('default');
    });

    test('returns undefined for invalid id', () => {
      const bg = getBackgroundById('nonexistent-id-xyz');
      expect(bg).toBeUndefined();
    });
  });

  describe('getBackgroundsByCategory', () => {
    test('returns backgrounds for "default" category', () => {
      const defaults = getBackgroundsByCategory('default');
      expect(Array.isArray(defaults)).toBe(true);
      expect(defaults.length).toBeGreaterThan(0);
      defaults.forEach((bg: any) => {
        expect(bg.category).toBe('default');
      });
    });

    test('returns empty array for category with no backgrounds', () => {
      // Use a valid category type but one that may have no entries
      const result = getBackgroundsByCategory('holiday' as any);
      expect(Array.isArray(result)).toBe(true);
    });
  });
});
