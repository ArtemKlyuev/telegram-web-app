# @telegram-web-app/react

[`@telegram-web-app/core`](../core) binding for [`react`](https://github.com/facebook/react)

## Table of contents

- [Installation](#installation)
- [Usage](#usage)
- [Components](#components)
  - [TelegramWebAppProvider](#telegramwebappprovider)
- [Hooks](#hooks)
  - [useTelegramWebApp](#usetelegramwebapp)

## Installation

`@telegram-web-app/react` required [`@telegram-web-app/core`](../core) as a peer
dependency, make sure to install it.

Using npm:

```sh
npm install @telegram-web-app/core @telegram-web-app/react
```

## Usage

Import `TelegramWebAppProvider` from `@telegram-web-app/react` and wrap your app in
it

```tsx
import { TelegramWebAppProvider } from '@telegram-web-app/react';

...

<TelegramWebAppProvider>
  <App />
</TelegramWebAppProvider>
```

And then inside your app use `useTelegramWebApp` hook to get `Telegram` instance

```tsx
import { useTelegramWebApp } from '@telegram-web-app/react';

export const App = () => {
  const telegram = useTelegramWebApp();
  ...
};
```

## Components

### TelegramWebAppProvider

React provider that exposes context to it's children components.

**Props:**

#### children

| Type        | Required | Default |
| ----------- | -------- | ------- |
| `ReactNode` | yes      | —       |

#### exposeInMainWorld

See [`@telegram-web-app/core` docs](/packages/core/README.md)

| Type      | Required | Default |
| --------- | -------- | ------- |
| `boolean` | no       | `false` |

#### autoReady

Trigger or not automatically call `Telegram.WebApp.ready()` on app load. If you want
manually call `ready()`, set this option to `false`.

| Type      | Required | Default |
| --------- | -------- | ------- |
| `boolean` | no       | `true`  |

## Hooks

### useTelegramWebApp

Returns ready to use `Telegram` instance, no additional options available.
