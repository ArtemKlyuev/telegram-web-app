import { SessionStorage } from '../sessionStorage';

describe('utils', () => {
  describe('sessionStorage', () => {
    it('should set sessionStorage key-value', () => {
      const setItemSpy = jest.spyOn(window.sessionStorage.__proto__, 'setItem');

      expect(setItemSpy).toHaveBeenCalledTimes(0);

      SessionStorage.set('key', true);

      expect(setItemSpy).toHaveBeenCalledTimes(1);
      expect(setItemSpy).toHaveBeenCalledWith(SessionStorage.BASE_KEY + 'key', 'true');
    });

    it('should set retrieve value from sessionStorage', () => {
      const getItemSpy = jest
        .spyOn(window.sessionStorage.__proto__, 'getItem')
        .mockImplementationOnce(() => true);

      expect(getItemSpy).toHaveBeenCalledTimes(0);

      const value = SessionStorage.get('key');

      expect(getItemSpy).toHaveBeenCalledTimes(1);
      expect(getItemSpy).toHaveBeenCalledWith(SessionStorage.BASE_KEY + 'key');
      expect(value).toBe(true);
    });
  });
});
