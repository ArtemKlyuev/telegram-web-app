type EventHandler<T = any> = (...value: T[]) => void;

type EventsStorage = Map<string, Set<EventHandler>>;

export type Disposer = () => void;

export interface EventEmitter<Events extends string> {
  emit: (event: Events, ...value: any[]) => void;
  subscribe: (event: Events, listener: EventHandler) => Disposer;
  unsubscribe: (event: Events, listener: EventHandler) => void;
  hasEvent: (event: Events) => boolean;
}

export class EventBus<Events extends string = string> implements EventEmitter<Events> {
  readonly #events: EventsStorage = new Map();

  #addEventListener<T>(event: Events, listener: EventHandler<T>): void {
    const listenersSet = this.#events.get(event)!;
    listenersSet.add(listener);
  }

  #createEventListenersSet<T>(event: Events): void {
    const listenersSet = new Set<EventHandler<T>>();
    this.#events.set(event, listenersSet);
  }

  emit(event: Events, ...value: any[]): void {
    const listener = this.#events.get(event);

    if (!listener) {
      return;
    }

    const evaluateListener = (listener: EventHandler) => listener(...value);
    listener.forEach(evaluateListener);
  }

  subscribe(event: Events, listener: EventHandler): Disposer {
    if (!this.#events.has(event)) {
      this.#createEventListenersSet<EventHandler>(event);
    }

    this.#addEventListener(event, listener);

    return () => this.unsubscribe(event, listener);
  }

  unsubscribe(event: Events, listener: EventHandler): void {
    if (!this.#events.has(event)) {
      return;
    }

    const listenersSet = this.#events.get(event)!;
    listenersSet.delete(listener);
  }

  hasEvent(event: Events): boolean {
    return this.#events.has(event);
  }
}
