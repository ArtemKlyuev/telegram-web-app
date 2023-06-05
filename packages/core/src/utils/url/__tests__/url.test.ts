import {
  urlParseHashParams,
  urlAppendHashParams,
  urlParseQueryString,
  urlSafeDecode,
} from '../url';

describe('utils', () => {
  describe('urlSafeDecode', () => {
    it('should decode string', () => {
      const spy = jest.spyOn(window, 'decodeURIComponent');

      expect(spy).not.toHaveBeenCalled();

      const result = urlSafeDecode('Hello+World');

      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith('Hello%20World');
      expect(result).toBe('Hello World');
    });

    it('should return initial arg if throw error', () => {
      const spy = jest.spyOn(window, 'decodeURIComponent');

      expect(spy).not.toHaveBeenCalled();

      const result = urlSafeDecode('Hello%E0%A4%AWorld');

      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith('Hello%E0%A4%AWorld');
      expect(result).toBe('Hello%E0%A4%AWorld');
    });
  });

  describe('urlParseQueryString', () => {
    it('should return empty object if no query string provided', () => {
      const result = urlParseQueryString('');

      expect(result).toStrictEqual({});
    });

    it('should parse query string', () => {
      const stringifiedData = JSON.stringify({ id: 1 });

      const url = new URL('https://google.com');
      url.searchParams.append('from', 'Monday');
      url.searchParams.append('to', 'Friday');
      url.searchParams.append('data', stringifiedData);

      const result = urlParseQueryString(url.searchParams.toString());

      expect(result).toStrictEqual({
        from: 'Monday',
        to: 'Friday',
        data: stringifiedData,
      });
    });

    it('should parse query string without value', () => {
      const result = urlParseQueryString('from');

      expect(result).toStrictEqual({ from: null });
    });

    it('should parse query string with empty value', () => {
      const result = urlParseQueryString('from=');

      expect(result).toStrictEqual({ from: '' });
    });
  });

  describe('urlParseHashParams', () => {
    it('should return empty object if no hash provided', () => {
      const result = urlParseHashParams('#');
      expect(result).toStrictEqual({});
    });

    it('should return { _path }', () => {
      const result = urlParseHashParams('#Hello+World');
      expect(result).toStrictEqual({ _path: 'Hello World' });
    });

    it('should parse hash params with query string', () => {
      const result = urlParseHashParams('#Hello+World?from=Monday&to=Friday');
      expect(result).toStrictEqual({ _path: 'Hello World', from: 'Monday', to: 'Friday' });
    });

    it('should parse hash params with query string without value', () => {
      const result = urlParseHashParams('#Hello+World?query');

      expect(result).toStrictEqual({ _path: 'Hello World', query: null });
    });

    it('should parse hash params with empty query string', () => {
      const result = urlParseHashParams('#Hello+World?');

      expect(result).toStrictEqual({ _path: 'Hello World' });
    });

    it('should parse hash params with equal sign', () => {
      const result = urlParseHashParams('#Hello+World=');

      expect(result).toStrictEqual({ 'Hello World': '' });
    });
  });

  describe('urlAppendHashParams', () => {
    const addHash =
      'tgShareScoreUrl=' +
      window.encodeURIComponent('tgb://share_game_score?hash=very_long_hash123');

    it.each(['https://game.com/path?query=1', 'https://game.com/path'])(
      'should add hash if it is not exist in url',
      (url) => {
        const result = urlAppendHashParams(url, addHash);

        expect(result).toBe(url + '#' + addHash);
      },
    );

    it.each(['https://game.com/#hash=1', 'https://game.com/#path?query'])(
      'should add `&` and `addHash` to existent hash',
      (url) => {
        const result = urlAppendHashParams(url, addHash);

        expect(result).toBe(url + '&' + addHash);
      },
    );

    it('should append query string to hash', () => {
      const url = 'https://game.com/#hash';

      const result = urlAppendHashParams(url, addHash);

      expect(result).toBe(url + '?' + addHash);
    });

    it('should add hash value if only `#` exist', () => {
      const url = 'https://game.com/#';

      const result = urlAppendHashParams(url, addHash);

      expect(result).toBe(url + addHash);
    });
  });
});
