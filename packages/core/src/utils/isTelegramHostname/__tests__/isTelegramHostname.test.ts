import { isTelegramHostname, VALID_TELEGRAM_HOSTNAMES } from '../isTelegramHostname';

describe('utils', () => {
  describe('isTelegramHostname', () => {
    it.each(VALID_TELEGRAM_HOSTNAMES)(
      'should return `true` for valid telegram hostnames',
      (hostname) => {
        expect(isTelegramHostname(hostname)).toBe(true);
      },
    );

    it.each(VALID_TELEGRAM_HOSTNAMES.map((hostname) => `username.${hostname}`))(
      'should return `true` for valid telegram hostnames with usernames',
      (hostname) => {
        expect(isTelegramHostname(hostname)).toBe(true);
      },
    );

    it('should return `false` for non-valid hostname', () => {
      expect(isTelegramHostname('telegram.org')).toBe(false);
    });
  });
});
