import { eventEmitterMock } from '../../../utils/EventEmitter/__mocks__';

import { BackgroundColor } from '../BackgroundColor';

const THEME = { bg_color: '#2c2c2e', secondary_bg_color: '#900' };

describe('BackgroundColor', () => {
  let bgColor: BackgroundColor;

  beforeEach(() => {
    bgColor = new BackgroundColor({
      eventEmitter: eventEmitterMock,
      themeParams: jest.fn().mockImplementation(() => THEME),
    });
  });

  describe('get()', () => {
    it('shoud return initial color', () => {
      const color = bgColor.get();

      expect(color).toBe(THEME.bg_color);
    });
  });

  describe('set()', () => {
    it('shoud set color by `secondary_bg_color` key', () => {
      const color1 = bgColor.get();

      expect(color1).toBe(THEME.bg_color);

      bgColor.set('secondary_bg_color');
      const color2 = bgColor.get();

      expect(color2).toBe(THEME.secondary_bg_color);
    });

    it('shoud set color by `bg_color` key', () => {
      bgColor.set('secondary_bg_color');
      bgColor.set('bg_color');
      const color = bgColor.get();

      expect(color).toBe(THEME.bg_color);
    });

    it('shoud set color by value', () => {
      bgColor.set('#fff');

      const color = bgColor.get();

      expect(color).toBe('#ffffff');
    });

    it('shoud throw error if trying to set invalid color', () => {
      expect(() => bgColor.set('foo')).toThrowError();
    });
  });

  describe('on()', () => {
    it.each(Object.values(BackgroundColor.EVENTS))('should subscribe to `%s` event', (event) => {
      const listener = jest.fn();
      bgColor.on(event, listener);

      expect(eventEmitterMock.subscribe).toHaveBeenCalledTimes(1);
      expect(eventEmitterMock.subscribe).toHaveBeenCalledWith(event, listener);
    });
  });

  describe('update()', () => {
    it('should update if `appBackgroundColor` is not equal to `backgroundColorKeyOrColor`', () => {
      expect(eventEmitterMock.emit).not.toHaveBeenCalled();

      bgColor.update();

      expect(eventEmitterMock.emit).toHaveBeenCalledTimes(1);
      expect(eventEmitterMock.emit).toHaveBeenCalledWith(
        BackgroundColor.EVENTS.UPDATED,
        bgColor.get(),
      );
    });

    it('should not update if `appBackgroundColor` is equal to `backgroundColorKeyOrColor`', () => {
      expect(eventEmitterMock.emit).not.toHaveBeenCalled();

      bgColor.update();

      expect(eventEmitterMock.emit).toHaveBeenCalledTimes(1);

      bgColor.set('bg_color');

      expect(eventEmitterMock.emit).toHaveBeenCalledTimes(1);
    });
  });
});
