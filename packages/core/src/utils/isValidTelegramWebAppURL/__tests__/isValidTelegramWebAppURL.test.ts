import { isValidTelegramWebAppURL } from '../isValidTelegramWebAppURL';

describe('utils', () => {
  describe('isValidTelegramWebAppURL', () => {
    it.each([
      { url: 'ftp://t.me/user', reason: 'protocol' },
      { url: 'https://telegram.com', reason: 'hostname' },
    ])('should return false validation for invalid $reason', ({ url }) => {
      const result = isValidTelegramWebAppURL(url);

      expect(result.valid).toBe(false);
      // @ts-expect-error `valid` should be `false`, so `reason` prop should exist
      expect(typeof result.reason).toBe('string');
      // @ts-expect-error `valid` should be `false`, so `reason` prop should exist
      expect(result.reason.length).toBeGreaterThan(0);
    });

    it('should return `true` for valid telegram url', () => {
      const result = isValidTelegramWebAppURL('https://t.me/user');
      expect(result.valid).toBe(true);
    });
  });
});
