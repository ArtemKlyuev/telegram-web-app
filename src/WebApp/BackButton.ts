import { BackButton, NoParamsCallback, ValueOf } from '../types';
import { Disposer, EventEmitter } from '../utils';
import { bindMethods } from '../utils/decorators';
import { FeatureSupport } from './FeatureSupport';

type ButtonEvents = typeof BUTTON_EVENTS;
type ButtonEvent = ValueOf<ButtonEvents>;
type ButtonCreateListener = () => any;
type ButtonUpdateListener = (params: Required<BackButtonParams>) => any;
type onClickListener = (callback: NoParamsCallback) => any;
type offClickListener = (callback: NoParamsCallback) => any;

interface Options {
  eventEmitter: EventEmitter<ButtonEvent>;
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

export const BACK_BUTTON_EVENTS_KEY = Symbol('EVENTS');
export const BACK_BUTTON_ON_EVENT_KEY = Symbol('on_event');

@FeatureSupport.inVersion<keyof BackButton>({
  availableInVersion: '6.1',
  methodsConfig: ({ appVersion, executeOriginalMethod, isSupported, thisArg }) => {
    if (!isSupported) {
      console.warn(`[Telegram.WebApp] BackButton is not supported in version ${appVersion}`);
      return thisArg;
    }

    executeOriginalMethod();
  },
})
@bindMethods
export class WebAppBackButton implements BackButton {
  readonly #eventEmitter: Options['eventEmitter'];
  #isVisible = false;
  #prevButtonState = this.#isVisible;

  static get [BACK_BUTTON_EVENTS_KEY](): ButtonEvents {
    return BUTTON_EVENTS;
  }

  constructor({ eventEmitter }: Options) {
    this.#eventEmitter = eventEmitter;

    queueMicrotask(() => this.#eventEmitter.emit(BUTTON_EVENTS.CREATED));
  }

  #update() {
    const newState = this.#isVisible;

    if (this.#prevButtonState === newState) {
      return;
    }

    this.#prevButtonState = newState;

    this.#eventEmitter.emit(BUTTON_EVENTS.UPDATED, { is_visible: this.#isVisible });
  }

  #setParams(params: BackButtonParams): this {
    if (typeof params.is_visible !== 'undefined') {
      this.#isVisible = Boolean(params.is_visible);
    }

    this.#update();

    return this;
  }

  [BACK_BUTTON_ON_EVENT_KEY](
    event: ButtonEvents['CREATED'],
    listener: ButtonCreateListener
  ): Disposer;
  [BACK_BUTTON_ON_EVENT_KEY](
    event: ButtonEvents['UPDATED'],
    listener: ButtonUpdateListener
  ): Disposer;
  [BACK_BUTTON_ON_EVENT_KEY](event: ButtonEvents['CLICKED'], listener: onClickListener): Disposer;
  [BACK_BUTTON_ON_EVENT_KEY](
    event: ButtonEvents['OFF_CLICKED'],
    listener: offClickListener
  ): Disposer;
  [BACK_BUTTON_ON_EVENT_KEY](
    event: ButtonEvent,
    listener: ButtonCreateListener | ButtonUpdateListener | onClickListener | offClickListener
  ): Disposer {
    return this.#eventEmitter.subscribe(event, listener);
  }

  onClick(callback: NoParamsCallback): this {
    this.#eventEmitter.emit(BUTTON_EVENTS.CLICKED, callback);

    return this;
  }

  offClick(callback: NoParamsCallback): this {
    this.#eventEmitter.emit(BUTTON_EVENTS.OFF_CLICKED, callback);

    return this;
  }

  show(): this {
    return this.#setParams({ is_visible: true });
  }
  hide(): this {
    return this.#setParams({ is_visible: false });
  }

  get isVisible(): boolean {
    return this.#isVisible;
  }

  set isVisible(visible: boolean | undefined) {
    this.#setParams({ is_visible: visible });
  }
}
