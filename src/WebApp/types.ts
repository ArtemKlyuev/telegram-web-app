import { NoParamsCallback } from '../types';
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
/**
 * @see https://core.telegram.org/bots/webapps#themeparams
 */
export interface ThemeParams {
  bg_color?: HexColor | undefined;
  secondary_bg_color?: HexColor | undefined;
  text_color?: HexColor | undefined;
  hint_color?: HexColor | undefined;
  link_color?: HexColor | undefined;
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

export type VisibleButtonParams = MainButtonParams & { is_visible: true };
export type InvisibleButtonParams = { is_visible: false };

/**
 * @see https://core.telegram.org/bots/webapps#webappuser
 */
export interface WebAppUser {
  id: number;
  first_name: string;
  is_bot?: boolean | undefined;
  last_name?: string | undefined;
  username?: string | undefined;
  language_code?: string | undefined;
  is_premium?: boolean | undefined;
  photo_url?: string | undefined;
}

/**
 * @see https://core.telegram.org/bots/webapps#webappchat
 */
export interface WebAppChat {
  id: number;
  type: 'group' | 'supergroup' | 'channel';
  title: string;
  username?: string | undefined;
  photo_url?: string | undefined;
}

/**
 * @see https://core.telegram.org/bots/webapps#webappinitdata
 */
export interface WebAppInitData {
  auth_date: number;
  hash: string;
  query_id?: string | undefined;
  user?: WebAppUser | undefined;
  receiver?: WebAppUser | undefined;
  chat?: WebAppChat | undefined;
  start_param?: string | undefined;
  can_send_after?: number | undefined;
}

export type PopupButtonType = 'default' | 'ok' | 'close' | 'cancel' | 'destructive';

export interface PopupButton {
  id?: string | undefined;
  type?: PopupButtonType | undefined;
  text?: string | undefined;
}

export type PopupButtonsSet =
  | [PopupButton]
  | [PopupButton, PopupButton]
  | [PopupButton, PopupButton, PopupButton];

/**
 * @see https://core.telegram.org/bots/webapps#popupparams
 */
export interface PopupParams {
  title?: string | undefined;
  message: string;
  buttons?: PopupButtonsSet | undefined;
}

export type ScanQrCallback = (text: string | null) => boolean;

/**
 * @see https://core.telegram.org/bots/webapps#scanqrpopupparams
 */
export interface ScanQrPopupParams {
  text?: string | undefined;
}

/**
 * @see https://core.telegram.org/bots/webapps#backbutton
 */
export interface BackButton {
  readonly isVisible: boolean;
  onClick: (callback: NoParamsCallback) => BackButton;
  offClick: (callback: NoParamsCallback) => BackButton;
  show: () => BackButton;
  hide: () => BackButton;
}
