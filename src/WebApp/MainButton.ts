import {
  HexColor,
  MainButton,
  MainButtonParams,
  NoParamsCallback,
  SetupMainButtonEventData,
  ValueOf,
} from '../types';
import { Disposer, EventEmitter, parseColorToHex } from '../utils';

import { MainButtonDebug } from './MainButtonDebug';
import { Theme } from './Theme';

interface Options {
  eventEmitter: EventEmitter<ButtonEvent>;
  theme: Theme;
  isDebug?: boolean | undefined;
}

type ButtonEvents = typeof BUTTON_EVENTS;
type ButtonEvent = ValueOf<ButtonEvents>;

type DebugButtonClickListener = (isActive: boolean) => any;
type DebugButtonUpdateListener = () => any;
type UpdateListener = (params: SetupMainButtonEventData) => any;
type OnClickListener = (callback: NoParamsCallback) => any;
type OffClickListener = (callback: NoParamsCallback) => any;

const BUTTON_EVENTS = {
  DEBUG_BUTTON_CLICKED: 'debug_button_clicked',
  DEBUG_BUTTON_UPDATED: 'debug_button_updated',
  UPDATED: 'updated',
  CLICKED: 'clicked',
  OFF_CLICKED: 'off_clicked',
} as const;

export class WebAppMainButton implements MainButton {
  #eventEmitter: Options['eventEmitter'];
  #theme: Theme;
  #isVisible = false;
  #isActive = true;
  #isProgressVisible = false;
  #buttonText = 'CONTINUE';
  #buttonColor: HexColor | false = false;
  #buttonTextColor: HexColor | false = false;
  #isDebug: boolean;
  #prevButtonState: string | null = null;
  #debugBtn: MainButtonDebug | null = null;

  static get EVENTS() {
    return BUTTON_EVENTS;
  }
  static get MAX_TEXT_LENGTH(): number {
    return 64;
  }
  static get DEFAULT_COLOR(): string {
    return '#2481cc';
  }
  static get DEFAULT_TEXT_COLOR(): string {
    return '#ffffff';
  }

