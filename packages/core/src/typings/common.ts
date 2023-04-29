import { Nullable } from './utils';

export interface TelegramOptions {
  exposeInMainWorld?: Nullable<boolean>;
}

/**
 * color in `#RRGGBB` format
 */
export type HexColor = string;

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
 * @see https://core.telegram.org/bots/webapps#scanqrpopupparams
 */
export interface ScanQrPopupParams {
  text?: Nullable<string>;
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
export interface PopupButtonWithOptionalText {
  id: string;
  type: 'ok' | 'close' | 'cancel';
  text?: string | undefined;
}

export type EventPopupButton = PopupButtonWithRequiredText | PopupButtonWithOptionalText;

/**
 * @see https://core.telegram.org/api/web-events#web-app-open-popup
 */
export type EventPopupButtonsSet =
  | [EventPopupButton]
  | [EventPopupButton, EventPopupButton]
  | [EventPopupButton, EventPopupButton, EventPopupButton];

export type HapticFeedbackType = 'impact' | 'notification' | 'selection_change';

/**
 * @see https://core.telegram.org/bots/webapps#hapticfeedback
 */
export type HapticFeedbackImpactStyle = 'light' | 'medium' | 'heavy' | 'rigid' | 'soft';

/**
 * @see https://core.telegram.org/bots/webapps#hapticfeedback
 */
export type HapticFeedbackNotification = 'error' | 'success' | 'warning';
