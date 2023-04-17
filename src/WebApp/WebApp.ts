import { WebView } from '../WebView';

import { HapticFeedback } from './HapticFeedback';

const COLOR_SCHEMES = {
  LIGHT: 'light',
  DARK: 'dark',
} as const;

export type ColorSchemes = typeof COLOR_SCHEMES;
export type ColorScheme = ColorSchemes[keyof ColorSchemes];

export class WebApp {
  #webAppInitData = '';
  #webAppInitDataUnsafe = {};
  #themeParams = {};
  #colorScheme: ColorScheme = WebApp.COLOR_SCHEMES.LIGHT;
  #webAppVersion = '6.0';
  #webAppPlatform = 'unknown';
  #headerColorKey = 'bg_color';
  #hapticFeedback: HapticFeedback;
  readonly #webAppInvoices = new Map<string, { url: string; callback: any }>();
  readonly #webAppClipboardRequests = new Map<string, { callback: any }>();
  readonly #webView: WebView;

  static readonly COLOR_SCHEMES: ColorSchemes = COLOR_SCHEMES;
  static readonly MAXIMUM_BYTES_TO_SEND = 4096;

  constructor() {
    this.#hapticFeedback = new HapticFeedback(this.#versionAtLeast('6.1'), this.#webView);
  }

  get initData(): string {
    return this.#webAppInitData;
  }

  get initDataUnsafe() {
    return this.#webAppInitDataUnsafe;
  }

  get themeParams() {
    return this.#themeParams;
  }

  get colorScheme(): ColorScheme {
    return this.#colorScheme;
  }

  get version(): string {
    return this.#webAppVersion;
  }

  get platfrom(): string {
    return this.#webAppPlatform;
  }

  get headerColor() {
    return this.#themeParams[this.#headerColorKey] || null;
  }

  get HapticFeedback(): HapticFeedback {
    return this.#hapticFeedback;
  }

  #generateId(length: number): string {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const charsLength = chars.length;
    let id = '';

    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charsLength);
      id += chars[randomIndex];
    }

    return id;
  }

  #byteLength(data: string): number {
    if (window.Blob) {
      try {
        return new Blob([data]).size;
      } catch {}
    }

    let size = data.length;

    for (let i = data.length - 1; i >= 0; i--) {
      const code = data.charCodeAt(i);

      if (code > 0x7f && code <= 0x7ff) {
        size++;
      } else if (code > 0x7ff && code <= 0xffff) {
        size += 2;
      }

      if (code >= 0xdc00 && code <= 0xdfff) {
        i--;
      }
    }

    return size;
  }

  #versionCompare(v1: string = '', v2: string = ''): number {
    if (typeof v1 !== 'string') {
      v1 = '';
    }

    if (typeof v2 !== 'string') {
      v2 = '';
    }

    // trim whitespaces
    const v1Units = v1.replace(/^\s+|\s+$/g, '').split('.');
    const v2Units = v2.replace(/^\s+|\s+$/g, '').split('.');

    const longestVersionString = Math.max(v1Units.length, v2Units.length);

    let p1: number, p2: number;

    for (let i = 0; i < longestVersionString; i++) {
      p1 = parseInt(v1Units[i]) || 0;
      p2 = parseInt(v2Units[i]) || 0;

      if (p1 === p2) {
        continue;
      }

      if (p1 > p2) {
        return 1;
      }

      return -1;
    }

    return 0;
  }

  #versionAtLeast(version: string): boolean {
    return this.#versionCompare(this.#webAppVersion, version) >= 0;
  }

  sendData = (data: string): void => {
    if (!data || !data.length) {
      console.error('[Telegram.WebApp] Data is required', data);
      throw new Error('WebAppDataInvalid');
    }

    if (this.#byteLength(data) > WebApp.MAXIMUM_BYTES_TO_SEND) {
      console.error('[Telegram.WebApp] Data is too long', data);
      throw new Error('WebAppDataInvalid');
    }

    this.#webView.postEvent('web_app_data_send', undefined, { data });
  };

  isVersionAtLeast = (version: string): boolean => {
    return this.#versionAtLeast(version);
  };

  openLink = (
    url: string,
    options: { try_instant_view: any } | undefined = { try_instant_view: undefined }
  ): void => {
    const url2 = new URL(url);

    if (url2.protocol !== 'http:' && url2.protocol !== 'https:') {
      console.error('[Telegram.WebApp] Url protocol is not supported', url);
      throw new Error('WebAppTgUrlInvalid');
    }

    if (this.#versionAtLeast('6.1')) {
      this.#webView.postEvent('web_app_open_link', undefined, {
        url,
        try_instant_view: this.#versionAtLeast('6.4') && Boolean(options.try_instant_view),
      });

      return;
    }

    window.open(url, '_blank');
  };

  openTelegramLink = (url: string): void => {
    const url2 = new URL(url);

    if (url2.protocol !== 'http:' && url2.protocol !== 'https:') {
      console.error('[Telegram.WebApp] Url protocol is not supported', url);
      throw Error('WebAppTgUrlInvalid');
    }

    if (url2.hostname !== 't.me') {
      console.error('[Telegram.WebApp] Url host is not supported', url);
      throw Error('WebAppTgUrlInvalid');
    }

    const fullPath = url2.pathname + url2.search;

    if (this.#webView.isIframe || this.#versionAtLeast('6.1')) {
      this.#webView.postEvent('web_app_open_tg_link', undefined, { path_full: fullPath });
      return;
    }

    location.href = 'https://t.me' + fullPath;
  };

  openInvoice = (url: string, callback: any): void => {
    const url2 = new URL(url);
    let match: string[] | null, slug: string;

    if (
      (url2.protocol !== 'http:' && url2.protocol !== 'https:') ||
      url2.hostname !== 't.me' ||
      !(match = url2.pathname.match(/^\/(\$|invoice\/)([A-Za-z0-9\-_=]+)$/)) ||
      !(slug = match[2])
    ) {
      console.error('[Telegram.WebApp] Invoice url is invalid', url);
      throw Error('WebAppInvoiceUrlInvalid');
    }

    if (!this.#versionAtLeast('6.1')) {
      console.error(
        '[Telegram.WebApp] Method openInvoice is not supported in version ' + this.#webAppVersion
      );
      throw Error('WebAppMethodUnsupported');
    }

    if (this.#webAppInvoices.has(slug)) {
      console.error('[Telegram.WebApp] Invoice is already opened');
      throw new Error('WebAppInvoiceOpened');
    }

    this.#webAppInvoices.set(slug, { url, callback });

    this.#webView.postEvent('web_app_open_invoice', undefined, { slug });
  };

  readTextFromClipboard = (callback: any): void => {
    if (!this.#versionAtLeast('6.4')) {
      console.error(
        '[Telegram.WebApp] Method readTextFromClipboard is not supported in version ' +
          this.#webAppVersion
      );
      throw new Error('WebAppMethodUnsupported');
    }

    const req_id = this.#generateId(16);

    this.#webAppClipboardRequests.set(req_id, { callback });

    this.#webView.postEvent('web_app_read_text_from_clipboard', undefined, { req_id });
  };

  ready = (): void => {
    this.#webView.postEvent('web_app_ready');
  };

  expand = (): void => {
    this.#webView.postEvent('web_app_expand');
  };

  close = (): void => {
    this.#webView.postEvent('web_app_close');
  };
}
