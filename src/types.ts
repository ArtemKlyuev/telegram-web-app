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

export type HapticFeedbackType = 'impact' | 'notification' | 'selection_change';

/**
 * @see https://core.telegram.org/bots/webapps#hapticfeedback
 */
export type HapticFeedbackImpactStyle = 'light' | 'medium' | 'heavy' | 'rigid' | 'soft';

/**
 * @see https://core.telegram.org/bots/webapps#hapticfeedback
 */
export type HapticFeedbackNotification = 'error' | 'success' | 'warning';

/**
 * @see https://core.telegram.org/bots/webapps#hapticfeedback
 */
export interface HapticFeedback {
  impactOccurred: (style: HapticFeedbackImpactStyle) => HapticFeedback;
  notificationOccurred: (type: HapticFeedbackNotification) => HapticFeedback;
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

// WebView stuff

/**
 * @see https://core.telegram.org/api/web-events#event-types
 */
export type WebViewEvent =
  | 'web_app_ready'
  | 'web_app_expand'
  | 'web_app_close'
  | 'web_app_open_popup'
  | 'web_app_setup_closing_behavior'
  | 'web_app_set_background_color'
  | 'web_app_set_header_color'
  | 'web_app_data_send'
  | 'web_app_trigger_haptic_feedback'
  | 'web_app_open_link'
  | 'web_app_open_tg_link'
  | 'web_app_open_invoice'
  | 'web_app_request_viewport'
  | 'web_app_request_theme'
  | 'web_app_setup_main_button'
  | 'web_app_setup_back_button'
  | 'web_app_open_scan_qr_popup'
  | 'web_app_close_scan_qr_popup'
  | 'web_app_read_text_from_clipboard'
  | 'web_app_switch_inline_query'
  | 'payment_form_submit'
  | 'share_score'
  | 'share_game'
  | 'game_over'
  | 'game_loaded'
  | 'resize_frame';

export type EventPopupButton = PopupButtonWithRequiredText | PopupButtonWithOptionalText;

/**
 * @see https://core.telegram.org/api/web-events#web-app-open-popup
 */
export interface PopupButtonWithRequiredText {
  id: string;
  type: 'default' | 'destructive';
  text: string;
}

/**
 * @see https://core.telegram.org/api/web-events#web-app-open-popup
 */
export type EventPopupButtonsSet =
  | [EventPopupButton]
  | [EventPopupButton, EventPopupButton]
  | [EventPopupButton, EventPopupButton, EventPopupButton];

/**
 * @see https://core.telegram.org/api/web-events#web-app-open-popup
 */
export interface PopupButtonWithOptionalText {
  id: string;
  type: 'ok' | 'close' | 'cancel';
  text?: string | undefined;
}

export interface OpenPopupEventData {
  title: string;
  message: string;
  buttons: EventPopupButtonsSet;
}

export interface SetupClosingBehaviorEventData {
  need_confirmation: boolean;
}

export interface SetBackgroundColorEventData {
  color: HexColor;
}

export interface SetHeaderColorEventData {
  color_key: 'bg_color' | 'secondary_bg_color';
}

export interface DataSendEventData {
  data: string;
}

export interface TriggerHapticFeedbackEventData {
  type: HapticFeedbackType;
  impact_style: HapticFeedbackImpactStyle;
  notification_type: HapticFeedbackNotification;
}

export interface OpenLinkEventData {
  url: string;
}

export interface OpenTgLinkEventData {
  path_full: string;
}

export interface OpenInvoiceEventData {
  slug: string;
}

/**
 * @see https://core.telegram.org/api/web-events#web-app-setup-main-button
 */
export interface SetupMainButtonEventData {
  is_visible: boolean;
  is_active: boolean;
  text: string;
  color: HexColor;
  text_color: HexColor;
  is_progress_visible: boolean;
}

/**
 * @see https://core.telegram.org/api/web-events#web-app-setup-back-button
 */
export interface SetupBackButtonEventData {
  is_visible: boolean;
}

export interface RedTextFromClipboardEventData {
  req_id: string;
}

export interface SwitchInlineQueryEventData {
  query: string;
  chat_types: ChatType[];
}

/**
 * @see https://core.telegram.org/api/web-events#payment-form-submit
 */
export interface PaymentFormSubmitEventData {
  title: string;
  credentials: any;
}

/**
 * @see https://core.telegram.org/api/web-events#resize-frame
 */
export interface ResizeFrameEventData {
  height: any;
}

export interface PostEventCallbackData {
  notAvailable: true;
}

export type PostEventCallback = (arg?: Nullable<PostEventCallbackData | Error>) => any;
export type CallEventCallbackHandler = (cb: AnyCallback) => any;

export interface WebView {
  postEvent(event: 'web_app_ready', callback?: Nullable<PostEventCallback>): void;
  postEvent(event: 'web_app_expand', callback?: Nullable<PostEventCallback>): void;
  postEvent(event: 'web_app_close', callback?: Nullable<PostEventCallback>): void;
  postEvent(
    event: 'web_app_open_popup',
    callback: Nullable<PostEventCallback>,
    data: OpenPopupEventData
  ): void;
  postEvent(
    event: 'web_app_setup_closing_behavior',
    callback: Nullable<PostEventCallback>,
    data: SetupClosingBehaviorEventData
  ): void;
  postEvent(
    event: 'web_app_set_background_color',
    callback: Nullable<PostEventCallback>,
    data: SetBackgroundColorEventData
  ): void;
  postEvent(
    event: 'web_app_set_header_color',
    callback: Nullable<PostEventCallback>,
    data: SetHeaderColorEventData
  ): void;
  postEvent(
    event: 'web_app_data_send',
    callback: Nullable<PostEventCallback>,
    data: DataSendEventData
  ): void;
  postEvent(
    event: 'web_app_trigger_haptic_feedback',
    callback: Nullable<PostEventCallback>,
    data: TriggerHapticFeedbackEventData
  ): void;
  postEvent(
    event: 'web_app_open_link',
    callback: Nullable<PostEventCallback>,
    data: OpenLinkEventData
  ): void;
  postEvent(
    event: 'web_app_open_tg_link',
    callback: Nullable<PostEventCallback>,
    data: OpenTgLinkEventData
  ): void;
  postEvent(
    event: 'web_app_open_invoice',
    callback: Nullable<PostEventCallback>,
    data: OpenInvoiceEventData
  ): void;
  postEvent(event: 'web_app_request_viewport', callback?: Nullable<PostEventCallback>): void;
  postEvent(event: 'web_app_request_theme', callback?: Nullable<PostEventCallback>): void;
  postEvent(
    event: 'web_app_setup_main_button',
    callback: Nullable<PostEventCallback>,
    data: SetupMainButtonEventData
  ): void;
  postEvent(
    event: 'web_app_setup_back_button',
    callback: Nullable<PostEventCallback>,
    data: SetupBackButtonEventData
  ): void;
  postEvent(
    event: 'web_app_open_scan_qr_popup',
    callback: Nullable<PostEventCallback>,
    data: ScanQrPopupParams
  ): void;
  postEvent(event: 'web_app_close_scan_qr_popup', callback?: Nullable<PostEventCallback>): void;
  postEvent(
    event: 'web_app_read_text_from_clipboard',
    callback: Nullable<PostEventCallback>,
    data: RedTextFromClipboardEventData
  ): void;
  postEvent(
    event: 'web_app_switch_inline_query',
    callback: Nullable<PostEventCallback>,
    data: SwitchInlineQueryEventData
  ): void;
  postEvent(
    event: 'payment_form_submit',
    callback: Nullable<PostEventCallback>,
    data: PaymentFormSubmitEventData
  ): void;
  postEvent(event: 'share_score', callback?: Nullable<PostEventCallback>): void;
  postEvent(event: 'share_game', callback?: Nullable<PostEventCallback>): void;
  postEvent(event: 'game_over', callback?: Nullable<PostEventCallback>): void;
  postEvent(event: 'game_loaded', callback?: Nullable<PostEventCallback>): void;
  postEvent(
    event: 'resize_frame',
    callback: Nullable<PostEventCallback>,
    data: ResizeFrameEventData
  ): void;
  onEvent: (event: string, callback: AnyCallback) => void;
  offEvent: (event: string, callback: AnyCallback) => void;
  callEventCallbacks: (eventType: string, func: CallEventCallbackHandler) => void;
  receiveEvent: (eventType: string, eventData: any) => void;
}
