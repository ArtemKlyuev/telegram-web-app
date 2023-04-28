import { ColorScheme, HexColor, ThemeParams, ValueOf } from '../types';
import { Disposer, EventEmitter, isColorDark, parseColorToHex } from '../utils';

type ThemeEvents = typeof THEME_EVENTS;
type ThemeEvent = ValueOf<ThemeEvents>;
type ColorSchemeChangeListener = (newColorScheme: ColorScheme) => void;
type ThemeParamSetListener = (param: keyof Required<ThemeParams>, color: HexColor) => void;
type ThemeParamsChangeListener = (params: ThemeParams) => void;
type ThemeValues = ValueOf<Required<ThemeParams>>;

const THEME_EVENTS = {
  COLOR_SCHEME_CHANGED: 'color_scheme_changed',
  THEME_PARAM_SET: 'theme_param_set',
  THEME_PARAMS_CHANGED: 'theme_params_changed',
} as const;

export const TELEGRAM_THEME = {
  COLOR_SCHEMES: {
    LIGHT: 'light',
    DARK: 'dark',
  },
  PARAMS: {
    BG_COLOR: 'bg_color',
    TEXT_COLOR: 'text_color',
    HINT_COLOR: 'hint_color',
    LINK_COLOR: 'link_color',
    BUTTON_COLOR: 'button_color',
    BUTTON_TEXT_COLOR: 'button_text_color',
    SECONDARY_BG_COLOR: 'secondary_bg_color',
  },
} as const;

export class Theme {
  #eventEmitter: EventEmitter<ThemeEvent>;
  #themeParams = new Map<keyof ThemeParams, ThemeValues>();
  #colorScheme: ColorScheme = TELEGRAM_THEME.COLOR_SCHEMES.LIGHT;

  static get EVENTS() {
    return THEME_EVENTS;
  }
  static get PARAMS_KEYS() {
    return TELEGRAM_THEME.PARAMS;
  }

  constructor(eventEmitter: EventEmitter<ThemeEvent>) {
    this.#eventEmitter = eventEmitter;
  }

  #toJSON = (): ThemeParams => Object.fromEntries(this.#themeParams);

  #defineColorScheme(color: HexColor): ColorScheme {
    return isColorDark(color)
      ? TELEGRAM_THEME.COLOR_SCHEMES.DARK
      : TELEGRAM_THEME.COLOR_SCHEMES.LIGHT;
  }

  #setColorScheme(colorScheme: ColorScheme): void {
    this.#colorScheme = colorScheme;
    this.#eventEmitter.emit(Theme.EVENTS.COLOR_SCHEME_CHANGED, colorScheme);
  }

  on(event: ThemeEvents['COLOR_SCHEME_CHANGED'], listener: ColorSchemeChangeListener): Disposer;
  on(event: ThemeEvents['THEME_PARAM_SET'], listener: ThemeParamSetListener): Disposer;
  on(event: ThemeEvents['THEME_PARAMS_CHANGED'], listener: ThemeParamsChangeListener): Disposer;
  on(
    event: ThemeEvent,
    listener: ColorSchemeChangeListener | ThemeParamSetListener | ThemeParamsChangeListener
  ): Disposer {
    return this.#eventEmitter.subscribe(event, listener);
  }

  getParam<Key extends keyof ThemeParams>(key: Key): Required<ThemeParams>[Key] | null {
    return this.#themeParams.get(key) ?? null;
  }

  setParam<Key extends keyof ThemeParams>(key: Key, value: Required<ThemeParams>[Key]): void {
    this.#themeParams.set(key, value);
  }

  setParams = (params: ThemeParams): void => {
    // temp iOS fix
    if (params.bg_color === '#1c1c1d' && params.bg_color === params.secondary_bg_color) {
      params.secondary_bg_color = '#2c2c2e';
    }

    for (let key in params) {
      const color = parseColorToHex(params[key as keyof ThemeParams]);

      if (color) {
        this.setParam(key as keyof ThemeParams, color);

        if (key === 'bg_color') {
          const colorScheme = this.#defineColorScheme(color);
          this.#setColorScheme(colorScheme);
        }

        this.#eventEmitter.emit(Theme.EVENTS.THEME_PARAM_SET, key, color);
      }
    }

    this.#eventEmitter.emit(Theme.EVENTS.THEME_PARAMS_CHANGED, this.params);
  };

  get params(): ThemeParams {
    return this.#toJSON();
  }

  get colorScheme(): ColorScheme {
    return this.#colorScheme;
  }
}
