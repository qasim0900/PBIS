import { describe, it, expect } from 'vitest';
import {
  calculateOrderQuantity,
  calculateOrderUnits,
  getInventoryStatus,
  getStatusColor,
} from '../utils/calculations';

describe('Calculation Utilities', () => {
  describe('calculateOrderQuantity', () => {
    it('should calculate quantity needed to reach par level', () => {
      expect(calculateOrderQuantity(100, 30)).toBe(70);
    });

    it('should return 0 if current > par', () => {
      expect(calculateOrderQuantity(50, 100)).toBe(0);
    });
  });

  describe('calculateOrderUnits', () => {
    it('should round up order units', () => {
      expect(calculateOrderUnits(100, 12)).toBe(9);
    });

    it('should respect minimum order quantity', () => {
      expect(calculateOrderUnits(5, 12, 3)).toBe(3);
    });
  });

  describe('getInventoryStatus', () => {
    it('should return critical when below order point', () => {
      expect(getInventoryStatus(5, 10, 50)).toBe('critical');
    });

    it('should return warning when between order point and par', () => {
      expect(getInventoryStatus(25, 10, 50)).toBe('warning');
    });

    it('should return ok when above par', () => {
      expect(getInventoryStatus(60, 10, 50)).toBe('ok');
    });
  });

  describe('getStatusColor', () => {
    it('should return red for critical', () => {
      expect(getStatusColor('critical')).toBe('#ef4444');
    });

    it('should return yellow for warning', () => {
      expect(getStatusColor('warning')).toBe('#f59e0b');
    });

    it('should return green for ok', () => {
      expect(getStatusColor('ok')).toBe('#22c55e');
    });
  });
});
