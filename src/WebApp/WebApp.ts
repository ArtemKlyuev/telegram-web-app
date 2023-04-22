import { AnyCallback, HexColor, InitParams, ValueOf } from '../types';
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
  PopupParams,
  ScanQrCallback,
  ScanQrPopupParams,
  ThemeParams,
  WebViewEvent,
  WebViewEventParams,
} from './types';
import { COLOR_SCHEMES, HEADER_COLOR_KEYS } from './constants';
import { BACK_BUTTON_EVENTS_KEY, BACK_BUTTON_ON_EVENT_KEY, BackButton } from './BackButton';
import { BackgroundColor } from './BackgroundColor';
import { HapticFeedback } from './HapticFeedback';
import { InitData } from './InitData';
import { MainButton } from './MainButton';
import { Theme } from './Theme';
import { Viewport, ViewportData } from './Viewport';
import { Version } from './Version';
import { Invoices } from './Invoices';
import { Popup, PopupCallback } from './Popup';
import { WebAppPopupButton } from './WebAppPopupButton';
import { ClipboardCallback, WebAppClipboard } from './Clipboard';
import { QrPopup } from './QrPopup';

const CHAT_TYPES = {
  USERS: 'users',
  BOTS: 'bots',
  GROUPS: 'groups',
  CHANNELS: 'channels',
} as const;

const VALID_CHAT_TYPES = Object.values(CHAT_TYPES);

export type ChatTypes = typeof CHAT_TYPES;
export type ChatType = ValueOf<ChatTypes>;
export type ChatTypesToChoose =
  | [ChatType]
  | [ChatType, ChatType]
  | [ChatType, ChatType, ChatType]
  | [ChatType, ChatType, ChatType, ChatType];

export class WebApp {
  readonly #webAppPlatform: string = 'unknown';
  #headerColorKey: HeaderBgColor = HEADER_COLOR_KEYS.BG_COLOR;
  #lastWindowHeight = window.innerHeight;
  #isClosingConfirmationEnabled = false;
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
  readonly #popup: Popup;
  readonly #clipboard: WebAppClipboard;
  readonly #qrPopup: QrPopup;

  static readonly COLOR_SCHEMES: ColorSchemes = COLOR_SCHEMES;
  static readonly MAXIMUM_BYTES_TO_SEND = 4096;
  static get MAX_INLINE_QUERY_LENGTH(): number {
    return 256;
  }
  static get CHAT_TYPES(): ChatTypes {
    return CHAT_TYPES;
  }

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

