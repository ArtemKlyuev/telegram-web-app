import { SessionStorage } from '../../sessionStorage';

import { INIT_PARAMS, getWebViewInitParams } from '../getWebViewInitParams';

const hash = '#Hello+World?from=Monday&to=Friday';

describe('utils', () => {
  describe('getWebViewInitParams', () => {
    it('should return init params', () => {
      const spy = jest.spyOn(window.sessionStorage.__proto__, 'setItem');

      expect(spy).not.toHaveBeenCalled();

      const result = getWebViewInitParams(hash);

      expect(result).toStrictEqual({ _path: 'Hello World', from: 'Monday', to: 'Friday' });
      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith(
        SessionStorage.BASE_KEY + INIT_PARAMS,
        JSON.stringify(result),
      );
    });

    it('should update init params with stored params', () => {
      const spy = jest
        .spyOn(window.sessionStorage.__proto__, 'getItem')
        .mockImplementationOnce(() => JSON.stringify({ user: 'John', from: 'Tuesday' }));

      expect(spy).not.toHaveBeenCalled();

      const result = getWebViewInitParams(hash);

      expect(result).toStrictEqual({
        _path: 'Hello World',
        from: 'Monday',
        to: 'Friday',
        user: 'John',
      });
      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith(SessionStorage.BASE_KEY + INIT_PARAMS);
    });
  });
});
