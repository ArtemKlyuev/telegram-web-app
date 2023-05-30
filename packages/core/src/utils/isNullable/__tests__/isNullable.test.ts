import { isNullable } from '../isNullable';

describe('utils', () => {
  describe('isNullable', () => {
    it.each([undefined, null])('should return `true` if value is `%s`', (value) => {
      expect(isNullable(value)).toBe(true);
    });

    it.each([{}, [], 0, false])('should return `false` if value is `%s`', (value) => {
      expect(isNullable(value)).toBe(false);
    });
  });
});