    this.#mainButton.on(MainButton.EVENTS.DEBUG_BUTTON_UPDATED, this.#viewport.setHeight);

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
    this.#backButton[BACK_BUTTON_ON_EVENT_KEY](BackButton[BACK_BUTTON_EVENTS_KEY].CREATED, () => {
      this.#webView.onEvent('back_button_pressed', () => {
        this.#receiveWebViewEvent('backButtonClicked');
      });
    });

    this.#backButton[BACK_BUTTON_ON_EVENT_KEY](
      BackButton[BACK_BUTTON_EVENTS_KEY].UPDATED,
      (params) => {
        this.#webView.postEvent('web_app_setup_back_button', undefined, params);
      }
    );

    this.#backButton[BACK_BUTTON_ON_EVENT_KEY](
      BackButton[BACK_BUTTON_EVENTS_KEY].CLICKED,
      (callback) => {
        this.#onWebViewEvent('backButtonClicked', callback);
      }
    );

    this.#backButton[BACK_BUTTON_ON_EVENT_KEY](
      BackButton[BACK_BUTTON_EVENTS_KEY].OFF_CLICKED,
      (callback) => {
        this.#offWebViewEvent('backButtonClicked', callback);
      }
    );
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
    invoices: Invoices,
    popup: Popup,
    clipboard: WebAppClipboard,
    qrPopup: QrPopup
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

    this.#popup = popup;

    if (initParams.tgWebAppVersion) {
      this.#version.set(initParams.tgWebAppVersion);
    }

    if (initParams.tgWebAppPlatform) {
      this.#webAppPlatform = initParams.tgWebAppPlatform;
    }

    this.#invoices = invoices;
    this.#clipboard = clipboard;
    this.#qrPopup = qrPopup;

    this.#bgColor.update();
    this.#viewport.setHeight();

    window.addEventListener('resize', this.#onWindowResize);
    if (this.#webView.isIframe) {
      document.addEventListener('click', this.#linkHandler);
    }

    this.#webView.onEvent('theme_changed', this.#onThemeChanged);
    this.#webView.onEvent('viewport_changed', this.#onViewportChanged);
    this.#webView.onEvent('invoice_closed', this.#onInvoiceClosed);
    this.#webView.onEvent('settings_button_pressed', this.#onSettingsButtonPressed);
    this.#webView.onEvent('popup_closed', this.#onPopupClosed);
    this.#webView.onEvent('qr_text_received', this.#onQrTextReceived);
    this.#webView.onEvent('scan_qr_popup_closed', this.#onScanQrPopupClosed);
    this.#webView.onEvent('clipboard_text_received', this.#onClipboardTextReceived);
    this.#webView.postEvent('web_app_request_theme');
    this.#webView.postEvent('web_app_request_viewport');
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
    this.#bgColor.set(color);
  }

  // @ts-expect-error different getter and setter types, but it's ok
  get backgroundColor(): HexColor | undefined {
    return this.#bgColor.get();
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
    return this.#viewport.height;
  }

  get viewportStableHeight(): number {
    return this.#viewport.stableHeight;
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
    this.#bgColor.update();
    this.#receiveWebViewEvent('themeChanged');
  };

  #onViewportChanged = (eventType: any, eventData: ViewportData): void => {
    if (!eventData.height) {
      return;
    }

    window.removeEventListener('resize', this.#onWindowResize);
    this.#viewport.setHeight(eventData);
  };

  #onSettingsButtonPressed = (): void => {
    this.#receiveWebViewEvent('settingsButtonClicked');
  };

  #onPopupClosed = (eventType: any, eventData: { button_id: string | null }): void => {
    if (!this.#popup.isOpened) {
      return;
    }

    const callback = this.#popup.callback;
    this.#popup.close();

    const buttonID = eventData.button_id ?? null;

    if (buttonID) {
      callback?.(buttonID);
    }

    this.#receiveWebViewEvent('popupClosed', { button_id: buttonID });
  };

  #onClipboardTextReceived = (
    eventType: any,
    {
      req_id: id,
      data = null,
    }: { req_id?: string | undefined; data?: string | '' | null | undefined }
  ) => {
    if (!id || !this.#clipboard.hasRequest(id)) {
      return;
    }

    const callback = this.#clipboard.getRequest(id);
    this.#clipboard.removeRequest(id);

    callback?.(data);

    this.#receiveWebViewEvent('clipboardTextReceived', { data });
  };

  #onQrTextReceived = (eventType: any, eventData: { data?: string | undefined }): void => {
    if (!this.#qrPopup.isOpened) {
      return;
    }

    const { callback } = this.#qrPopup;
    const data = eventData.data ?? null;

    if (callback?.(data)) {
      this.#qrPopup.close();
      this.#webView.postEvent('web_app_close_scan_qr_popup');
    }

    this.#receiveWebViewEvent('qrTextReceived', { data });
  };

  #onScanQrPopupClosed = (eventType: any, eventData: any): void => {
    this.#qrPopup.close();
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

  readTextFromClipboard = (callback?: ClipboardCallback | null | undefined): void => {
    if (!this.#version.isSuitableTo('6.4')) {
      console.error(
        '[Telegram.WebApp] Method readTextFromClipboard is not supported in version ' +
          this.#version
      );
      throw new Error('WebAppMethodUnsupported');
    }

    const id = generateId(16);

    this.#clipboard.setRequest(id, callback);

    this.#webView.postEvent('web_app_read_text_from_clipboard', undefined, { req_id: id });
  };

  enableClosingConfirmation = (): void => {
    this.#isClosingConfirmationEnabled = true;
  };

  disableClosingConfirmation = (): void => {
    this.#isClosingConfirmationEnabled = false;
  };

  showPopup(params: PopupParams, callback?: PopupCallback | undefined): void {
    if (!this.#version.isSuitableTo('6.2')) {
      console.error(
        '[Telegram.WebApp] Method showPopup is not supported in version ' + this.#version.value
      );

      throw new Error('WebAppMethodUnsupported');
    }

    if (this.#popup.isOpened) {
      console.error('[Telegram.WebApp] Popup is already opened');
      throw new Error('WebAppPopupOpened');
    }

    if (typeof params !== 'object' && params === null) {
      throw new Error('WebAppPopupParamsInvalid');
    }

    this.#popup.open({ params, callback });

    this.#webView.postEvent('web_app_open_popup', undefined, this.#popup.params);
  }

  showAlert = (message: string, callback?: (() => any) | null | undefined): void => {
    const callbackWithoutID = (): any => callback?.();

    this.showPopup({ message }, callbackWithoutID);
  };

  showConfirm = (
    message: string,
    callback?: ((isOkPressed: boolean) => any) | null | undefined
  ): void => {
    const OK_BTN_ID = 'ok';
    const popupCallback = (pressedBtnID: string): any => callback?.(pressedBtnID === OK_BTN_ID);

    this.showPopup(
      {
        message,
        buttons: [
          { type: WebAppPopupButton.TYPES.OK, id: OK_BTN_ID },
          { type: WebAppPopupButton.TYPES.CANCEL },
        ],
      },
      popupCallback
    );
  };

  switchInlineQuery = (query: string, chatTypesToChoose?: ChatTypesToChoose | null | undefined) => {
    if (!this.#version.isSuitableTo('6.7')) {
      console.error(
        '[Telegram.WebApp] Method switchInlineQuery is not supported in version ' +
          this.#version.value
      );
      throw new Error('WebAppMethodUnsupported');
    }

    if (!this.#webView.initParams.tgWebAppBotInline) {
      console.error(
        '[Telegram.WebApp] Inline mode is disabled for this bot. Read more about inline mode: https://core.telegram.org/bots/inline'
      );
      throw new Error('WebAppInlineModeDisabled');
    }

    const queryToSend = (query || '').trim();

    if (queryToSend.length > WebApp.MAX_INLINE_QUERY_LENGTH) {
      console.error('[Telegram.WebApp] Inline query is too long', query);
      throw new Error('WebAppInlineQueryInvalid');
    }

    const chatTypes = chatTypesToChoose ? chatTypesToChoose : [];

    if (!Array.isArray(chatTypesToChoose)) {
      console.error('[Telegram.WebApp] Choose chat types should be an array', chatTypesToChoose);
      throw new Error('WebAppInlineChooseChatTypesInvalid');
    }

    // remove duplicates
    const chats = [...new Set(chatTypes)];

    chats.forEach((chat) => {
      if (!VALID_CHAT_TYPES.includes(chat)) {
        console.error('[Telegram.WebApp] Choose chat type is invalid', chat);
        throw Error('WebAppInlineChooseChatTypeInvalid');
      }
    });

    this.#webView.postEvent('web_app_switch_inline_query', undefined, {
      query: queryToSend,
      chat_types: chats,
    });
  };

  showScanQrPopup = (
    params: ScanQrPopupParams,
    callback?: ScanQrCallback | null | undefined
  ): void | never => {
    if (!this.#version.isSuitableTo('6.4')) {
      console.error(
        '[Telegram.WebApp] Method showScanQrPopup is not supported in version ' +
          this.#version.value
      );
      throw new Error('WebAppMethodUnsupported');
    }

    this.#qrPopup.open({ params, callback });

    this.#webView.postEvent('web_app_open_scan_qr_popup', undefined, this.#qrPopup.params);
  };

  closeScanQrPopup = (): void => {
    if (!this.#version.isSuitableTo('6.4')) {
      console.error(
        '[Telegram.WebApp] Method closeScanQrPopup is not supported in version ' +
          this.#version.value
      );
      throw new Error('WebAppMethodUnsupported');
    }

    this.#qrPopup.close();

    this.#webView.postEvent('web_app_close_scan_qr_popup');
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
