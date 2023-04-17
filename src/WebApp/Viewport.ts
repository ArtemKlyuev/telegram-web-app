interface Options {
  mainButtonHeight: number;
  // FIXME: decouple this and use event emitter
  callbacks: {
    webViewCallback: (isStateStable: boolean) => any;
    setCssHeight: (height: string) => any;
    setCssStableHeight: (height: string) => any;
  };
}

export class Viewport {
  #viewportHeight: number | false = false;
  #viewportStableHeight: number | false = false;
  #isExpanded: boolean = true;
  #mainButtonHeight: number;
  #callbacks: Options['callbacks'];

  constructor({ callbacks, mainButtonHeight }: Options) {
    this.#callbacks = callbacks;
    this.#mainButtonHeight = mainButtonHeight;
  }

  #calculateHeight(viewportHeight: number | false): string {
    if (viewportHeight !== false) {
      return viewportHeight - this.#mainButtonHeight + 'px';
    }

    return this.#mainButtonHeight ? `calc(100vh - ${this.#mainButtonHeight}px)` : '100vh';
  }

  setViewportHeight = (
    data?: { is_expanded: boolean; height: number; is_state_stable: boolean } | undefined
  ): void => {
    if (typeof data !== 'undefined') {
      this.#isExpanded = Boolean(data.is_expanded);
      this.#viewportHeight = data.height;

      if (data.is_state_stable) {
        this.#viewportStableHeight = data.height;
      }

      this.#callbacks.webViewCallback(Boolean(data.is_state_stable));
    }

    const height = this.#calculateHeight(this.#viewportHeight);
    const stable_height = this.#calculateHeight(this.#viewportStableHeight);

    this.#callbacks.setCssHeight(height);
    this.#callbacks.setCssStableHeight(stable_height);
  };

  get isExpanded(): boolean {
    return this.#isExpanded;
  }

  get viewportHeight(): number | false {
    return this.#viewportHeight;
  }

  get viewportStableHeight(): number | false {
    return this.#viewportStableHeight;
  }
}
