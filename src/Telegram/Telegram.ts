import { Nullable, WebApp, WebView } from '../types';
import { TelegramWebView } from '../WebView';
import {
  WebAppBackButton,
  BackgroundColor,
  WebAppClipboard,
  WebAppHapticFeedback,
  InitData,
  Invoices,
  WebAppMainButton,
  Popup,
  QrPopup,
  Theme,
  Version,
  Viewport,
  TelegramWebApp,
  FeatureSupport,
} from '../WebApp';
import {
  EventBus,
  SessionStorage,
  getWebViewInitParams,
  urlAppendHashParams,
  urlParseHashParams,
  urlParseQueryString,
  urlSafeDecode,
} from '../utils';

export interface TelegramOptions {
  exposeInMainWorld?: Nullable<boolean>;
}

const DEFAULT_VERSION = '6.0';

export class Telegram {
  readonly #webApp: WebApp;
  readonly #webView: WebView;

  constructor({ exposeInMainWorld = true }: TelegramOptions) {
    if (typeof window === 'undefined') {
      throw new Error('Telegram web app can only be launched in browser');
    }

    const initParams = getWebViewInitParams(location.hash);

    let isDebug = false;

    try {
      // @ts-expect-error wrapped in try..catch
      isDebug = Boolean(JSON.parse(initParams.tgWebAppDebug));
    } catch {}

    const eventEmitter = new EventBus();
    const webView = new TelegramWebView(initParams);
    const version = new Version(initParams.tgWebAppVersion ?? DEFAULT_VERSION);
    FeatureSupport.version = version;
    const initData = new InitData(initParams.tgWebAppData);
    const viewport = new Viewport({ eventEmitter, mainButtonHeight: 0 });
    const theme = new Theme(eventEmitter);
    const bgColor = new BackgroundColor({ eventEmitter, themeParams: () => theme.params });
    const backButton = new WebAppBackButton({ eventEmitter });
    const clipboard = new WebAppClipboard();
    const hapticFeedback = new WebAppHapticFeedback(eventEmitter);
    const invoices = new Invoices();
    const mainButton = new WebAppMainButton({ eventEmitter, theme, isDebug });
    const popup = new Popup();
    const qrPopup = new QrPopup();

    const webApp = new TelegramWebApp({
      backButton,
      bgColor,
      clipboard,
      hapticFeedback,
      initData,
      invoices,
      mainButton,
      popup,
      qrPopup,
      theme,
      version,
      viewport,
      webView,
    });

    if (exposeInMainWorld) {
      window.Telegram = {
        WebView: webView,
        WebApp: webApp,
        Utils: {
          urlSafeDecode,
          urlParseQueryString,
          urlParseHashParams,
          urlAppendHashParams,
          sessionStorageSet: SessionStorage.set,
          sessionStorageGet: SessionStorage.get,
        },
        // For Windows Phone app
        TelegramGameProxy_receiveEvent: webView.receiveEvent,
        // App backward compatibility
        TelegramGameProxy: {
          receiveEvent: webView.receiveEvent,
        },
      };
    }

    this.#webApp = webApp;
    this.#webView = webView;
  }

  get WebApp() {
    return this.#webApp;
  }

  get WebView() {
    return this.#webView;
  }
}
