import { HexColor } from '../types';
import { WebView } from '../WebView';
import { parseColorToHex } from '../utils';

import { HeaderBgColor, ThemeParams } from './types';
import { HEADER_COLOR_KEYS } from './constants';

interface Options {
  isSupported: boolean;
  webAppVersion: string;
  webView: WebView;
  themeParams: ThemeParams;
}

export class BackgroundColor {
  #backgroundColorKeyOrColor: HeaderBgColor | HexColor = HEADER_COLOR_KEYS.BG_COLOR;
  readonly #isSupported: boolean;
  readonly #webAppVersion: string;
  readonly #webView: WebView;
  readonly #themeParams: ThemeParams;
  #appBackgroundColor: HexColor | null | undefined = null;

  constructor({ isSupported, webAppVersion, webView, themeParams }: Options) {
    this.#isSupported = isSupported;
    this.#webAppVersion = webAppVersion;
    this.#webView = webView;
    this.#themeParams = themeParams;
  }

  getBackgroundColor = (): HexColor | undefined => {
    if (this.#backgroundColorKeyOrColor === HEADER_COLOR_KEYS.SECONDARY_BG_COLOR) {
      return this.#themeParams.secondary_bg_color;
    }

    if (this.#backgroundColorKeyOrColor === HEADER_COLOR_KEYS.BG_COLOR) {
      return this.#themeParams.bg_color;
    }

    return this.#backgroundColorKeyOrColor;
  };

  updateBackgroundColor = (): void => {
    const color = this.getBackgroundColor();

    // FIXME `!=`
    if (this.#appBackgroundColor != color) {
      this.#appBackgroundColor = color;
      this.#webView.postEvent('web_app_set_background_color', undefined, { color });
    }
  };

  #getBgColor(color: HeaderBgColor | string): HeaderBgColor | HexColor {
    if (color === HEADER_COLOR_KEYS.BG_COLOR || color === HEADER_COLOR_KEYS.SECONDARY_BG_COLOR) {
      return color;
    }

    const bgColor = parseColorToHex(color);

    if (!bgColor) {
      console.error('[Telegram.WebApp] Background color format is invalid', color);
      throw new Error('WebAppBackgroundColorInvalid');
    }

    return bgColor;
  }

  setBackgroundColor = (color: HeaderBgColor | string): void => {
    if (!this.#isSupported) {
      console.warn(
        '[Telegram.WebApp] Background color is not supported in version ' + this.#webAppVersion
      );
      return;
    }

    this.#backgroundColorKeyOrColor = this.#getBgColor(color);
    this.updateBackgroundColor();
  };
}
