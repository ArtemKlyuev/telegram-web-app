import { eventEmitterMock } from '../../../utils/EventEmitter/__mocks__';

import { TELEGRAM_THEME, Theme } from '../Theme';

describe('Theme', () => {
  let theme: Theme;

  beforeEach(() => {
    theme = new Theme(eventEmitterMock);
  });

  describe('first', () => {
    describe('getters', () => {
      it('should return color scheme', () => {
        expect(theme.colorScheme).toBe(TELEGRAM_THEME.COLOR_SCHEMES.LIGHT);
      });
    });

    describe('setParam()', () => {
      it('should set param', () => {
        // const spy = jest.spyOn(Map.prototype, 'set');

        theme.setParam('bg_color', '#990000');

        expect(theme.params.bg_color).toBe('#990000');

        // expect(spy).toHaveBeenCalledWith('bg_color', '#990000');
      });
    });

    describe('getParam()', () => {
      it('should get param', () => {
        theme.setParam('bg_color', '#990000');

        const bgColor = theme.getParam('bg_color');

        expect(bgColor).toBe('#990000');
      });

      it('should return `null` if no param finded', () => {
        const bgColor = theme.getParam('bg_color');

        expect(bgColor).toBe(null);
      });
    });

    describe('on()', () => {
      it('should subscribe to events', () => {
        const listener = jest.fn();
        theme.on('color_scheme_changed', listener);

        expect(eventEmitterMock.subscribe).toHaveBeenCalledWith('color_scheme_changed', listener);
      });

      it('should return disposer function', () => {
        const disposerFn = jest.fn();
        eventEmitterMock.subscribe.mockReturnValueOnce(disposerFn);
        const listener = jest.fn();
        const disposer = theme.on('color_scheme_changed', listener);

        expect(disposer).toStrictEqual(disposerFn);
      });
    });

    describe('setParams()', () => {
      it('should apply iOS fix', () => {
        const params = {
          bg_color: '#1c1c1d',
          secondary_bg_color: '#1c1c1d',
        };

        expect(params.bg_color).toBe('#1c1c1d');
        expect(params.secondary_bg_color).toBe('#1c1c1d');

        theme.setParams(params);

        expect(params.bg_color).toBe('#1c1c1d');
        expect(params.secondary_bg_color).toBe('#2c2c2e');
      });

      it('should set params', () => {
        const params = {
          bg_color: '#1c1c1d',
          secondary_bg_color: '#2c2c2e',
        };

        expect(theme.params.bg_color).toBeUndefined();
        expect(theme.params.secondary_bg_color).toBeUndefined();

        theme.setParams(params);

        expect(theme.params.bg_color).toBe('#1c1c1d');
        expect(theme.params.secondary_bg_color).toBe('#2c2c2e');
      });

      it('should update color scheme', () => {
        const params = {
          bg_color: '#1c1c1d',
          secondary_bg_color: '#2c2c2e',
        };

        expect(theme.colorScheme).toBe(TELEGRAM_THEME.COLOR_SCHEMES.LIGHT);

        theme.setParams(params);

        expect(theme.colorScheme).toBe(TELEGRAM_THEME.COLOR_SCHEMES.DARK);
      });

      it('should notify about color scheme change', () => {
        const params = {
          bg_color: '#1c1c1d',
          secondary_bg_color: '#2c2c2e',
        };

        theme.setParams(params);

        expect(eventEmitterMock.emit.mock.calls[0]).toStrictEqual([
          Theme.EVENTS.COLOR_SCHEME_CHANGED,
          TELEGRAM_THEME.COLOR_SCHEMES.DARK,
        ]);
      });

      it('should notify about param update', () => {
        const params = {
          bg_color: '#1c1c1d',
          secondary_bg_color: '#2c2c2e',
        };

        theme.setParams(params);

        expect(eventEmitterMock.emit).toHaveBeenCalledTimes(4);
        expect(eventEmitterMock.emit.mock.calls[1]).toStrictEqual([
          Theme.EVENTS.THEME_PARAM_SET,
          'bg_color',
          '#1c1c1d',
        ]);
        expect(eventEmitterMock.emit.mock.calls[2]).toStrictEqual([
          Theme.EVENTS.THEME_PARAM_SET,
          'secondary_bg_color',
          '#2c2c2e',
        ]);
      });

      it('should notify about theme params change', () => {
        const params = {
          bg_color: '#1c1c1d',
          secondary_bg_color: '#2c2c2e',
        };

        theme.setParams(params);

        expect(eventEmitterMock.emit).lastCalledWith(
          Theme.EVENTS.THEME_PARAMS_CHANGED,
          theme.params,
        );
      });
    });
  });
});
