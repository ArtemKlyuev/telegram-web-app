import { AnyCallback, HexColor, InitParams } from '../types';
import {
  byteLength,
  generateId,
  isHTTPTypeProtocol,
  isTelegramHostname,
  parseColorToHex,
  SessionStorage,
} from '../utils';
import { WebView } from '../WebView';

import {
  ColorScheme,
  ColorSchemes,
  HeaderBgColor,
  ThemeParams,
  WebViewEvent,
  WebViewEventParams,
} from './types';
import { COLOR_SCHEMES, HEADER_COLOR_KEYS } from './constants';
import { BackButton } from './BackButton';
import { BackgroundColor } from './BackgroundColor';
import { HapticFeedback } from './HapticFeedback';
import { InitData } from './InitData';
import { MainButton } from './MainButton';
import { Theme } from './Theme';
import { Viewport, ViewportData } from './Viewport';
import { Version } from './Version';
import { Invoices } from './Invoices';

export class WebApp {
  readonly #webAppPlatform: string = 'unknown';
  #headerColorKey: HeaderBgColor = HEADER_COLOR_KEYS.BG_COLOR;
  #lastWindowHeight = window.innerHeight;
  #isClosingConfirmationEnabled = false;
  readonly #webAppClipboardRequests = new Map<string, { callback: AnyCallback }>();
  readonly #initData: InitData;
  readonly #version: Version;
  readonly #theme: Theme;
  readonly #hapticFeedback: HapticFeedback;
  readonly #webView: WebView;
  readonly #bgColor: BackgroundColor;
  readonly #viewport: Viewport;
  readonly #backButton: BackButton;
  readonly #mainButton: MainButton;
  readonly #invoices: Invoices;

  static readonly COLOR_SCHEMES: ColorSchemes = COLOR_SCHEMES;
  static readonly MAXIMUM_BYTES_TO_SEND = 4096;

  #initMainButton(): void {
    const onMainButtonClick = (isActive: boolean): void => {
      if (isActive) {
        this.#receiveWebViewEvent('mainButtonClicked');
      }
    };