  constructor({ eventEmitter, theme, isDebug = false }: Options) {
    this.#eventEmitter = eventEmitter;
    this.#theme = theme;
    this.#isDebug = isDebug;

    if (isDebug) {
      this.#debugBtn = new MainButtonDebug({
        onClick: () => {
          this.#eventEmitter.emit(WebAppMainButton.EVENTS.DEBUG_BUTTON_CLICKED, this.isActive);
        },
        onUpdate: () => {
          this.#eventEmitter.emit(WebAppMainButton.EVENTS.DEBUG_BUTTON_UPDATED);
        },
      });
    }
  }

  #buttonParams(): SetupMainButtonEventData {
    return {
      is_visible: this.#isVisible,
      is_active: this.#isActive,
      is_progress_visible: this.#isProgressVisible,
      text: this.#buttonText,
      color: this.color,
      text_color: this.textColor,
    };
  }

  #update() {
    const btnParams = this.#buttonParams();
    const newState = JSON.stringify(btnParams);

    if (this.#prevButtonState === newState) {
      return;
    }

    this.#prevButtonState = newState;
    this.#eventEmitter.emit(WebAppMainButton.EVENTS.UPDATED, btnParams);

    if (this.#isDebug) {
      this.#debugBtn!.update(btnParams);
    }
  }

  #isResettedValue(value: string | false | null): boolean {
    return value === false || value === null;
  }

  #setText(value: MainButtonParams['text']): this | never {
    if (typeof value === 'undefined') {
      return this;
    }

    const text = value.trim();

    if (!text.length) {
      console.error('[Telegram.WebApp] Main button text is required', value);
      throw new Error('WebAppMainButtonParamInvalid');
    }

    if (text.length > WebAppMainButton.MAX_TEXT_LENGTH) {
      console.error('[Telegram.WebApp] Main button text is too long', text);
      throw new Error('WebAppMainButtonParamInvalid');
    }

    this.#buttonText = text;

    return this;
  }

  #setButtonColor(value: MainButtonParams['color']): this | never {
    if (typeof value === 'undefined') {
      return this;
    }

    if (this.#isResettedValue(value)) {
      this.#buttonColor = false;
      return this;
    }

    const color = parseColorToHex(value);

    if (!color) {
      console.error('[Telegram.WebApp] Main button color format is invalid', value);
      throw new Error('WebAppMainButtonParamInvalid');
    }

    this.#buttonColor = color;

    return this;
  }

  #setTextColor(value: MainButtonParams['text_color']): this | never {
    if (typeof value === 'undefined') {
      return this;
    }

    if (this.#isResettedValue(value)) {
      this.#buttonTextColor = false;
      return this;
    }

    const textColor = parseColorToHex(value);

    if (!textColor) {
      console.error('[Telegram.WebApp] Main button text color format is invalid', value);

      throw new Error('WebAppMainButtonParamInvalid');
    }

    this.#buttonTextColor = textColor;

    return this;
  }

  #setIsVisible(visible: MainButtonParams['is_visible']): this | never {
    if (typeof visible === 'undefined') {
      return this;
    }

    if (visible && !this.text.length) {
      console.error('[Telegram.WebApp] Main button text is required');
      throw new Error('WebAppMainButtonParamInvalid');
    }

    this.#isVisible = visible;

    return this;
  }

  #setIsActive(active: MainButtonParams['is_active']): this | never {
    if (typeof active === 'undefined') {
      return this;
    }

    this.#isActive = active;

    return this;
  }

  on(event: ButtonEvents['DEBUG_BUTTON_CLICKED'], listener: DebugButtonClickListener): Disposer;
  on(event: ButtonEvents['DEBUG_BUTTON_UPDATED'], listener: DebugButtonUpdateListener): Disposer;
  on(event: ButtonEvents['UPDATED'], listener: UpdateListener): Disposer;
  on(event: ButtonEvents['CLICKED'], listener: OnClickListener): Disposer;
  on(event: ButtonEvents['OFF_CLICKED'], listener: OffClickListener): Disposer;
  on(
    event: ButtonEvent,
    listener:
      | DebugButtonClickListener
      | DebugButtonUpdateListener
      | UpdateListener
      | OnClickListener
      | OffClickListener
  ): Disposer {
    return this.#eventEmitter.subscribe(event, listener);
  }

  set text(text: string) {
    this.setParams({ text });
  }

  get text(): string {
    return this.#buttonText;
  }

  set color(color: HexColor) {
    this.setParams({ color });
  }

  get color(): HexColor {
    return (
      this.#buttonColor ||
      this.#theme.getParam(Theme.PARAMS_KEYS.BUTTON_COLOR) ||
      WebAppMainButton.DEFAULT_COLOR
    );
  }

  set textColor(value: HexColor) {
    this.setParams({ text_color: value });
  }

  get textColor(): HexColor {
    return (
      this.#buttonTextColor ||
      this.#theme.getParam(Theme.PARAMS_KEYS.BUTTON_TEXT_COLOR) ||
      WebAppMainButton.DEFAULT_TEXT_COLOR
    );
  }

  set isVisible(visible: boolean) {
    this.setParams({ is_visible: visible });
  }

  get isVisible(): boolean {
    return this.#isVisible;
  }

  get isProgressVisible(): boolean {
    return this.#isProgressVisible;
  }

  set isActive(active: boolean) {
    this.setParams({ is_active: active });
  }

  get isActive(): boolean {
    return this.#isActive;
  }

  setParams = (params: MainButtonParams): this | never => {
    this.#setText(params.text)
      .#setButtonColor(params.color)
      .#setTextColor(params.text_color)
      .#setIsVisible(params.is_visible)
      .#setIsActive(params.is_active)
      .#update();

    return this;
  };

  setText = (text: string): this => this.setParams({ text });

  onClick = (callback: NoParamsCallback): this => {
    this.#eventEmitter.emit(WebAppMainButton.EVENTS.CLICKED, callback);
    return this;
  };

  offClick = (callback: NoParamsCallback): this => {
    this.#eventEmitter.emit(WebAppMainButton.EVENTS.OFF_CLICKED, callback);

    return this;
  };

  show = (): this => this.setParams({ is_visible: true });
  hide = (): this => this.setParams({ is_visible: false });
  enable = (): this => this.setParams({ is_active: true });
  disable = (): this => this.setParams({ is_active: false });

  showProgress = (leaveActive: boolean): this => {
    this.isActive = Boolean(leaveActive);
    this.#isProgressVisible = true;
    this.#update();

    return this;
  };

  hideProgress = (): this => {
    if (!this.isActive) {
      this.isActive = true;
    }

    this.#isProgressVisible = false;
    this.#update();

    return this;
  };
}
