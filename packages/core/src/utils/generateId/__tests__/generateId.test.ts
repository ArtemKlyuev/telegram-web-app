import { generateId } from '../generateId';

describe('utils', () => {
  describe('generateId', () => {
    it('should generate id with type of `string`', () => {
      const id = generateId(16);

      expect(typeof id).toBe('string');
    });

    it('should generate id with defined length', () => {
      const length = 16;
      const id = generateId(length);

      expect(id).toHaveLength(length);
    });

    it('should generate different id each time', () => {
      const length = 16;
      const id = generateId(length);
      const id2 = generateId(length);
      const id3 = generateId(length);

      expect(id).not.toEqual(id2);
      expect(id).not.toEqual(id3);
      expect(id2).not.toEqual(id3);
    });
  });
});
