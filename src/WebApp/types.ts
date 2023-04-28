import { TELEGRAM_THEME } from '.';
import { ValueOf } from '../types';
import { HEADER_COLOR_KEYS } from './constants';

export type HeaderBgColor = ValueOf<typeof HEADER_COLOR_KEYS>;

export type ColorSchemes = typeof TELEGRAM_THEME.COLOR_SCHEMES;
export type ColorScheme = ValueOf<ColorSchemes>;
export type WebViewEvent =
  | 'themeChanged'
  | 'viewportChanged'
  | 'backButtonClicked'
  | 'mainButtonClicked'
  | 'settingsButtonClicked'
  | 'invoiceClosed'
  | 'popupClosed'
  | 'qrTextReceived'
  | 'clipboardTextReceived';
export interface WebViewEventParams {
  isStateStable?: boolean | undefined;
  url?: string | undefined;
  status?: string | undefined;
  button_id?: string | null | undefined;
  data?: any | undefined;
}
