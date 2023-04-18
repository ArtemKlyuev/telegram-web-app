import { AnyCallback, ValueOf } from '../types';
import { Disposer, EventEmitter } from '../utils';

type ButtonEvents = typeof BUTTON_EVENTS;
type ButtonEvent = ValueOf<ButtonEvents>;
type ButtonCreateListener = () => any;
type ButtonUpdateListener = (params: Required<BackButtonParams>) => any;
type onClickListener = (callback: AnyCallback) => any;
type offClickListener = (callback: AnyCallback) => any;

interface Options {
  eventEmitter: EventEmitter<ButtonEvent>;
  isSupported: boolean;
  webAppVersion: string;
}

interface BackButtonParams {
  is_visible?: boolean | undefined;
}

const BUTTON_EVENTS = {
  CREATED: 'created',
  UPDATED: 'updated',
  CLICKED: 'clicked',
  OFF_CLICKED: 'off_clicked',
} as const;

export class BackButton {
  readonly #eventEmitter: EventEmitter<ButtonEvent>;
  #isVisible = false;
  #isSupported: boolean;
  #webAppVersion: string;
  #prevButtonState = this.#isVisible;

  static readonly EVENTS = BUTTON_EVENTS;

  constructor({ eventEmitter, isSupported, webAppVersion }: Options) {
    this.#eventEmitter = eventEmitter;
    this.#isSupported = isSupported;
    this.#webAppVersion = webAppVersion;

    queueMicrotask(() => this.#eventEmitter.emit(BackButton.EVENTS.CREATED));
  }

  #isButtonSupported(): boolean {
    if (!this.#isSupported) {
      console.warn(
        '[Telegram.WebApp] BackButton is not supported in version ' + this.#webAppVersion
      );
    }

    return this.#isSupported;
  }

  #updateButton() {
    const newState = this.#isVisible;

    if (this.#prevButtonState === newState) {
      return;
    }

    this.#prevButtonState = newState;

    this.#eventEmitter.emit(BackButton.EVENTS.UPDATED, { is_visible: this.#isVisible });
  }

  #setParams(params: BackButtonParams): this {
    if (!this.#isButtonSupported()) {
      return this;
    }

    if (typeof params.is_visible !== 'undefined') {
      this.#isVisible = Boolean(params.is_visible);
    }

    this.#updateButton();

    return this;
  }

  on(event: ButtonEvents['CREATED'], listener: ButtonCreateListener): Disposer;
  on(event: ButtonEvents['UPDATED'], listener: ButtonUpdateListener): Disposer;
  on(event: ButtonEvents['CLICKED'], listener: onClickListener): Disposer;
  on(event: ButtonEvents['OFF_CLICKED'], listener: offClickListener): Disposer;
  on(
    event: ButtonEvent,
    listener: ButtonCreateListener | ButtonUpdateListener | onClickListener | offClickListener
  ): Disposer {
    return this.#eventEmitter.subscribe(event, listener);
  }

  onClick = (callback: AnyCallback): this => {
    if (this.#isButtonSupported()) {
      this.#eventEmitter.emit(BackButton.EVENTS.CLICKED, callback);
    }

    return this;
  };

  offClick = (callback: AnyCallback): this => {
    if (this.#isButtonSupported()) {
      this.#eventEmitter.emit(BackButton.EVENTS.OFF_CLICKED, callback);
    }

    return this;
  };

  show = (): this => this.#setParams({ is_visible: true });
  hide = (): this => this.#setParams({ is_visible: false });

  get isVisible(): boolean {
    return this.#isVisible;
  }

  set isVisible(visible: boolean | undefined) {
    this.#setParams({ is_visible: visible });
  }
}
