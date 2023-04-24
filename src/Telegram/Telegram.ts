import { Nullable } from '../types';
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
  constructor({ exposeInMainWorld = true }: TelegramOptions) {
    if (typeof window === 'undefined') {
      throw new Error('Telegram web app can only be launched in browser');
    }

    const initParams = getWebViewInitParams(location.hash);
    const eventEmitter = new EventBus();
    const webView = new TelegramWebView(initParams);
    const version = new Version(initParams.tgWebAppVersion ?? DEFAULT_VERSION);
    const initData = new InitData(initParams.tgWebAppData);
    // TODO: pass args
    const viewport = new Viewport({ eventEmitter, mainButtonHeight: 0 });
    const theme = new Theme(eventEmitter);
    const bgColor = new BackgroundColor({ eventEmitter, themeParams: () => theme.params });
    const backButton = new WebAppBackButton({ eventEmitter });
    const clipboard = new WebAppClipboard();
    const hapticFeedback = new WebAppHapticFeedback();
    const invoices = new Invoices();
    const mainButton = new WebAppMainButton({ eventEmitter });
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
      if (window.Telegram) {
        throw new Error('Can not expose!. Telegram already exist in window!');
      }

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
  }
}
