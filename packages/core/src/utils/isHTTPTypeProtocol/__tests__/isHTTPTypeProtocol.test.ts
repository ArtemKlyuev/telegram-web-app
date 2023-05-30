import { isHTTPTypeProtocol } from '../isHTTPTypeProtocol';

describe('utils', () => {
  describe('isHTTPTypeProtocol', () => {
    it('should return `true` if the protocol is `http`', () => {
      const isHTTP = isHTTPTypeProtocol('http:');

      expect(isHTTP).toBe(true);
    });

    it('should return `true` if the protocol is `https`', () => {
      const isHTTP = isHTTPTypeProtocol('https:');

      expect(isHTTP).toBe(true);
    });

    it('should return `false` if the protocol is not `http` or `https`', () => {
      const isHTTP = isHTTPTypeProtocol('ftp:');

      expect(isHTTP).toBe(false);
    });
  });
});
