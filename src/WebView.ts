import {
  AnyCallback,
  CallEventCallbackHandler,
  InitParams,
  Nullable,
  PostEventCallback,
  ReceivedWebViewEventHandler,
  ReceivedWebViewEventToData,
  WebView,
} from './types';

export const TELEGRAM_WEB_VIEW = {
  EVENTS: {
    SEND: {
      WEB_APP_READY: 'web_app_ready',
      WEB_APP_EXPAND: 'web_app_expand',
      WEB_APP_CLOSE: 'web_app_close',
      WEB_APP_OPEN_POPUP: 'web_app_open_popup',
      WEB_APP_SETUP_CLOSING_BEHAVIOR: 'web_app_setup_closing_behavior',
      WEB_APP_SET_BACKGROUND_COLOR: 'web_app_set_background_color',
      WEB_APP_SET_HEADER_COLOR: 'web_app_set_header_color',
      WEB_APP_DATA_SEND: 'web_app_data_send',
      WEB_APP_TRIGGER_HAPTIC_FEEDBACK: 'web_app_trigger_haptic_feedback',
      WEB_APP_OPEN_LINK: 'web_app_open_link',
      WEB_APP_OPEN_TG_LINK: 'web_app_open_tg_link',
      WEB_APP_OPEN_INVOICE: 'web_app_open_invoice',
      WEB_APP_REQUEST_VIEWPORT: 'web_app_request_viewport',
      WEB_APP_REQUEST_THEME: 'web_app_request_theme',
      WEB_APP_SETUP_MAIN_BUTTON: 'web_app_setup_main_button',
      WEB_APP_SETUP_BACK_BUTTON: 'web_app_setup_back_button',
      WEB_APP_OPEN_SCAN_QR_POPUP: 'web_app_open_scan_qr_popup',
      WEB_APP_CLOSE_SCAN_QR_POPUP: 'web_app_close_scan_qr_popup',
      WEB_APP_READ_TEXT_FROM_CLIPBOARD: 'web_app_read_text_from_clipboard',
      WEB_APP_SWITCH_INLINE_QUERY: 'web_app_switch_inline_query',
      PAYMENT_FORM_SUBMIT: 'payment_form_submit',
      SHARE_SCORE: 'share_score',
      SHARE_GAME: 'share_game',
      GAME_OVER: 'game_over',
      GAME_LOADED: 'game_loaded',
      RESIZE_FRAME: 'resize_frame',
    },
    RECEIVE: {
      MAIN_BUTTON_PRESSED: 'main_button_pressed',
      SETTINGS_BUTTON_PRESSED: 'settings_button_pressed',
      BACK_BUTTON_PRESSED: 'back_button_pressed',
      INVOICE_CLOSED: 'invoice_closed',
      VIEWPORT_CHANGED: 'viewport_changed',
      THEME_CHANGED: 'theme_changed',
      POPUP_CLOSED: 'popup_closed',
      QR_TEXT_RECEIVED: 'qr_text_received',
      SCAN_QR_POPUP_CLOSED: 'scan_qr_popup_closed',
      CLIPBOARD_TEXT_RECEIVED: 'clipboard_text_received',
    },
  },
} as const;

export class TelegramWebView implements WebView {
  #initParams: InitParams;
  #eventHandlers = new Map<string, Set<AnyCallback>>();
  #isIframe: boolean = window.parent != null && window != window.parent;
  #iframeStyleEl: HTMLStyleElement | null = null;

  constructor(initParams: InitParams) {
    this.#initParams = initParams;

    if (this.#isIframe) {
      this.#iframeStyleEl = document.createElement('style');
      document.head.appendChild(this.#iframeStyleEl);
      this.#subscribeToMessageFromParent();

      try {
        window.parent.postMessage(JSON.stringify({ eventType: 'iframe_ready' }), '*');
      } catch {}
    }
  }

  #subscribeToMessageFromParent() {
    window.addEventListener('message', (event) => {
      if (event.source !== window.parent) {
        return;
      }

      try {
        const dataParsed = JSON.parse(event.data) as { eventType: string; eventData: any };

        if (!dataParsed.eventType) {
          return;
        }

        if (dataParsed.eventType === 'set_custom_style' && this.#iframeStyleEl) {
          this.#iframeStyleEl.innerHTML = dataParsed.eventData;
          return;
        }

        this.receiveEvent(
          dataParsed.eventType as keyof ReceivedWebViewEventToData,
          dataParsed.eventData
        );
      } catch {}
    });
  }

  get initParams(): InitParams {
    return this.#initParams;
  }

  get isIframe(): boolean {
    return this.#isIframe;
  }

  postEvent = (
    eventType: string,
    callback?: Nullable<PostEventCallback>,
    eventData: any = ''
  ): void => {
    if (window.TelegramWebviewProxy) {
      window.TelegramWebviewProxy.postEvent(eventType, JSON.stringify(eventData));
      callback?.();
      return;
    }

    if (window.external && 'notify' in window.external) {
      // @ts-expect-error deprecated property `external`
      window.external.notify(JSON.stringify({ eventType, eventData }));
      callback?.();
      return;
    }

    if (this.#isIframe) {
      try {
        // For now we don't restrict target, for testing purposes
        // default: 'https://web.telegram.org'
        const trustedTarget = '*';
        window.parent.postMessage(JSON.stringify({ eventType, eventData }), trustedTarget);

        if (this.#initParams.tgWebAppDebug) {
          console.log('[Telegram.WebView] postEvent via postMessage', eventType, eventData);
        }

        callback?.();
      } catch (e) {
        callback?.(e as Error);
      } finally {
        return;
      }
    }

    if (this.#initParams.tgWebAppDebug) {
      console.log('[Telegram.WebView] postEvent', eventType, eventData);
    }

    callback?.({ notAvailable: true });
  };

  onEvent = (eventType: string, callback: AnyCallback): void => {
    if (!this.#eventHandlers.has(eventType)) {
      this.#eventHandlers.set(eventType, new Set());
    }

    this.#eventHandlers.get(eventType)!.add(callback);
  };

  offEvent = (eventType: string, callback: AnyCallback): void => {
    if (!this.#eventHandlers.has(eventType)) {
      return;
    }

    this.#eventHandlers.get(eventType)!.delete(callback);
  };

  callEventCallbacks = <
    Event extends keyof ReceivedWebViewEventToData = keyof ReceivedWebViewEventToData
  >(
    eventType: Event,
    func: CallEventCallbackHandler<
      ReceivedWebViewEventHandler<Event, ReceivedWebViewEventToData[Event]>
    >
  ): void => {
    const eventHandlers = this.#eventHandlers.get(eventType);

    eventHandlers?.forEach((handler) => {
      try {
        // @ts-expect-error
        func(handler);
      } catch {}
    });
  };

  receiveEvent = <
    Event extends keyof ReceivedWebViewEventToData = keyof ReceivedWebViewEventToData
  >(
    eventType: Event,
    eventData: ReceivedWebViewEventToData[Event]
  ): void => {
    // @ts-expect-error
    this.callEventCallbacks(eventType, (callback) => callback(eventType, eventData));
  };
}
