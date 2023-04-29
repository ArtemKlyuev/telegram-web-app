import {
  ChatType,
  EventPopupButtonsSet,
  HapticFeedbackImpactStyle,
  HapticFeedbackNotification,
  HexColor,
  InvoiceStatus,
  ScanQrPopupParams,
  ThemeParams,
} from './common';
import { AnyCallback, EventCallbackWithOptionalData, Nullable } from './utils';

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
  tgWebAppDebug?: string | undefined;
  tgWebAppBotInline?: '1' | '0' | undefined;
  _path?: string | undefined;
  [key: string]: any;
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

export interface OpenPopupEventData {
  title?: Nullable<string>;
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

/**
 * @see https://core.telegram.org/api/web-events#web-app-trigger-haptic-feedback
 */
export type TriggerHapticFeedbackEventData =
  | ImpactHapticFeedbackData
  | NotificationHapticFeedbackData
  | SelectionChangeHapticFeedbackData;

/**
 * @see https://core.telegram.org/api/web-events#web-app-trigger-haptic-feedback
 */
export interface ImpactHapticFeedbackData {
  type: 'impact';
  impact_style: HapticFeedbackImpactStyle;
}

/**
 * @see https://core.telegram.org/api/web-events#web-app-trigger-haptic-feedback
 */
export interface NotificationHapticFeedbackData {
  type: 'notification';
  notification_type: HapticFeedbackNotification;
}

/**
 * @see https://core.telegram.org/api/web-events#web-app-trigger-haptic-feedback
 */
export interface SelectionChangeHapticFeedbackData {
  type: 'selection_change';
}

/**
 * @see https://core.telegram.org/api/web-events#web-app-open-link
 */
export interface OpenLinkEventData {
  url: string;
  try_instant_view: boolean;
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
export type CallEventCallbackHandler<Callback extends AnyCallback> = (cb: Callback) => any;

/**
 * @see https://core.telegram.org/api/bots/webapps#invoice-closed
 */
export interface InvoiceClosedWebViewEventData {
  slug: string;
  status: InvoiceStatus;
}

/**
 * @see https://core.telegram.org/api/bots/webapps#viewport-changed
 */
export interface ViewportChangedWebViewEventData {
  height: number;
  is_state_stable: boolean;
  is_expanded: boolean;
}

/**
 * @see https://core.telegram.org/api/bots/webapps#theme-changed
 */
export interface ThemeChangedWebViewEventData {
  theme_params: Required<ThemeParams>;
}

/**
 * @see https://core.telegram.org/api/bots/webapps#popup-closed
 */
export interface PopupClosedWebViewEventData {
  button_id?: Nullable<string>;
}

export interface QrTextReceivedWebViewEventData {
  data?: Nullable<string>;
}

export interface ClipboardTextReceivedWebViewEventData {
  req_id?: Nullable<string>;
  data?: Nullable<string | ''>;
}

export interface ReceivedWebViewEventToData {
  main_button_pressed: undefined;
  settings_button_pressed: undefined;
  back_button_pressed: undefined;
  invoice_closed: InvoiceClosedWebViewEventData;
  viewport_changed: ViewportChangedWebViewEventData;
  theme_changed: ThemeChangedWebViewEventData;
  popup_closed: PopupClosedWebViewEventData;
  qr_text_received: QrTextReceivedWebViewEventData;
  scan_qr_popup_closed: undefined;
  clipboard_text_received: ClipboardTextReceivedWebViewEventData;
}

export interface WebView {
  readonly isIframe: boolean;
  readonly initParams: InitParams;
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
  onEvent: <Event extends keyof ReceivedWebViewEventToData = keyof ReceivedWebViewEventToData>(
    event: Event,
    callback: EventCallbackWithOptionalData<Event, ReceivedWebViewEventToData[Event]>
  ) => void;
  offEvent: <Event extends keyof ReceivedWebViewEventToData = keyof ReceivedWebViewEventToData>(
    event: Event,
    callback: EventCallbackWithOptionalData<Event, ReceivedWebViewEventToData[Event]>
  ) => void;
  callEventCallbacks: <
    Event extends keyof ReceivedWebViewEventToData = keyof ReceivedWebViewEventToData
  >(
    eventType: Event,
    func: CallEventCallbackHandler<
      EventCallbackWithOptionalData<Event, ReceivedWebViewEventToData[Event]>
    >
  ) => void;
  receiveEvent: <Event extends keyof ReceivedWebViewEventToData = keyof ReceivedWebViewEventToData>(
    eventType: Event,
    eventData: ReceivedWebViewEventToData[Event]
  ) => void;
}
