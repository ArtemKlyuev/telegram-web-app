import { utils } from './utils';

var eventHandlers = {};

const postEvent = (eventType: string, callback?: Function, eventData: any = ''): void => {
  if (window.TelegramWebviewProxy) {
    window.TelegramWebviewProxy.postEvent(eventType, JSON.stringify(eventData));
    callback?.();
  } else if (window.external && 'notify' in window.external) {
    window.external.notify(JSON.stringify({ eventType, eventData }));
    callback?.();
  } else if (isIframe) {
    try {
      let trustedTarget = 'https://web.telegram.org';
      // For now we don't restrict target, for testing purposes
      trustedTarget = '*';
      window.parent.postMessage(JSON.stringify({ eventType, eventData }), trustedTarget);

      if (initParams.tgWebAppDebug) {
        console.log('[Telegram.WebView] postEvent via postMessage', eventType, eventData);
      }

      callback?.();
    } catch (e) {
      callback?.(e);
    }
  } else {
    if (initParams.tgWebAppDebug) {
      console.log('[Telegram.WebView] postEvent', eventType, eventData);
    }

    callback?.({ notAvailable: true });
  }
};

const callEventCallbacks = (eventType: string, func: (cb: Function) => any): void => {
  const curEventHandlers = eventHandlers[eventType];

  if (curEventHandlers === undefined || !curEventHandlers.length) {
    return;
  }

  curEventHandlers.forEach((handler) => {
    try {
      func(handler);
    } catch {}
  });
};

const receiveEvent = (eventType: string, eventData: any): void => {
  callEventCallbacks(eventType, (callback) => callback(eventType, eventData));
};

const onEvent = (eventType: string, callback: Function): void => {
  eventHandlers[eventType] ??= [];

  const index = eventHandlers[eventType].indexOf(callback);

  if (index === -1) {
    eventHandlers[eventType].push(callback);
  }
};

const offEvent = (eventType: string, callback: Function): void => {
  if (!eventHandlers[eventType]) {
    return;
  }

  const index = eventHandlers[eventType].indexOf(callback);

  if (index === -1) {
    return;
  }

  eventHandlers[eventType].splice(index, 1);
};

// start

const getLocation = (): string => {
  try {
    return window.location.hash.toString();
  } catch {
    return '';
  }
};

var initParams = utils.urlParseHashParams(getLocation());
var storedParams = utils.sessionStorageGet('initParams');

if (storedParams) {
  for (var key in storedParams) {
    if (typeof initParams[key] === 'undefined') {
      initParams[key] = storedParams[key];
    }
  }
}

utils.sessionStorageSet('initParams', initParams);

let isIframe = false;
let iFrameStyle;

try {
  isIframe = window.parent != null && window != window.parent;
  if (isIframe) {
    window.addEventListener('message', function (event) {
      if (event.source !== window.parent) return;

      try {
        var dataParsed = JSON.parse(event.data);
      } catch {
        return;
      }

      if (!dataParsed || !dataParsed.eventType) {
        return;
      }

      if (dataParsed.eventType == 'set_custom_style') {
        iFrameStyle.innerHTML = dataParsed.eventData;
      } else {
        receiveEvent(dataParsed.eventType, dataParsed.eventData);
      }
    });

    iFrameStyle = document.createElement('style');
    document.head.appendChild(iFrameStyle);

    try {
      window.parent.postMessage(JSON.stringify({ eventType: 'iframe_ready' }), '*');
    } catch {}
  }
} catch {}

if (!window.Telegram) {
  window.Telegram = {};
}

window.Telegram.WebView = {
  initParams,
  isIframe,
  onEvent,
  offEvent,
  postEvent,
  receiveEvent,
  callEventCallbacks,
};

window.Telegram.Utils = utils;

// For Windows Phone app
window.TelegramGameProxy_receiveEvent = receiveEvent;

// App backward compatibility
window.TelegramGameProxy = { receiveEvent };
