import { parseColorToHex } from '../parseColorToHex';

describe('utils', () => {
  describe('parseColorToHex', () => {
    it.each([[], {}, true, undefined, null, Symbol('test')])(
      'should return `false` for non string and number arg',
      (value) => {
        expect(parseColorToHex(value)).toBe(false);
      },
    );

    it('should return `false` if it cannot parse value', () => {
      expect(parseColorToHex('2c2c2e')).toBe(false);
    });

    it('should parse regular hex color', () => {
      expect(parseColorToHex('#2c2c2e')).toBe('#2c2c2e');
    });

    it('should parse short hex color', () => {
      expect(parseColorToHex('#900')).toBe('#990000');
    });

    it('should parse rgb color', () => {
      expect(parseColorToHex('rgb(0, 255, 0)')).toBe('#00ff00');
    });

    it('should parse rgba color', () => {
      expect(parseColorToHex('rgba(0, 255, 0, 0.5)')).toBe('#00ff00');
    });
  });
});
