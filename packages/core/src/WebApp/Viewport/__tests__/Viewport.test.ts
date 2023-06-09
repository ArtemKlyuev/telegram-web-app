import { eventEmitterMock } from '../../../utils/EventEmitter/__mocks__';

import { Viewport, ViewportData } from '../Viewport';

describe('Viewport', () => {
  let viewport: Viewport;

  beforeEach(() => {
    viewport = new Viewport({ eventEmitter: eventEmitterMock, mainButtonHeight: 0 });
  });

  describe('initialization', () => {
    it('should has initial state', () => {
      expect(viewport.isExpanded).toBe(true);
      expect(viewport.height).toBe(window.innerHeight);
      expect(viewport.stableHeight).toBe(window.innerHeight);
    });
  });

  describe('setHeight()', () => {
    it('should set height without data', () => {
      viewport.setHeight();

      expect(eventEmitterMock.emit).toHaveBeenCalledWith(Viewport.EVENTS.HEIGHT_CALCULATED, {
        height: '100vh',
        stableHeight: '100vh',
      });
    });

    it('should set height without data', () => {
      viewport.setHeight();

      expect(eventEmitterMock.emit).toHaveBeenCalledWith(Viewport.EVENTS.HEIGHT_CALCULATED, {
        height: '100vh',
        stableHeight: '100vh',
      });
    });

    it('should set height with data', () => {
      const data: ViewportData = { height: 10, is_expanded: true, is_state_stable: true };

      viewport.setHeight(data);

      expect(viewport.isExpanded).toBe(data.is_expanded);
      expect(viewport.height).toBe(10);
      expect(viewport.stableHeight).toBe(10);
      expect(eventEmitterMock.emit).toHaveBeenCalledWith(
        Viewport.EVENTS.VIEWPORT_CHANGED,
        data.is_state_stable,
      );
      expect(eventEmitterMock.emit).toHaveBeenCalledWith(Viewport.EVENTS.HEIGHT_CALCULATED, {
        height: '10px',
        stableHeight: '10px',
      });
    });

    it('should set height with data and main button height', () => {
      viewport = new Viewport({ eventEmitter: eventEmitterMock, mainButtonHeight: 10 });

      const data: ViewportData = { height: false, is_expanded: true, is_state_stable: true };

      viewport.setHeight(data);

      expect(viewport.isExpanded).toBe(data.is_expanded);
      expect(viewport.height).toBe(window.innerHeight - 10);
      expect(viewport.stableHeight).toBe(window.innerHeight - 10);
      expect(eventEmitterMock.emit).toHaveBeenCalledWith(
        Viewport.EVENTS.VIEWPORT_CHANGED,
        data.is_state_stable,
      );
      expect(eventEmitterMock.emit).toHaveBeenCalledWith(Viewport.EVENTS.HEIGHT_CALCULATED, {
        height: 'calc(100vh - 10px)',
        stableHeight: 'calc(100vh - 10px)',
      });
    });
  });

  describe('on()', () => {
    it('should subscribe to events', () => {
      const listener = jest.fn();

      viewport.on('height_calculated', listener);

      expect(eventEmitterMock.subscribe).toHaveBeenCalledWith('height_calculated', listener);
    });

    it('should return disposer function after subscription', () => {
      const disposerFn = jest.fn();
      eventEmitterMock.subscribe.mockImplementationOnce(() => disposerFn);
      const listener = jest.fn();

      const disposer = viewport.on('height_calculated', listener);

      expect(disposer).toStrictEqual(disposerFn);
    });
  });
});
