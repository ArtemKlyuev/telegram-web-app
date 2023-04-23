export type ValueOf<T> = T[keyof T];
/**
 * color in `#RRGGBB` format
 */
export type HexColor = string;
export type AnyCallback = (...args: any[]) => any;
export type NoParamsCallback = () => any;
export type Nullable<T> = T | null | undefined;

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
  text?: Nullable<string>;
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
  color?: Nullable<HexColor | false>;
  text_color?: Nullable<HexColor | false>;
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

export type ColorScheme = 'light' | 'dark';

/**
 * @see https://core.telegram.org/bots/webapps#events-available-for-web-apps
 */
export type WebAppEvent =
  | 'themeChanged'
  | 'viewportChanged'
  | 'mainButtonClicked'
  | 'backButtonClicked'
  | 'settingsButtonClicked'
  | 'invoiceClosed'
  | 'popupClosed'
  | 'qrTextReceived'
  | 'clipboardTextReceived';

export interface ViewportChangedCallbackData {
  isStateStable: boolean;
}

export interface InvoiceClosedCallbackData {
  url: string;
  status: InvoiceStatus;
}

export interface PopupClosedCallbackData {
  button_id: string | null;
}

export interface QrTextReceivedCallbackData {
  data: string | null;
}

export interface ClipboardTextReceivedCallbackData {
  data: string | null;
}

/**
 * @see https://core.telegram.org/bots/webapps#events-available-for-web-apps
 */
export type InvoiceStatus = 'paid' | 'cancelled' | 'failed' | 'pending';

/**
 * @see https://core.telegram.org/bots/webapps#initializing-web-apps
 */
export type ChatType = 'users' | 'bots' | 'groups' | 'channels';

/**
 * @see https://core.telegram.org/bots/webapps#initializing-web-apps
 */
export type ChatTypesToChoose =
  | [ChatType]
  | [ChatType, ChatType]
  | [ChatType, ChatType, ChatType]
  | [ChatType, ChatType, ChatType, ChatType];

export interface OpenLinkOptions {
  try_instant_view: boolean;
}

export type OpenInvoiceCallback = (status: InvoiceStatus) => any;
export type ShowPopupCallback = (id: string) => any;
export type ShowConfirmCallback = (isOkPressed: boolean) => any;
export type ShowScanQrPopupCallback = (text: string | null) => boolean;
export type ReadTextFromClipboardCallback = (text: string | null) => any;

/**
 * @see https://core.telegram.org/bots/webapps#initializing-web-apps
 */
