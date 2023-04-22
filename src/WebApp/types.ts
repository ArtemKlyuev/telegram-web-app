import { MainButtonParams } from '../types';
import { HexColor, ValueOf } from '../types';
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

type ToNonFalsyRequired<Obj, K extends keyof Obj = keyof Obj> = Required<{
  [key in K]: NonNullable<Obj[K]>;
}>;

export type RequiredMainButtonParams = ToNonFalsyRequired<
  Omit<MainButtonParams, 'text' | 'color' | 'text_color'>
> & {
  text: string;
  color: HexColor;
  text_color: HexColor;
};

export type VisibleButtonParams = RequiredMainButtonParams & { is_visible: true };
export type InvisibleButtonParams = { is_visible: false };

export type ScanQrCallback = (text: string | null) => boolean;
