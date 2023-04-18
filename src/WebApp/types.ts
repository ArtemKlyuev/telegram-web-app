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
  button_id?: string | undefined;
  data?: any | undefined;
}
export interface ThemeParams {
  bg_color?: HexColor | undefined;
  secondary_bg_color?: HexColor | undefined;
  button_color?: HexColor | undefined;
  button_text_color?: HexColor | undefined;
}

export interface NullableMainButtonParams {
  is_visible?: boolean | undefined;
  is_active?: boolean | undefined;
  text?: string | undefined;
  is_progress_visible?: boolean | undefined;
  color?: HexColor | false | null | undefined;
  text_color?: HexColor | false | null | undefined;
}

type ToNonFalsyRequired<Obj, K extends keyof Obj = keyof Obj> = Required<{
  [key in K]: NonNullable<Obj[K]>;
}>;

export type MainButtonParams = ToNonFalsyRequired<
  Omit<NullableMainButtonParams, 'text' | 'color' | 'text_color'>
> & {
  text: string;
  color: HexColor;
  text_color: HexColor;
};