export interface WebApp {
  readonly initData: string;
  readonly initDataUnsafe: WebAppInitData;
  readonly version: string;
  readonly platform: string;
  readonly colorScheme: ColorScheme;
  readonly themeParams: ThemeParams;
  readonly isExpanded: boolean;
  readonly viewportHeight: number;
  readonly viewportStableHeight: number;
  /**
   * @throws {Error} Throwable setter if app version is not suitable with bot api version
   * or color is invalid
   */
  headerColor: HexColor;
  backgroundColor: HexColor;
  isClosingConfirmationEnabled: boolean;
  readonly BackButton: BackButton;
  readonly MainButton: MainButton;
  readonly HapticFeedback: HapticFeedback;
  isVersionAtLeast: (version: string) => boolean;
  /**
   * @throws {Error} If app version is not suitable with bot api version or `color` param is invalid
   */
  setHeaderColor: (color: HexColor) => void | never;
  /**
   * @throws {Error} If app version is not suitable with bot api version
   */
  setBackgroundColor: (color: HexColor) => void | never;
  /**
   * @throws {Error} If app version is not suitable with bot api version
   */
  enableClosingConfirmation: () => void | never;
  /**
   * @throws {Error} If app version is not suitable with bot api version
   */
  disableClosingConfirmation: () => void | never;
  onEvent(eventType: 'themeChanged', eventHandler: NoParamsCallback): void;
  onEvent(
    eventType: 'viewportChanged',
    eventHandler: (data: ViewportChangedCallbackData) => any
  ): void;
  onEvent(eventType: 'mainButtonClicked', eventHandler: NoParamsCallback): void;
  onEvent(eventType: 'backButtonClicked', eventHandler: NoParamsCallback): void;
  onEvent(eventType: 'settingsButtonClicked', eventHandler: NoParamsCallback): void;
  onEvent(eventType: 'invoiceClosed', eventHandler: (data: InvoiceClosedCallbackData) => any): void;
  onEvent(eventType: 'popupClosed', eventHandler: (data: PopupClosedCallbackData) => any): void;
  onEvent(
    eventType: 'qrTextReceived',
    eventHandler: (data: QrTextReceivedCallbackData) => any
  ): void;
  onEvent(
    eventType: 'clipboardTextReceived',
    eventHandler: (data: ClipboardTextReceivedCallbackData) => any
  ): void;
  offEvent(eventType: 'themeChanged', eventHandler: NoParamsCallback): void;
  offEvent(
    eventType: 'viewportChanged',
    eventHandler: (data: ViewportChangedCallbackData) => any
  ): void;
  offEvent(eventType: 'mainButtonClicked', eventHandler: NoParamsCallback): void;
  offEvent(eventType: 'backButtonClicked', eventHandler: NoParamsCallback): void;
  offEvent(eventType: 'settingsButtonClicked', eventHandler: NoParamsCallback): void;
  offEvent(
    eventType: 'invoiceClosed',
    eventHandler: (data: InvoiceClosedCallbackData) => any
  ): void;
  offEvent(eventType: 'popupClosed', eventHandler: (data: PopupClosedCallbackData) => any): void;
  offEvent(
    eventType: 'qrTextReceived',
    eventHandler: (data: QrTextReceivedCallbackData) => any
  ): void;
  offEvent(
    eventType: 'clipboardTextReceived',
    eventHandler: (data: ClipboardTextReceivedCallbackData) => any
  ): void;
  /**
   * @throws {Error} If data is not provided or data is too long
   */
  sendData: (data: string) => void | never;
  /**
   * @throws {Error} If app version is not suitable with bot api version or bot is not in
   * inline mode
   */
  switchInlineQuery: (query: string, chatTypes?: Nullable<ChatTypesToChoose>) => void | never;
  /**
   * @throws {Error} If app version is not suitable with bot api version or url is invalid
   */
  openLink: (url: string, options?: Nullable<OpenLinkOptions>) => void | never;
  /**
   * @throws {Error} If app version is not suitable with bot api version or url is invalid
   */
  openTelegramLink: (url: string) => void | never;
  /**
   * @throws {Error} If app version is not suitable with bot api version or invoice is
   * already opened or url is invalid
   */
  openInvoice: (url: string, callback?: Nullable<OpenInvoiceCallback>) => void | never;
  /**
   * @throws {Error} If app version is not suitable with bot api version or popup is
   * already opened or params are invalid
   */
  showPopup: (params: PopupParams, callback?: Nullable<ShowPopupCallback>) => void | never;
  /**
   * @throws {Error} If app version is not suitable with bot api version or popup is
   * already opened or params are invalid
   */
  showAlert: (message: string, callback?: Nullable<NoParamsCallback>) => void | never;
  /**
   * @throws {Error} If app version is not suitable with bot api version or popup is
   * already opened or params are invalid
   */
  showConfirm: (message: string, callback?: Nullable<ShowConfirmCallback>) => void | never;
  /**
   * @throws {Error} If app version is not suitable with bot api version
   */
  showScanQrPopup: (
    params: ScanQrPopupParams,
    callback?: Nullable<ShowScanQrPopupCallback>
  ) => void | never;
  /**
   * @throws {Error} If app version is not suitable with bot api version
   */
  closeScanQrPopup: () => void | never;
  /**
   * @throws {Error} If app version is not suitable with bot api version
   */
  readTextFromClipboard: (callback?: Nullable<ReadTextFromClipboardCallback>) => void | never;
  ready: () => void;
  expand: () => void;
  close: () => void;
}
