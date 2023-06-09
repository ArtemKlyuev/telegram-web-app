import { ValueOf } from '@typings/utils';

import { Disposer, EventEmitter } from '@utils';

interface Options {
  eventEmitter: EventEmitter<ViewportEvent>;
  mainButtonHeight: number;
}

export interface ViewportData {
  is_expanded: boolean;
  height: number | false;
  is_state_stable: boolean;
}

type ViewportEvent = ValueOf<typeof Viewport.EVENTS>;
type ViewportChangeListener = (isStateStable: boolean) => any;
type HeightCalculatedListener = (params: { height: number; stableHeight: number }) => any;

export class Viewport {
  readonly #eventEmitter: EventEmitter<ViewportEvent>;
  readonly #mainButtonHeight: number;
  #viewportHeight: number | false = false;
  #viewportStableHeight: number | false = false;
  #isExpanded = true;

  static get EVENTS() {
    return {
      VIEWPORT_CHANGED: 'viewport_changed',
      HEIGHT_CALCULATED: 'height_calculated',
    } as const;
  }

  constructor({ eventEmitter, mainButtonHeight }: Options) {
    this.#eventEmitter = eventEmitter;
    this.#mainButtonHeight = mainButtonHeight;
  }

  #calculateCSSHeight(viewportHeight: number | false): string {
    if (viewportHeight !== false) {
      return viewportHeight - this.#mainButtonHeight + 'px';
    }

    return this.#mainButtonHeight ? `calc(100vh - ${this.#mainButtonHeight}px)` : '100vh';
  }

  #calculateViewportHeight(viewportHeight: number | false): number {
    const height = viewportHeight === false ? window.innerHeight : viewportHeight;

    return height - this.#mainButtonHeight;
  }

  on(event: 'height_calculated', listener: HeightCalculatedListener): Disposer;
  on(event: 'viewport_changed', listener: ViewportChangeListener): Disposer;
  on(event: ViewportEvent, listener: HeightCalculatedListener | ViewportChangeListener): Disposer {
    return this.#eventEmitter.subscribe(event, listener);
  }

  setHeight = (data?: ViewportData | undefined): void => {
    if (data) {
      this.#isExpanded = Boolean(data.is_expanded);
      this.#viewportHeight = data.height;

      if (data.is_state_stable) {
        this.#viewportStableHeight = data.height;
      }

      this.#eventEmitter.emit(Viewport.EVENTS.VIEWPORT_CHANGED, Boolean(data.is_state_stable));
    }

    const height = this.#calculateCSSHeight(this.#viewportHeight);
    const stableHeight = this.#calculateCSSHeight(this.#viewportStableHeight);

    this.#eventEmitter.emit(Viewport.EVENTS.HEIGHT_CALCULATED, { height, stableHeight });
  };

  get isExpanded(): boolean {
    return this.#isExpanded;
  }

  get height(): number {
    return this.#calculateViewportHeight(this.#viewportHeight);
  }

  get stableHeight(): number {
    return this.#calculateViewportHeight(this.#viewportStableHeight);
  }
}
