import { WebAppClipboard } from '../Clipboard';

describe('Clipboard', () => {
  let clipboard: WebAppClipboard;

  beforeEach(() => {
    clipboard = new WebAppClipboard();
  });

  describe('setRequest()', () => {
    it('should set request with callback', () => {
      const spy = jest.spyOn(Map.prototype, 'set');
      const id = 'id';
      const cb = jest.fn();

      clipboard.setRequest(id, cb);

      expect(spy).toHaveBeenCalledWith(id, cb);
    });

    it('should set without callback', () => {
      const spy = jest.spyOn(Map.prototype, 'set');
      const id = 'id';

      clipboard.setRequest(id);

      expect(spy).toHaveBeenCalledWith(id, null);
    });
  });

  describe('getRequest', () => {
    it('should return request', () => {
      const id = 'id';
      const cb = jest.fn();

      clipboard.setRequest(id, cb);

      const request = clipboard.getRequest(id);

      expect(request).toStrictEqual(cb);
    });

    it('should return `null` if no request finded', () => {
      const request = clipboard.getRequest('id');

      expect(request).toBe(null);
    });
  });

  describe('hasRequest()', () => {
    it('should return `true` if request exist', () => {
      const id = 'id';
      const cb = jest.fn();

      clipboard.setRequest(id, cb);

      expect(clipboard.hasRequest(id)).toBe(true);
    });

    it('should return `false` if request did not exist', () => {
      expect(clipboard.hasRequest('id')).toBe(false);
    });
  });

  describe('removeRequest()', () => {
    it('should remove request', () => {
      const id = 'id';
      const cb = jest.fn();

      clipboard.setRequest(id, cb);

      expect(clipboard.hasRequest(id)).toBe(true);

      clipboard.removeRequest(id);

      expect(clipboard.hasRequest(id)).toBe(false);
    });
  });
});
