# @telegram-web-app/core

Unofficial [`telegram` web app for bots](https://core.telegram.org/bots/webapps) `npm`
package. Based on https://telegram.org/js/telegram-web-app.js

> ⚠️ Package is in beta release at the moment. It may contain some bugs and has lack of
> tests. Be careful and open issue if you find that something is wrong.

## Table of contents

- [Installation](#installation)
- [Usage](#usage)
- [Imports](#imports)
  - [errors](#errors)
  - [types](#types)
- [Exceptions](#exceptions)
- [Constants](#constants)
- [Differences from the original library](#differences-from-the-original-library)

## Installation

```sh
npm install @telegram-web-app/core
```

## Usage

> If you already followed [original
> instruction](https://core.telegram.org/bots/webapps#initializing-web-apps) and place
> https://telegram.org/js/telegram-web-app.js script in the `<head>` tag, be sure that you
> remove it before using this library.

TL;DR

```ts
import { TelegramWebAppContainer } from '@telegram-web-app/core';

const telegram = new TelegramWebAppContainer();

// When yor app is ready
telegram.WebApp.ready();

// You can use any properties/methods described in https://core.telegram.org/bots/webapps#initializing-web-apps
telegram.WebApp.version; // for example: '6.7'
```

Library exports `TelegramWebAppContainer` class which returns instance of
[`Telegram`](/packages/core/src/Telegram#L37) interface. It's contains two getters: [`WebApp`](https://core.telegram.org/bots/webapps#initializing-web-apps)
and `WebView`, their interfaces fully compatible with [original `telegram` library](https://telegram.org/js/telegram-web-app.js)

You can pass optional object with option `exposeInMainWorld`(default to `false`) to decide
whether to add or not `Telegram` object to `window` like the original library does.

```ts
import { TelegramWebAppContainer } from '@telegram-web-app/core';

const telegram = new TelegramWebAppContainer({ exposeInMainWorld: true });
```

Makes available `window.Telegram` object with the following properties:

- `WebView`
- `WebApp`
- `Utils`
- `TelegramGameProxy_receiveEvent`
- `TelegramGameProxy`

## Imports

Library use [`nodejs` subpath exports](https://nodejs.org/docs/latest-v18.x/api/packages.html#conditional-exports). Because of that minimal required `nodejs` version is
`16.10.0`

Available subpath imports:

### errors

`@telegram-web-app/core/errors`

Contains [custom errors](#exceptions) throwed by the library.

Example:

```ts
import { WebAppBackgroundColorInvalidError } from '@telegram-web-app/core/errors';
```

### types

`@telegram-web-app/core/types`

Contains all typescript types.

Example:

```ts
import { ThemeParams } from '@telegram-web-app/core/types';
```

## Exceptions

In the original library when exception happens, code throws generic `Error` class without some
useful information. For example:

```ts
if (!text.length) {
  console.error('[Telegram.WebApp] Main button text is required', params.text);
  throw Error('WebAppMainButtonParamInvalid');
}
```

Library throws custom errors instead of generic `Error` in the original library.

All custom errors available through import from `@telegram-web-app/core/errors`

For example:

```ts
import { WebAppMainButtonParamInvalidError } from '@telegram-web-app/core/errors';

...

try {
  telegram.WebApp.MainButton.setText(null) // only valid value type is string, so it's throws
} catch (e) {
  if (e instanceof WebAppMainButtonParamInvalidError) {
    // do something here
  }
}
```

Table of all methods and setters that can throw custom errors:

| Method                                                | Type   | Errors                                                                                                                                     |
| ----------------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `Telegram.WebApp.switchInlineQuery`                   | method | `WebAppMethodUnsupportedError`, `WebAppInlineModeDisabledError`, `WebAppInlineQueryInvalidError`, `WebAppInlineChooseChatTypeInvalidError` |
| `Telegram.WebApp.openInvoice`                         | method | `WebAppMethodUnsupportedError`                                                                                                             |
| `Telegram.WebApp.showPopup`                           | method | `WebAppMethodUnsupportedError`, `WebAppPopupOpenedError`, `WebAppPopupParamInvalidError`                                                   |
| `Telegram.WebApp.showAlert`                           | method | `WebAppMethodUnsupportedError`,`WebAppPopupOpenedError`, `WebAppPopupParamInvalidError`                                                    |
| `Telegram.WebApp.showConfirm`                         | method | `WebAppMethodUnsupportedError`,`WebAppPopupOpenedError`, `WebAppPopupParamInvalidError`                                                    |
| `Telegram.WebApp.showScanQrPopup`                     | method | `WebAppMethodUnsupportedError`, `WebAppScanQrPopupOpenedError`, `WebAppScanQrPopupParamInvalidError`                                       |
| `Telegram.WebApp.closeScanQrPopup`                    | method | `WebAppMethodUnsupportedError`                                                                                                             |
| `Telegram.WebApp.readTextFromClipboard`               | method | `WebAppMethodUnsupportedError`                                                                                                             |
| `Telegram.WebApp.setHeaderColor`                      | method | `WebAppHeaderColorKeyInvalidError`                                                                                                         |
| `Telegram.WebApp.sendData`                            | method | `WebAppDataInvalidError`                                                                                                                   |
| `Telegram.WebApp.openLink`                            | method | `WebAppTelegramUrlInvalidError`                                                                                                            |
| `Telegram.WebApp.openTelegramLink`                    | method | `WebAppTelegramUrlInvalidError`                                                                                                            |
| `Telegram.WebApp.backgroundColor`                     | setter | `WebAppBackgroundColorInvalidError`                                                                                                        |
| `Telegram.WebApp.HapticFeedback.impactOccurred`       | method | `WebAppHapticFeedbackTypeInvalidError`, `WebAppHapticImpactStyleInvalidError`                                                              |
| `Telegram.WebApp.HapticFeedback.notificationOccurred` | method | `WebAppHapticFeedbackTypeInvalidError`, `WebAppHapticNotificationTypeInvalidError`                                                         |
| `Telegram.WebApp.HapticFeedback.selectionChanged`     | method | `WebAppHapticFeedbackTypeInvalidError`                                                                                                     |
| `Telegram.WebApp.MainButton.setParams`                | method | `WebAppMainButtonParamInvalidError`                                                                                                        |
| `Telegram.WebApp.MainButton.setText`                  | method | `WebAppMainButtonParamInvalidError`                                                                                                        |
| `Telegram.WebApp.MainButton.isActive`                 | setter | `WebAppMainButtonParamInvalidError`                                                                                                        |
| `Telegram.WebApp.MainButton.isVisible`                | setter | `WebAppMainButtonParamInvalidError`                                                                                                        |
| `Telegram.WebApp.MainButton.textColor`                | setter | `WebAppMainButtonParamInvalidError`                                                                                                        |
| `Telegram.WebApp.MainButton.color`                    | setter | `WebAppMainButtonParamInvalidError`                                                                                                        |
| `Telegram.WebApp.MainButton.text`                     | setter | `WebAppMainButtonParamInvalidError`                                                                                                        |

## Constants

Some constants available for your convenience.
List of available constants:

- [`TELEGRAM_HAPTIC_FEEDBACK`](/packages/core/src/WebApp/HapticFeedback.ts#L28)
  contains constants related to
  [`HapticFeedback`](https://core.telegram.org/bots/webapps#hapticfeedback)

  ```ts
  import { TELEGRAM_HAPTIC_FEEDBACK } from '@telegram-web-app/core';
  ```

- [`TELEGRAM_MAIN_BUTTON`](/packages/core/src/WebApp/MainButton.ts#L35)
  contains constants related to
  [`MainButton`](https://core.telegram.org/bots/webapps#mainbutton)

  ```ts
  import { TELEGRAM_MAIN_BUTTON } from '@telegram-web-app/core';
  ```

- [`TELEGRAM_POPUP`](/packages/core/src/WebApp/Popup/Popup.ts#L23)
  contains constants related to
  [`Popup`](https://core.telegram.org/bots/webapps#popupparams)

  ```ts
  import { TELEGRAM_POPUP } from '@telegram-web-app/core';
  ```

- [`TELEGRAM_POPUP_BUTTON`](/packages/core/src/WebApp/PopupButton/PopupButton.ts#L6)
  contains constants related to
  [`PopupButton`](https://core.telegram.org/bots/webapps#popupbutton)

  ```ts
  import { TELEGRAM_POPUP_BUTTON } from '@telegram-web-app/core';
  ```

- [`TELEGRAM_SCAN_QR_POPUP`](/packages/core/src/WebApp/QrPopup.ts#L14)
  contains constants related to
  [`PopupButton`](https://core.telegram.org/bots/webapps#scanqrpopupparams)

  ```ts
  import { TELEGRAM_SCAN_QR_POPUP } from '@telegram-web-app/core';
  ```

- [`TELEGRAM_THEME`](/packages/core/src/WebApp/Theme.ts#L20)
  contains constants related to
  [`Theme`](https://core.telegram.org/bots/webapps#themeparams)

  ```ts
  import { TELEGRAM_THEME } from '@telegram-web-app/core';
  ```

- [`TELEGRAM_WEB_APP`](/packages/core/src/WebApp/WebApp.ts#L92)
  contains constants related to
  [`WebApp`](https://core.telegram.org/bots/webapps#initializing-web-apps)

  ```ts
  import { TELEGRAM_WEB_APP } from '@telegram-web-app/core';
  ```

- [`TELEGRAM_WEB_VIEW`](/packages/core/src/WebView.ts#L10)
  contains constants related to `WebView`(no official docs)

  ```ts
  import { TELEGRAM_WEB_VIEW } from '@telegram-web-app/core';
  ```

## Differences from the original library

- uses modern syntax(dist code builded in es2020 syntax)
- throws custom errors instead of generic `Error` in the original library
- provides constants for your convenience
