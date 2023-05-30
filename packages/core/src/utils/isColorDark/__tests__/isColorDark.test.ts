import { isColorDark } from '../isColorDark';

describe('utils', () => {
  describe('isColorDark', () => {
    it('should return `true` if the color is dark', () => {
      const isDark = isColorDark('#023020');

      expect(isDark).toBe(true);
    });

    it('should return `false` if the color is not dark', () => {
      const isDark = isColorDark('#EEDD82');

      expect(isDark).toBe(false);
    });
  });
});
