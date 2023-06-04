import { EventBus, EventEmitter } from '../EventEmitter';

type Events = 'event1' | 'event2';

describe('utils', () => {
  describe('EventEmitter', () => {
    let eventEmitter: EventEmitter<Events>;

    beforeEach(() => {
      eventEmitter = new EventBus();
    });

    it('should add event listener', () => {
      const listener = jest.fn();

      expect(eventEmitter.hasEvent('event1')).toBe(false);

      eventEmitter.subscribe('event1', listener);

      expect(eventEmitter.hasEvent('event1')).toBe(true);
    });

    it('should not emit event listener if there is no such event ', () => {
      expect(() => eventEmitter.emit('event1')).not.toThrow();
    });

    it('should emit event listener', () => {
      const listener = jest.fn();

      eventEmitter.subscribe('event1', listener);
      eventEmitter.emit('event1');

      expect(listener).toBeCalled();
    });

    it('should emit event listener with argument', () => {
      const listener = jest.fn();

      eventEmitter.subscribe('event1', (arg?: string) => listener(arg));
      eventEmitter.emit('event1', 'hello world');

      expect(listener).toBeCalled();
      expect(listener).toHaveBeenCalledWith('hello world');
    });

    it('should emit multiple event listeners', () => {
      const listener1 = jest.fn();
      const listener2 = jest.fn();

      eventEmitter.subscribe('event1', listener1);
      eventEmitter.subscribe('event1', listener2);
      eventEmitter.emit('event1');

      expect(listener1).toBeCalled();
      expect(listener2).toBeCalled();
    });

    it('should emit multiple events', () => {
      const listener1 = jest.fn();
      const listener2 = jest.fn();

      eventEmitter.subscribe('event1', listener1);
      eventEmitter.subscribe('event2', listener2);
      eventEmitter.emit('event1');
      eventEmitter.emit('event2');

      expect(listener1).toBeCalled();
      expect(listener2).toBeCalled();
    });

    it('emit() should return disposer function which unsubscribe from event', () => {
      const listener = jest.fn();

      const disposer = eventEmitter.subscribe('event1', listener);
      eventEmitter.emit('event1');

      expect(listener).toBeCalled();
      expect(listener).toHaveBeenCalledTimes(1);

      disposer();

      eventEmitter.emit('event1');

      expect(listener).toHaveBeenCalledTimes(1);
    });

    it('should unsubscribe from event', () => {
      const listener = jest.fn();

      eventEmitter.subscribe('event1', listener);
      eventEmitter.emit('event1');

      expect(listener).toBeCalled();
      expect(listener).toHaveBeenCalledTimes(1);

      eventEmitter.unsubscribe('event1', listener);

      eventEmitter.emit('event1');

      expect(listener).toHaveBeenCalledTimes(1);
    });

    it('should do nothing when unsubscribing from non-existent event', () => {
      const listener = jest.fn();

      eventEmitter.subscribe('event1', listener);
      eventEmitter.emit('event1');

      expect(listener).toBeCalled();
      expect(listener).toHaveBeenCalledTimes(1);

      eventEmitter.unsubscribe('event1', listener);
      eventEmitter.unsubscribe('event2', listener);

      eventEmitter.emit('event1');

      expect(listener).toHaveBeenCalledTimes(1);
    });
  });
});