    this.#webView.onEvent('main_button_pressed', () => {
      onMainButtonClick(this.#mainButton.isActive);
    });

    this.#mainButton.on(MainButton.EVENTS.DEBUG_BUTTON_CLICKED, onMainButtonClick);

    this.#mainButton.on(MainButton.EVENTS.DEBUG_BUTTON_UPDATED, this.#viewport.setViewportHeight);

    this.#mainButton.on(MainButton.EVENTS.UPDATED, (params) => {
      this.#webView.postEvent('web_app_setup_main_button', undefined, params);
    });

    this.#mainButton.on(MainButton.EVENTS.CLICKED, (callback) => {
      this.#onWebViewEvent('mainButtonClicked', callback);
    });

    this.#mainButton.on(MainButton.EVENTS.OFF_CLICKED, (callback) => {
      this.#offWebViewEvent('mainButtonClicked', callback);
    });
  }

  #initBackButton(): void {
    this.#backButton.on(BackButton.EVENTS.CREATED, () => {
      this.#webView.onEvent('back_button_pressed', () => {
        this.#receiveWebViewEvent('backButtonClicked');
      });
    });

    this.#backButton.on(BackButton.EVENTS.UPDATED, (params) => {
      this.#webView.postEvent('web_app_setup_back_button', undefined, params);
    });

    this.#backButton.on(BackButton.EVENTS.CLICKED, (callback) => {
      this.#onWebViewEvent('backButtonClicked', callback);
    });

    this.#backButton.on(BackButton.EVENTS.OFF_CLICKED, (callback) => {
      this.#offWebViewEvent('backButtonClicked', callback);
    });
  }

  #initTheme(rawTheme: InitParams['tgWebAppThemeParams']): void {
    this.#theme.on(Theme.EVENTS.COLOR_SCHEME_CHANGED, (colorScheme) =>
      this.#setCssVar('color-scheme', colorScheme)
    );

    this.#theme.on(Theme.EVENTS.THEME_PARAMS_CHANGED, (themeParams) =>
      SessionStorage.set('themeParams', themeParams)
    );

    this.#theme.on(Theme.EVENTS.THEME_PARAM_SET, (param, value) => {
      const cssVar = 'theme-' + param.split('_').join('-');
      this.#setCssVar(cssVar, value);
    });

    if (rawTheme) {
      try {
        const parsedThemeParams = JSON.parse(rawTheme);

        if (parsedThemeParams) {
          this.#theme.setParams(parsedThemeParams);
        }
      } catch {}
    }

    const themeParams = SessionStorage.get('themeParams');
    if (themeParams) {
      this.#theme.setParams(themeParams);
    }
  }

  constructor(
    initData: InitData,
    version: Version,
    webView: WebView,
    bgColor: BackgroundColor,
    viewport: Viewport,
    theme: Theme,
    backButton: BackButton,
    mainButton: MainButton,
    invoices: Invoices
  ) {
    this.#initData = initData;
    this.#version = version;
    this.#webView = webView;
    this.#bgColor = bgColor;
    this.#viewport = viewport;
    this.#hapticFeedback = new HapticFeedback(this.#version.isSuitableTo('6.1'), this.#webView);

    this.#backButton = backButton;
    this.#initBackButton();

    this.#mainButton = mainButton;
    this.#initMainButton();

    const { initParams } = this.#webView;

    this.#theme = theme;
    this.#initTheme(initParams.tgWebAppThemeParams);

    if (initParams.tgWebAppVersion) {
      this.#version.set(initParams.tgWebAppVersion);
    }

    if (initParams.tgWebAppPlatform) {
      this.#webAppPlatform = initParams.tgWebAppPlatform;
    }

    this.#invoices = invoices;


    window.addEventListener('resize', this.#onWindowResize);
    if (this.#webView.isIframe) {
      document.addEventListener('click', this.#linkHandler);
    }

    this.#webView.onEvent('theme_changed', this.#onThemeChanged);
    this.#webView.onEvent('viewport_changed', this.#onViewportChanged);
    this.#webView.onEvent('invoice_closed', this.#onInvoiceClosed);
    this.#webView.onEvent('settings_button_pressed', this.#onSettingsButtonPressed);
  }

  get initData(): string {
    return this.#initData.rawData;
  }

  get initDataUnsafe() {
    return this.#initData.unsafeData;
  }

  get themeParams(): ThemeParams {
    return this.#theme.params;
  }

  get colorScheme(): ColorScheme {
    return this.#theme.colorScheme;
  }

  get version(): string {
    return this.#version.value;
  }

  get platfrom(): string {
    return this.#webAppPlatform;
  }

  set headerColor(value: HeaderBgColor | string) {
    this.setHeaderColor(value);
  }

  // @ts-expect-error different getter and setter types, but it's ok
  get headerColor(): HexColor | null {
    return this.#theme.getParam(this.#headerColorKey);
  }

  set backgroundColor(color: HeaderBgColor | string) {
    this.#bgColor.setBackgroundColor(color);
  }

  // @ts-expect-error different getter and setter types, but it's ok
  get backgroundColor(): HexColor | undefined {
    return this.#bgColor.getBackgroundColor();
  }

  get HapticFeedback(): HapticFeedback {
    return this.#hapticFeedback;
  }

  get BackButton(): BackButton {
    return this.#backButton;
  }

  get MainButton(): MainButton {
    return this.#mainButton;
  }

  get viewportHeight(): number {
    return this.#viewport.viewportHeight;
  }

  get viewportStableHeight(): number {
    return this.#viewport.viewportStableHeight;
  }

  get isExpanded(): boolean {
    return this.#viewport.isExpanded;
  }

  set isClosingConfirmationEnabled(isEnabled: boolean) {
    this.#setClosingConfirmation(isEnabled);
  }

  get isClosingConfirmationEnabled(): boolean {
    return this.#isClosingConfirmationEnabled;
  }

  #linkHandler = (e: MouseEvent): void => {
    if (e.metaKey || e.ctrlKey || !e.target) {
      return;
    }

    const isAnchroEl = (el: HTMLElement): el is HTMLAnchorElement => el.tagName === 'A';

    let el = e.target as HTMLElement;

    while (!isAnchroEl(el) && el.parentNode) {
      el = el.parentNode as HTMLElement;
    }

    const shouldOpenLink =
      isAnchroEl(el) &&
      el.target !== '_blank' &&
      isHTTPTypeProtocol(el.protocol) &&
      isTelegramHostname(el.hostname);

    if (shouldOpenLink) {
      e.preventDefault();
      // WebApp.openTgLink(el.href);
    }
  };

  // `setCssProperty` originally
  #setCssVar(name: string, value: any): void {
    const root = document.documentElement;
    root?.style?.setProperty('--tg-' + name, value);
  }

  #receiveWebViewEvent(eventType: 'themeChanged'): void;
  #receiveWebViewEvent(eventType: 'backButtonClicked'): void;
  #receiveWebViewEvent(eventType: 'mainButtonClicked'): void;
  #receiveWebViewEvent(eventType: 'settingsButtonClicked'): void;
  #receiveWebViewEvent(eventType: 'viewportChanged', params: { isStateStable: boolean }): void;
  #receiveWebViewEvent(eventType: 'popupClosed', params: { button_id?: string | null }): void;
  #receiveWebViewEvent(eventType: 'qrTextReceived', params: { data: any }): void;
  #receiveWebViewEvent(eventType: 'clipboardTextReceived', params: { data: any }): void;
  #receiveWebViewEvent(eventType: 'invoiceClosed', params: { url: string; status: string }): void;
  #receiveWebViewEvent(eventType: WebViewEvent, params?: WebViewEventParams | undefined): void {
    const callbackArgs = params ? [params] : [];

    this.#webView.callEventCallbacks('webview:' + eventType, (callback) => {
      callback.apply(this, callbackArgs);
    });
  }

  #onWebViewEvent(eventType: string, callback: AnyCallback): void {
    this.#webView.onEvent('webview:' + eventType, callback);
  }

  #offWebViewEvent(eventType: string, callback: AnyCallback) {
    this.#webView.offEvent('webview:' + eventType, callback);
  }

  #onWindowResize = (e: UIEvent): void => {
    if (this.#lastWindowHeight !== window.innerHeight) {
      this.#lastWindowHeight = window.innerHeight;

      this.#receiveWebViewEvent('viewportChanged', { isStateStable: true });
    }
  };

  #onInvoiceClosed = (eventType: any, eventData: { slug?: string; status: string }) => {
    if (!eventData.slug) {
      return;
    }

    if (!this.#invoices.has(eventData.slug)) {
      return;
    }

    const invoiceData = this.#invoices.remove(eventData.slug)!;

    invoiceData.callback(eventData.status);

    this.#receiveWebViewEvent('invoiceClosed', {
      url: invoiceData.url,
      status: eventData.status,
    });
  };

  #onThemeChanged = (eventType: any, eventData: { theme_params: ThemeParams }) => {
    if (!eventData.theme_params) {
      return;
    }

    this.#theme.setParams(eventData.theme_params);
    this.#mainButton.setParams({});
    this.#bgColor.updateBackgroundColor();
    this.#receiveWebViewEvent('themeChanged');
  };

  #onViewportChanged = (eventType: any, eventData: ViewportData): void => {
    if (!eventData.height) {
      return;
    }

    window.removeEventListener('resize', this.#onWindowResize);
    this.#viewport.setViewportHeight(eventData);
  };

  #onSettingsButtonPressed = (): void => {
    this.#receiveWebViewEvent('settingsButtonClicked');
  };


  #setClosingConfirmation(isEnabled: boolean): void {
    if (!this.#version.isSuitableTo('6.2')) {
      console.warn(
        '[Telegram.WebApp] Closing confirmation is not supported in version ' + this.#version.value
      );

      return;
    }

    this.#isClosingConfirmationEnabled = Boolean(isEnabled);

    this.#webView.postEvent('web_app_setup_closing_behavior', undefined, {
      need_confirmation: this.#isClosingConfirmationEnabled,
    });
  }

  #getHeaderColorKey(colorKeyOrColor: HeaderBgColor | string): HeaderBgColor | false {
    if (
      colorKeyOrColor === HEADER_COLOR_KEYS.BG_COLOR ||
      colorKeyOrColor === HEADER_COLOR_KEYS.SECONDARY_BG_COLOR
    ) {
      return colorKeyOrColor;
    }

    const parsedColor = parseColorToHex(colorKeyOrColor);
    const themeParams = this.#theme.params;

    if (themeParams.bg_color && themeParams.bg_color === parsedColor) {
      return HEADER_COLOR_KEYS.BG_COLOR;
    }

    if (themeParams.secondary_bg_color && themeParams.secondary_bg_color === parsedColor) {
      return HEADER_COLOR_KEYS.SECONDARY_BG_COLOR;
    }

    return false;
  }

  setHeaderColor = (colorKeyOrColor: HeaderBgColor | string): void | never => {
    if (!this.#version.isSuitableTo('6.1')) {
      console.warn('[Telegram.WebApp] Header color is not supported in version ' + this.#version);
      return;
    }

    const colorKey = this.#getHeaderColorKey(colorKeyOrColor);

    if (
      colorKey !== HEADER_COLOR_KEYS.BG_COLOR &&
      colorKey !== HEADER_COLOR_KEYS.SECONDARY_BG_COLOR
    ) {
      console.error(
        "[Telegram.WebApp] Header color key should be one of Telegram.WebApp.themeParams.bg_color, Telegram.WebApp.themeParams.secondary_bg_color, 'bg_color', 'secondary_bg_color'",
        colorKeyOrColor
      );
      throw new Error('WebAppHeaderColorKeyInvalid');
    }

    this.#headerColorKey = colorKey;

    this.#webView.postEvent('web_app_set_header_color', undefined, { color_key: colorKey });
  };

  setBackgroundColor = (color: HeaderBgColor | string): void => {
    this.backgroundColor = color;
  };

  sendData = (data: string): void => {
    if (!data || !data.length) {
      console.error('[Telegram.WebApp] Data is required', data);
      throw new Error('WebAppDataInvalid');
    }

    if (byteLength(data) > WebApp.MAXIMUM_BYTES_TO_SEND) {
      console.error('[Telegram.WebApp] Data is too long', data);
      throw new Error('WebAppDataInvalid');
    }

    this.#webView.postEvent('web_app_data_send', undefined, { data });
  };

  isVersionAtLeast = (version: string): boolean => {
    return this.#version.isSuitableTo(version);
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

    if (this.#version.isSuitableTo('6.1')) {
      this.#webView.postEvent('web_app_open_link', undefined, {
        url,
        try_instant_view: this.#version.isSuitableTo('6.4') && Boolean(options.try_instant_view),
      });

      return;
    }

    window.open(url, '_blank');
  };

  openInvoice = (url: string, callback: AnyCallback): void => {
    const slug = this.#invoices.create(url);
    this.#invoices.save(slug, { url, callback });

    this.#webView.postEvent('web_app_open_invoice', undefined, { slug });
  };

  openTelegramLink = (url: string): void => {
    if (!this.#version.isSuitableTo('6.1')) {
      return;
    }

    const parsedURL = new URL(url);

    if (!isHTTPTypeProtocol(parsedURL.protocol)) {
      console.error('[Telegram.WebApp] Url protocol is not supported', url);
      throw new Error('WebAppTgUrlInvalid');
    }

    if (!isTelegramHostname(parsedURL.hostname)) {
      console.error('[Telegram.WebApp] Url host is not supported', url);
      throw new Error('WebAppTgUrlInvalid');
    }

    const fullPath = parsedURL.pathname + parsedURL.search;

    if (this.#webView.isIframe) {
      this.#webView.postEvent('web_app_open_tg_link', undefined, { path_full: fullPath });
      return;
    }

    location.href = 'https://t.me' + fullPath;
  };

  readTextFromClipboard = (callback: AnyCallback): void => {
    if (!this.#version.isSuitableTo('6.4')) {
      console.error(
        '[Telegram.WebApp] Method readTextFromClipboard is not supported in version ' +
          this.#version
      );
      throw new Error('WebAppMethodUnsupported');
    }

    const req_id = generateId(16);

    this.#webAppClipboardRequests.set(req_id, { callback });

    this.#webView.postEvent('web_app_read_text_from_clipboard', undefined, { req_id });
  };

  enableClosingConfirmation = (): void => {
    this.#isClosingConfirmationEnabled = true;
  };

  disableClosingConfirmation = (): void => {
    this.#isClosingConfirmationEnabled = false;
  };

  onEvent = (eventType: string, callback: AnyCallback): void => {
    this.#onWebViewEvent(eventType, callback);
  };

  offEvent = (eventType: string, callback: AnyCallback) => {
    this.#offWebViewEvent(eventType, callback);
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
