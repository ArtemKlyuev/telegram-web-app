import { AnyCallback, InitParams } from './types';

export type PostEventCb = (arg?: (Error | { notAvailable: true }) | undefined) => any;

export class WebView {
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

        this.receiveEvent(dataParsed.eventType, dataParsed.eventData);
      } catch {
        return;
      }
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
    callback?: PostEventCb | undefined,
    eventData: any = ''
  ): void => {
    if (window.TelegramWebviewProxy !== undefined) {
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

  callEventCallbacks = (eventType: string, func: (cb: AnyCallback) => any): void => {
    const eventHandlers = this.#eventHandlers.get(eventType);

    if (!eventHandlers || eventHandlers.size === 0) {
      return;
    }

    eventHandlers.forEach((handler) => {
      try {
        func(handler);
      } catch {}
    });
  };

  receiveEvent = (eventType: string, eventData: any): void => {
    this.callEventCallbacks(eventType, (callback) => callback(eventType, eventData));
  };
}
