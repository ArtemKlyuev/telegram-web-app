import { ValueOf } from '../types';
import { COLOR_SCHEMES, HEADER_COLOR_KEYS } from './constants';

export type HeaderBgColor = ValueOf<typeof HEADER_COLOR_KEYS>;

export type ColorSchemes = typeof COLOR_SCHEMES;
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
