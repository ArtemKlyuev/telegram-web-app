export type ValueOf<T> = T[keyof T];
/**
 * color in `#RRGGBB` format
 */
export type HexColor = string;
export type AnyCallback = (...args: any[]) => any;
export type NoParamsCallback = () => any;

export interface InitParams {
  /**
   * raw data in string format
   */
  tgWebAppData?: string | undefined;
  /**
   * raw theme object in string format
   */
  tgWebAppThemeParams?: string | undefined;
  tgWebAppVersion?: string | undefined;
  tgWebAppPlatform?: string | undefined;
  tgWebAppDebug?: boolean | undefined;
  tgWebAppBotInline?: boolean | undefined;
  _path?: string | undefined;
  [key: string]: any;
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

/**
 * @see https://core.telegram.org/bots/webapps#popupbutton
 */
export type PopupButtonType = 'default' | 'ok' | 'close' | 'cancel' | 'destructive';

/**
 * @see https://core.telegram.org/bots/webapps#popupbutton
 */
export interface PopupButton {
  id?: string | undefined;
  type?: PopupButtonType | undefined;
  text?: string | undefined;
}

/**
 * @see https://core.telegram.org/bots/webapps#popupbutton
 */
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
  isVisible: boolean;
  onClick: (callback: NoParamsCallback) => BackButton;
  offClick: (callback: NoParamsCallback) => BackButton;
  show: () => BackButton;
  hide: () => BackButton;
}

/**
 * @see https://core.telegram.org/bots/webapps#mainbutton
 */
export interface MainButtonParams {
  text?: string | undefined;
  color?: HexColor | false | null | undefined;
  text_color?: HexColor | false | null | undefined;
  is_visible?: boolean | undefined;
  is_active?: boolean | undefined;
  is_progress_visible?: boolean | undefined;
}

/**
 * @see https://core.telegram.org/bots/webapps#mainbutton
 */
export interface MainButton {
  text: string;
  color: HexColor;
  textColor: HexColor;
  isVisible: boolean;
  isActive: boolean;
  readonly isProgressVisible: boolean;
  setText: (text: string) => MainButton;
  onClick: (callback: NoParamsCallback) => MainButton;
  offClick: (callback: NoParamsCallback) => MainButton;
  show: () => MainButton;
  hide: () => MainButton;
  enable: () => MainButton;
  disable: () => MainButton;
  showProgress: (leaveActive: boolean) => MainButton;
  hideProgress: () => MainButton;
  setParams: (params: MainButtonParams) => MainButton;
}

export interface EnhancedMainButton {
  readonly MAXIMUM_TEXT_LENGTH: number;
  readonly DEFAULT_COLOR: HexColor;
  readonly DEFAULT_TEXT_COLOR: HexColor;
}

/**
 * @see https://core.telegram.org/bots/webapps#hapticfeedback
 */
export type ImpactStyle = 'light' | 'medium' | 'heavy' | 'rigid' | 'soft';

/**
 * @see https://core.telegram.org/bots/webapps#hapticfeedback
 */
export type ImpactNotification = 'error' | 'success' | 'warning';

/**
 * @see https://core.telegram.org/bots/webapps#hapticfeedback
 */
export interface HapticFeedback {
  impactOccurred: (style: ImpactStyle) => HapticFeedback;
  notificationOccurred: (type: ImpactNotification) => HapticFeedback;
  selectionChanged: () => HapticFeedback;
}
